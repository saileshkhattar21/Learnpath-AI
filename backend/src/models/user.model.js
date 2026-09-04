import pool from "../config/db.js";

export const findByAuthProviderId = async (authProviderId) => {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE auth_provider_id = $1",
    [authProviderId],
  );
  return rows[0];
};

export const create = async ({ auth_provider_id, name, email }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (auth_provider_id, name, email) VALUES ($1, $2, $3) RETURNING *`,
    [auth_provider_id, name || null, email || null],
  );
  return rows[0];
};
