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

const { initiateDeveloperControlledWalletsClient } = require("@circle-fin/developer-controlled-wallets");

async function run() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!apiKey || apiKey === 'REPLACE_ME') {
    console.error("Error: CIRCLE_API_KEY is not configured in .env.local.");
    console.error("Please add your Circle API key first.");
    process.exit(1);
  }

  if (!entitySecret || entitySecret === 'REPLACE_ME') {
    console.error("Error: CIRCLE_ENTITY_SECRET is not configured in .env.local.");
    console.error("Please generate and register a 32-byte hex entity secret first.");
    process.exit(1);
  }

  console.log("Initializing Circle client...");
  console.log("API Key ending with:", apiKey.slice(-6));
  console.log("Entity Secret ending with:", entitySecret.slice(-6));

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: apiKey,
    entitySecret: entitySecret,
  });

  try {
    console.log("Creating developer-controlled wallet set...");
    const response = await client.createWalletSet({
      name: "Roarball Users Wallet Set",
    });

    const walletSet = response.data?.walletSet;
    if (walletSet && walletSet.id) {
      console.log("\n==================================================");
      console.log("🎉 SUCCESS! Wallet Set Created Successfully.");
      console.log("==================================================");
      console.log("Wallet Set ID:", walletSet.id);
      console.log("Wallet Set Name:", walletSet.name);
      console.log("Blockchain:", walletSet.blockchain);
      console.log("==================================================");
      console.log("\nNext Steps:");
      console.log(`1. Copy the Wallet Set ID: ${walletSet.id}`);
      console.log("2. Open your .env.local file and set:");
      console.log(`   CIRCLE_WALLET_SET_ID=${walletSet.id}`);
      console.log("3. Add the same variable to your Vercel Environment Variables.");
      console.log("==================================================\n");
    } else {
      console.error("Failed to create wallet set. Response:", response);
    }
  } catch (error) {
    console.error("Error creating wallet set:", error.message || error);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

run();
