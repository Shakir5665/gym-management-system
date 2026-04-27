export const id = "20260428-create-expenses-collection";

export async function up({ mongoose }) {
  const db = mongoose.connection.db;
  const collections = await db.listCollections({ name: "expenses" }).toArray();
  if (!collections.length) {
    await db.createCollection("expenses");
  }
  const expenses = db.collection("expenses");
  await expenses.createIndex({ gymId: 1, spentAt: -1 });
}
