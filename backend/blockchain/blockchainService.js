/**
 * Blockchain Service
 * Sandbox-friendly helper for logging donation transactions on-chain.
 */

const crypto = require('crypto');

const buildDummyTxHash = (seed) => {
  if (!seed) {
    return `0x${crypto.randomBytes(32).toString('hex')}`;
  }

  const randomSalt = crypto.randomBytes(8).toString('hex');
  const hash = crypto.createHash('sha256').update(`${seed}:${randomSalt}`).digest('hex');
  return `0x${hash}`;
};

const logDonation = async ({ donorWalletId, ngoWalletId, donorWalletAddress, ngoWalletAddress, amount }) => {
  const donorRef = donorWalletId || donorWalletAddress;
  const ngoRef = ngoWalletId || ngoWalletAddress;

  if (!donorRef || !ngoRef) {
    throw new Error('Both donor and NGO wallet IDs are required.');
  }

  if (!amount || amount <= 0) {
    throw new Error('Donation amount must be greater than zero.');
  }

  // Sandbox mode: return a deterministic tx-like hash so the UI can show blockchain proof.
  return {
    txHash: buildDummyTxHash(`${donorRef}:${ngoRef}:${amount}`),
  };
};

module.exports = {
  logDonation,
};
