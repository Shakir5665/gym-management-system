import cron from "node-cron";
import Member from "../models/Member.js";
import Attendance from "../models/Attendance.js";
import Gym from "../models/Gym.js";
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

export const initAutomation = (io) => {
  // Run immediately on startup for testing and to ensure it's up to date
  processChurnAutomation(io);

  // Hourly check
  cron.schedule("0 * * * *", () => processChurnAutomation(io));

  console.log("Automation Service Initialized (Hourly Churn Checks)");
};
