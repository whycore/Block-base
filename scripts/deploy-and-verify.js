const hre = require("hardhat");
require("dotenv").config({ path: ".env.local" });

async function main() {
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    throw new Error("DEPLOYER_PRIVATE_KEY not found in .env.local");
  }

  console.log("\n== Block Base GameNFT Deploy ==\n");
  const network = hre.network.name;
  console.log("Network:", network);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const GameNFT = await hre.ethers.getContractFactory("GameNFT");
  console.log("Deploying GameNFT...");
  const contract = await GameNFT.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("\n✅ Deployed:", address);

  console.log("\nAdd to your env:");
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${address}`);

  const apiKey = process.env.BASESCAN_API_KEY;
  if (!apiKey) {
    console.log("\nℹ️ BASESCAN_API_KEY not set, skipping verify.");
    return;
  }

  // Wait a few blocks before verifying
  console.log("\nWaiting for confirmations before verify...");
  const current = await hre.ethers.provider.getBlockNumber();
  const target = current + 5;
  while ((await hre.ethers.provider.getBlockNumber()) < target) {
    await new Promise((r) => setTimeout(r, 4000));
  }

  console.log("\nVerifying on BaseScan...");
  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments: [],
    });
    console.log("✅ Verify success");
  } catch (e) {
    console.log("⚠️ Verify skipped/failed:", e.message || e);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


