const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env.local" });

async function main() {
  // Check for private key
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    throw new Error(
      "DEPLOYER_PRIVATE_KEY not found in .env.local. Please add your private key."
    );
  }

  console.log("Deploying GameNFT contract to Base Sepolia...");
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Get the contract factory
  const GameNFT = await ethers.getContractFactory("GameNFT");

  // Deploy the contract
  console.log("\nDeploying...");
  const gameNFT = await GameNFT.deploy();

  // Wait for deployment
  await gameNFT.waitForDeployment();
  const address = await gameNFT.getAddress();

  console.log("\n✅ Contract deployed successfully!");
  console.log("Contract address:", address);
  console.log("\n📝 Next steps:");
  console.log("1. Add this to your .env.local:");
  console.log(`   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${address}`);
  console.log("\n2. (Optional) Verify contract on BaseScan:");
  console.log(`   npx hardhat verify --network baseSepolia ${address}`);
  console.log("\n3. Make sure you have enough ETH in your deployer wallet for verification gas.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

