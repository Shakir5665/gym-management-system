export const id = "20260428-member-legal-fields";

export async function up({ mongoose }) {
  const db = mongoose.connection.db;
  const members = db.collection("members");

  await members.updateMany(
    { $or: [{ fullLegalName: { $exists: false } }, { fullLegalName: null }, { fullLegalName: "" }] },
    [{ $set: { fullLegalName: { $ifNull: ["$name", ""] } } }],
  );

  await members.createIndex({ gymId: 1, fullLegalName: 1 });
}
