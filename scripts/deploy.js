// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const Crowdfund = await ethers.getContractFactory("CrowdfundManager");
  const crowdfund = await Crowdfund.deploy();
  await crowdfund.waitForDeployment();

  const address = await crowdfund.getAddress();
  console.log("CrowdfundManager deployed at:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});