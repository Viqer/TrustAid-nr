require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    // Local dev
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Your private Besu node (production)
    besu: {
      url: process.env.BESU_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: parseInt(process.env.BESU_CHAIN_ID),
    },
  },
};
