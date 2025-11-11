import { Pool } from "pg";

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT || "5432"),
});

export const query = (text: string, params?: unknown[]) =>
  pool.query(text, params);

export const connect = () => pool.connect();

export const end = () => pool.end();

export default { query, connect, end };
