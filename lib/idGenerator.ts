import db from './db';

/**
 * Safely generate the next sequential ID for a table.
 * Finds the maximum ID and returns MAX+1, ensuring no duplicates.
 * If a duplicate is detected during insertion, will retry with the next available ID.
 */
export async function getNextId(table: string, idColumn: string): Promise<number> {
  const query = `SELECT MAX(${idColumn}) as maxId FROM ${table}`;
  const [results] = await db.execute(query);
  
  if (!results || !Array.isArray(results) || results.length === 0) {
    return 1;
  }
  
  const maxId = (results[0] as any).maxId;
  return (maxId || 0) + 1;
}

/**
 * Try to insert with the given ID, and if it fails due to duplicate,
 * automatically find the next available ID and insert.
 */
export async function insertWithAutoId(
  table: string,
  idColumn: string,
  columns: string[],
  values: any[]
): Promise<number> {
  let nextId = await getNextId(table, idColumn);
  let retries = 10; // Prevent infinite loops
  
  while (retries > 0) {
    try {
      const allColumns = [idColumn, ...columns];
      const allValues = [nextId, ...values];
      const placeholders = allColumns.map(() => '?').join(', ');
      
      await db.execute(
        `INSERT INTO ${table} (${allColumns.join(', ')}) VALUES (${placeholders})`,
        allValues
      );
      
      return nextId;
    } catch (error: any) {
      // Check if it's a duplicate key error
      if (error.errno === 1062 || error.code === 'ER_DUP_ENTRY') {
        nextId++;
        retries--;
        continue;
      }
      // For any other error, re-throw
      throw error;
    }
  }
  
  throw new Error(`Failed to generate unique ID after ${10 - retries} attempts`);
}
