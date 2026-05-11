import cron from "node-cron";
import Member from "../models/Member.js";
import Attendance from "../models/Attendance.js";
import Gym from "../models/Gym.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Expense from "../models/Expense.js";
import Gamification from "../models/Gamification.js";

// 🛡️ CRON OVERLAP GUARD
let isDeletionRunning = false;

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

    if (gymsToDelete.length > 0) {
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
    processGymDeletion();
  }, 5000);

  // Daily check for gym deletions at midnight
  cron.schedule("0 0 * * *", () => processGymDeletion());

  console.log("Automation Service Initialized (Daily Deletions Only)");
};
