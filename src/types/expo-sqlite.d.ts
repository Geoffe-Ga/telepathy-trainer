declare module 'expo-sqlite' {
  export interface SQLiteDatabase {
    execAsync(source: string): Promise<void>;
    getAllAsync<T>(source: string, params?: unknown[]): Promise<T[]>;
    getFirstAsync<T>(source: string, params?: unknown[]): Promise<T | null>;
    runAsync(source: string, params?: unknown[]): Promise<{ changes: number; lastInsertRowId: number }>;
    closeAsync(): Promise<void>;
  }

  export function openDatabaseAsync(databaseName: string): Promise<SQLiteDatabase>;
}
