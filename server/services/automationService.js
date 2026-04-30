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
  console.log("Running Churn Automation Task...");
  try {
    const now = new Date();
    const tenDaysAgo = new Date(now);
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // 1. Find all members who haven't checked in for 10+ days 
    // AND haven't been sent a churn email in the last 3 days
    // AND have an email address
    const membersToNotify = await Member.find({
      email: { $exists: true, $ne: "" },
      $or: [
        { lastChurnEmailSent: { $exists: false } },
        { lastChurnEmailSent: { $lte: threeDaysAgo } }
      ]
    });

    console.log(`Checking ${membersToNotify.length} potential members for churn...`);

    for (const member of membersToNotify) {
      // Find their last attendance
      const lastAttendance = await Attendance.findOne({ memberId: member._id })
        .sort({ checkInTime: -1 });

      const lastCheckIn = lastAttendance ? new Date(lastAttendance.checkInTime) : new Date(member.createdAt);

      console.log(`- Member: ${member.name}, Last Checkin: ${lastCheckIn.toISOString()}, 10DaysAgo: ${tenDaysAgo.toISOString()}`);

      if (lastCheckIn < tenDaysAgo) {
        // High Churn Probability detected!
        console.log(`Sending encouragement to ${member.name} (${member.email})...`);

        // Fetch gym name for branding
        const gym = await Gym.findById(member.gymId);
        const gymName = gym?.name || "Your Gym";

        try {
          await sendChurnEncouragement(member.email, {
            memberName: member.name || member.fullLegalName,
            gymName
          });

          // Update the last sent date
          member.lastChurnEmailSent = new Date();
          await member.save();
          console.log(`Email sent to ${member.name}`);

          // Emit notification event
          if (io) {
            io.emit("notification:churn-email", {
              memberId: member._id,
              memberName: member.name || member.fullLegalName,
            });
          }
        } catch (mailErr) {
          console.error(`Failed to send email to ${member.name}:`, mailErr.message);
        }
      }
    }
    console.log("Churn Automation Task Completed.");
  } catch (err) {
    console.error("Churn Automation Error:", err.message);
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
  // Run immediately on startup for testing and to ensure it's up to date
  processChurnAutomation(io);
  processGymDeletion();

  // Hourly check
  cron.schedule("0 * * * *", () => processChurnAutomation(io));

  // Daily check for gym deletions at midnight
  cron.schedule("0 0 * * *", () => processGymDeletion());

  console.log("Automation Service Initialized (Hourly Churn & Daily Deletions)");
};
