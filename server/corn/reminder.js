import cron from "node-cron";
import Member from "../models/Member.js";

cron.schedule("0 0 * * *", async () => {
  const now = new Date();

  const members = await Member.find();

  members.forEach(member => {
    if (!member.subscriptionEnd) return;

    const diff = (member.subscriptionEnd - now) / (1000 * 60 * 60 * 24);

    if (diff <= 3 && diff > 0) {
      console.log(`Reminder: ${member.name} subscription expiring soon`);
    }
  });
});