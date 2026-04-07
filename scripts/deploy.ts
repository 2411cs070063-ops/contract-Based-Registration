import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const Contract = await ethers.getContractFactory("LandRegistry");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("✅ Contract deployed to:", address);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});