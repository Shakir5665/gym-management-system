import dotenv from "dotenv";
import mongoose from "mongoose";
import * as m1 from "../migrations/20260428-member-legal-fields.js";
import * as m2 from "../migrations/20260428-create-expenses-collection.js";

dotenv.config();

const migrations = [m1, m2];

async function run() {
  const mongoDbName = process.env.MONGO_DB_NAME || "gymsystem";
  await mongoose.connect(process.env.MONGO_URI, { dbName: mongoDbName });

  const db = mongoose.connection.db;
  const migrationCol = db.collection("_migrations");

  for (const migration of migrations) {
    const already = await migrationCol.findOne({ id: migration.id });
    if (already) {
      // eslint-disable-next-line no-console
      console.log(`↷ skip ${migration.id}`);
      continue;
    }
    // eslint-disable-next-line no-console
    console.log(`→ run ${migration.id}`);
    await migration.up({ mongoose, db });
    await migrationCol.insertOne({ id: migration.id, ranAt: new Date() });
    // eslint-disable-next-line no-console
    console.log(`✓ done ${migration.id}`);
  }

  await mongoose.disconnect();
}

run().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error("Migration failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
