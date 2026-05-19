const bcrypt = require("bcryptjs"); // use bcryptjs if bcrypt fails on Windows
const { pool } = require("../src/models/db");

async function createAdmin() {
  const email = "Mani@2024.com";
  const plainPassword = "Mani@9025";

  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    pool.query(
      "INSERT INTO admins (email, password) VALUES (?, ?)",
      [email, hashedPassword],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            console.log("⚠️ Admin already exists");
          } else {
            console.error("❌ Error inserting admin:", err.message);
          }
        } else {
          console.log("✅ Admin created:", { id: result.insertId, email });
        }
        process.exit(); // exit after query
      }
    );
  } catch (err) {
    console.error("❌ Hashing error:", err.message);
    process.exit(1);
  }
}

createAdmin();
