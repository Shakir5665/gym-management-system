import cron from "node-cron";
import Member from "../models/Member.js";


cron.schedule("* * * * *", async () => {
  console.log("⏰ Cron running...");

  try {
    const members = await Member.find();

    members.forEach((m) => {
      if (!m.subscriptionEnd) return;

      const diff =
        (m.subscriptionEnd - new Date()) / (1000 * 60 * 60 * 24);

      if (diff <= 3 && diff > 0) {
        console.log(`📢 Reminder: ${m.name}`);
      }
    });
  } catch (err) {
    console.log("Cron error:", err.message); 
  }
});