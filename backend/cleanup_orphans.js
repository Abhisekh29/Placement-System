import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// --- CONFIGURATION ---
// Define the mapping between Database Tables and Upload Folders
const TARGETS = [
  {
    name: "Internship Certificates",
    table: "student_internship",
    column: "certificate",
    folder: "uploads/certificates",
  },
  {
    name: "Placement Offer Letters",
    table: "student_placement",
    column: "offerletter_file_name",
    folder: "uploads/offer_letters",
  },
  {
    name: "Expenditure Bills",
    table: "expenditure",
    column: "bill_file",
    folder: "uploads/expenditure",
  },
];

const processTarget = async (connection, target) => {
  console.log(`\n========================================`);
  console.log(`🔍 Checking: ${target.name}`);
  console.log(`========================================`);

  const folderPath = path.resolve(target.folder);

  // 1. Fetch valid filenames from Database
  // We filter out NULL or empty strings to avoid matching everything
  const [rows] = await connection.execute(
    `SELECT ${target.column} as filename FROM ${target.table} WHERE ${target.column} IS NOT NULL AND ${target.column} != ''`
  );
  const validFilesSet = new Set(rows.map((row) => row.filename));
  console.log(`📊 Database Records: ${validFilesSet.size} valid entries found.`);

  // 2. Read files from Disk
  let filesOnDisk = [];
  try {
    await fs.access(folderPath); // Check if folder exists
    filesOnDisk = await fs.readdir(folderPath);
    // Filter out system files
    filesOnDisk = filesOnDisk.filter(
      (f) => f !== ".DS_Store" && f !== ".gitignore" && !f.startsWith(".")
    );
    console.log(`📂 Files on Disk:    ${filesOnDisk.length} files found.`);
  } catch (e) {
    console.error(`❌ Folder missing or inaccessible: ${folderPath}`);
    console.log(`   (Skipping cleanup for this folder)`);
    return;
  }

  const filesOnDiskSet = new Set(filesOnDisk);

  // 3. Check for "Less Files" (Missing from Disk but in DB)
  const missingFiles = [...validFilesSet].filter((f) => !filesOnDiskSet.has(f));
  if (missingFiles.length > 0) {
    console.log(`\n⚠️  MISSING FILES (In DB but not on Disk): ${missingFiles.length}`);
    // We cannot 'fix' this automatically, just report it.
    missingFiles.forEach((f) => console.log(`   ❌ Missing: ${f}`));
  } else {
    console.log(`✅ Integrity Check: All database records have corresponding files.`);
  }

  // 4. Check for "More Files" (Orphans on Disk but not in DB)
  const orphans = filesOnDisk.filter((f) => !validFilesSet.has(f));

  if (orphans.length === 0) {
    console.log(`✨ Clean: No orphaned files found.`);
  } else {
    console.log(`\n🗑️  ORPHANED FILES (On Disk but not in DB): ${orphans.length}`);
    console.log(`   -> Deleting now...`);

    let deletedCount = 0;
    for (const file of orphans) {
      const filePath = path.join(folderPath, file);
      try {
        await fs.unlink(filePath);
        console.log(`   🔥 Deleted: ${file}`);
        deletedCount++;
      } catch (err) {
        console.error(`   ❌ Failed to delete ${file}:`, err.message);
      }
    }
    console.log(`   ✅ Successfully removed ${deletedCount} orphans.`);
  }
};

const cleanup = async () => {
  console.log("🚀 Starting System-Wide File Integrity Check...");
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
    console.log("✅ DB Connected.\n");

    // Process each target sequentially
    for (const target of TARGETS) {
      await processTarget(connection, target);
    }

    console.log("\n🏁 System Check Complete.");

  } catch (error) {
    console.error("❌ Fatal Error:", error);
  } finally {
    if (connection) await connection.end();
  }
};

cleanup();