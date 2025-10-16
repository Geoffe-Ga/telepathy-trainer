export class SQLiteDatabase {
  execAsync = jest.fn();
  getAllAsync = jest.fn();
  getFirstAsync = jest.fn();
  runAsync = jest.fn();
  closeAsync = jest.fn();
}

export const openDatabaseAsync = jest.fn(async () => {
  return new SQLiteDatabase();
});
