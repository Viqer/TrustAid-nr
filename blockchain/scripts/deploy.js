const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const TrustToken = await hre.ethers.getContractFactory("TrustToken");
  const token = await TrustToken.deploy();
  await token.waitForDeployment();

  const contractAddress = await token.getAddress();
  console.log("TrustToken deployed to:", contractAddress);

  const minterRole = await token.MINTER_ROLE();
  const grantTx = await token.grantRole(minterRole, deployer.address);
  await grantTx.wait();

  console.log("Granted MINTER_ROLE to deployer:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
