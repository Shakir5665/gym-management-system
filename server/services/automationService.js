import cron from "node-cron";
import Member from "../models/Member.js";
import Attendance from "../models/Attendance.js";
import Gym from "../models/Gym.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Expense from "../models/Expense.js";
import Gamification from "../models/Gamification.js";
import { sendChurnEncouragement } from "./mailService.js";

// 🛡️ CRON OVERLAP GUARD: Prevents the job from running twice simultaneously
let isChurnRunning = false;
let isDeletionRunning = false;

const processChurnAutomation = async (io) => {
  // 🛡️ If a previous run is still in progress, skip this cycle
  if (isChurnRunning) {
    console.log("⏩ Churn job already running. Skipping this cycle.");
    return;
  }
  isChurnRunning = true;
  const startTime = Date.now();
  console.log("🚀 Starting Optimized Churn Automation...");
  try {
    const now = new Date();
    const tenDaysAgo = new Date(now);
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // 1. Fetch only members who are eligible for a notification (subset)
    const membersToNotify = await Member.find({
      email: { $exists: true, $ne: "" },
      $or: [
        { lastChurnEmailSent: { $exists: false } },
        { lastChurnEmailSent: { $lte: threeDaysAgo } }
      ]
    }).select("name email fullLegalName gymId lastChurnEmailSent createdAt").lean();

    if (membersToNotify.length === 0) {
      console.log("✅ No members eligible for churn check.");
      return;
    }

    console.log(`🔍 Checking ${membersToNotify.length} members for inactivity...`);

    // ⚡ BATCH LOAD: Pre-fetch all gyms and attendances to eliminate N+1 queries
    const uniqueGymIds = [...new Set(membersToNotify.map(m => m.gymId?.toString()).filter(Boolean))];
    const uniqueMemberIds = membersToNotify.map(m => m._id);

    const [gyms, lastAttendances] = await Promise.all([
      Gym.find({ _id: { $in: uniqueGymIds } }).select('name').lean(),
      Attendance.aggregate([
        { $match: { memberId: { $in: uniqueMemberIds }, status: 'SUCCESS' } },
        { $sort: { checkInTime: -1 } },
        { $group: { _id: '$memberId', lastCheckIn: { $first: '$checkInTime' } } }
      ])
    ]);

    // Build lookup maps for O(1) access inside the loop
    const gymMap = new Map(gyms.map(g => [g._id.toString(), g.name]));
    const attendanceMap = new Map(lastAttendances.map(a => [a._id.toString(), a.lastCheckIn]));

    let sentCount = 0;
    // Process in smaller batches to avoid blocking the event loop
    for (const member of membersToNotify) {
      const lastCheckIn = attendanceMap.get(member._id.toString()) 
        ? new Date(attendanceMap.get(member._id.toString())) 
        : new Date(member.createdAt);

      if (lastCheckIn < tenDaysAgo) {
        const gymName = gymMap.get(member.gymId?.toString()) || 'Your Gym';

        try {
          // ⏱️ EMAIL TIMEOUT: If email takes > 10 seconds, skip it (don't hang the loop)
          await Promise.race([
            sendChurnEncouragement(member.email, {
              memberName: member.name || member.fullLegalName,
              gymName
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Email timeout')), 10000))
          ]);

          await Member.updateOne({ _id: member._id }, { $set: { lastChurnEmailSent: new Date() } });
          sentCount++;

          if (io) {
            io.emit('notification:churn-email', {
              memberId: member._id,
              memberName: member.name || member.fullLegalName,
            });
          }
        } catch (mailErr) {
          console.error(`❌ Mail Error for ${member.name}:`, mailErr.message);
        }
      }
    }
    console.log(`✅ Churn Automation Completed in ${Date.now() - startTime}ms. Emails sent: ${sentCount}`);
  } catch (err) {
    console.error("❌ Churn Automation Error:", err.message);
  } finally {
    // 🛡️ Always release the lock, even if an error occurred
    isChurnRunning = false;
  }
};

const processGymDeletion = async () => {
  // 🛡️ Prevent overlap on deletion jobs
  if (isDeletionRunning) {
    console.log("⏩ Deletion job already running. Skipping this cycle.");
    return;
  }
  isDeletionRunning = true;
  console.log("Running Gym Deletion Task...");
  try {
    const now = new Date();
    // Find gyms scheduled for deletion that have passed their date
    const gymsToDelete = await Gym.find({
      scheduledDeletionAt: { $ne: null, $lte: now }
    });

    console.log(`Found ${gymsToDelete.length} gyms to permanently delete.`);

    for (const gym of gymsToDelete) {
      const gymId = gym._id;
      console.log(`Permanently deleting gym: ${gym.name} (${gymId})`);

      // 1. Delete all related data in parallel
      await Promise.all([
        Attendance.deleteMany({ gymId }),
        Member.deleteMany({ gymId }),
        Payment.deleteMany({ gymId }),
        Expense.deleteMany({ gymId }),
        Gamification.deleteMany({ gymId }),
        User.deleteMany({ gymId }), // This deletes the owner and any potential staff
      ]);

      // 2. Finally delete the gym record itself
      await Gym.findByIdAndDelete(gymId);
      console.log(`Gym ${gym.name} deleted successfully.`);
    }
  } catch (err) {
    console.error("Gym Deletion Error:", err.message);
  } finally {
    // 🛡️ Always release the lock
    isDeletionRunning = false;
  }
};

export const initAutomation = (io) => {
  // Run in background after 5s to avoid blocking the server startup
  setTimeout(() => {
    processChurnAutomation(io);
    processGymDeletion();
  }, 5000);

  // Hourly check
  cron.schedule("0 * * * *", () => processChurnAutomation(io));

  // Daily check for gym deletions at midnight
  cron.schedule("0 0 * * *", () => processGymDeletion());

  console.log("Automation Service Initialized (Hourly Churn & Daily Deletions)");
};
