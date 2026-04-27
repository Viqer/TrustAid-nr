/**
 * Blockchain Service
 * Sandbox-friendly helper for logging donation transactions on-chain.
 */

const crypto = require('crypto');

const buildDummyTxHash = () => `0x${crypto.randomBytes(32).toString('hex')}`;

const logDonation = async ({ donorWalletAddress, ngoWalletAddress, amount }) => {
  if (!donorWalletAddress || !ngoWalletAddress) {
    throw new Error('Both donor and NGO wallet addresses are required.');
  }

  if (!amount || amount <= 0) {
    throw new Error('Donation amount must be greater than zero.');
  }

  // Sandbox mode: return a deterministic tx-like hash so the UI can show blockchain proof.
  return {
    txHash: buildDummyTxHash(),
  };
};

module.exports = {
  logDonation,
};
