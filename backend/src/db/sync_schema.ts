/**
 * RETIRED SCRIPT - DO NOT USE
 * 
 * Drizzle migrations (`./drizzle/*.sql` executed via `migrate()`) are now the single
 * source of schema truth for this project. Custom DDL sync scripts are retired.
 */
export async function ensureDatabaseSchema() {
  console.log("ℹ️ custom sync_schema script is retired. Using Drizzle migrations.");
}
