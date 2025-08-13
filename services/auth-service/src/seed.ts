import * as argon2 from "argon2";
import { randomUUID } from "crypto";
import { pool } from "./db";

async function main(){
  const id = randomUUID();
  const email = "demo@example.com";
  const hash = await argon2.hash("Password123!");
  await pool.query("INSERT INTO users(id,email,password_hash,roles) VALUES($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING", [id,email,hash,["user","admin"]]);
  console.log("Seeded:", email, "password=Password123!");
  process.exit(0);
}
main();
