import cron from "node-cron";
import Member from "../models/Member.js";
import Attendance from "../models/Attendance.js";
import Gym from "../models/Gym.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Expense from "../models/Expense.js";
import Gamification from "../models/Gamification.js";
import { sendChurnEncouragement } from "./mailService.js";

const processChurnAutomation = async (io) => {
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

    let sentCount = 0;
    // Process in smaller batches to avoid blocking the event loop
    for (const member of membersToNotify) {
      const lastAttendance = await Attendance.findOne({ memberId: member._id })
        .sort({ checkInTime: -1 })
        .select("checkInTime")
        .lean();

      const lastCheckIn = lastAttendance ? new Date(lastAttendance.checkInTime) : new Date(member.createdAt);

      if (lastCheckIn < tenDaysAgo) {
        // Fetch gym name efficiently
        const gym = await Gym.findById(member.gymId).select("name").lean();
        const gymName = gym?.name || "Your Gym";

        try {
          await sendChurnEncouragement(member.email, {
            memberName: member.name || member.fullLegalName,
            gymName
          });

          await Member.updateOne({ _id: member._id }, { $set: { lastChurnEmailSent: new Date() } });
          sentCount++;

          if (io) {
            io.emit("notification:churn-email", {
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
  }
};

const processGymDeletion = async () => {
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
