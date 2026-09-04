import app from "./app.js";
import pool from "./config/db.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await pool.query("SELECT 1");
    console.log(`Server running on port ${PORT}, DB reachable`);
  } catch (err) {
    console.error("DB not reachable:", err.message);
  }
});
