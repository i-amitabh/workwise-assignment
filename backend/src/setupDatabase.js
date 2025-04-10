import pool from "./db.js";

const setupDatabase = async () => {
  try {
    // Create users table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          email VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(50) NOT NULL
        );
      `);
    console.log("Created users table");

    // Create seats table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS seats (
          seat_id SERIAL PRIMARY KEY,
          status BOOLEAN NOT NULL,
          user_id INTEGER REFERENCES users(id)
        );
      `);
    console.log("Created seats table");

    // Populate seats with 80 rows (status = false)
    await pool.query(`
        INSERT INTO seats (status)
        SELECT false
        FROM generate_series(1, 80);
      `);
    console.log("Populated seats table with 80 rows");
  } catch (err) {
    console.error("Error during database setup:", err.message);
  }
};

export default setupDatabase;