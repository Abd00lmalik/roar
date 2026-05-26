const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error("Error: .env.local file not found in the root directory.");
  process.exit(1);
}

const { registerEntitySecretCiphertext } = require("@circle-fin/developer-controlled-wallets");

async function run() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!apiKey || apiKey === 'REPLACE_ME') {
    console.error("Error: CIRCLE_API_KEY is not configured in .env.local.");
    process.exit(1);
  }

  if (!entitySecret || entitySecret === 'REPLACE_ME') {
    console.error("Error: CIRCLE_ENTITY_SECRET is not configured in .env.local.");
    process.exit(1);
  }

  // Create recovery directory if it doesn't exist
  const recoveryDir = path.join(__dirname, '..', 'recovery');
  if (!fs.existsSync(recoveryDir)) {
    fs.mkdirSync(recoveryDir);
  }

  console.log("Registering Entity Secret with Circle...");
  console.log("API Key ending with:", apiKey.slice(-6));
  console.log("Entity Secret ending with:", entitySecret.slice(-6));

  try {
    const response = await registerEntitySecretCiphertext({
      apiKey: apiKey,
      entitySecret: entitySecret,
      recoveryFileDownloadPath: recoveryDir,
    });

    console.log("\n==================================================");
    console.log("🎉 SUCCESS! Entity Secret Registered with Circle.");
    console.log("==================================================");
    console.log("Recovery file downloaded to: /recovery/recovery.dat");
    console.log("⚠️ IMPORTANT: Please store this recovery file safely.");
    console.log("Circle does NOT store your secret or recovery key. If lost,");
    console.log("you cannot recover your wallets or funds.");
    console.log("==================================================\n");

  } catch (error) {
    console.error("Error registering Entity Secret:", error.message || error);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    process.exit(1);
  }
}

run();
