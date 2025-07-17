// Sepolia deployment module - 0.001 ETH locked amount
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LockSepoliaModule = buildModule("LockSepoliaModule", (m) => {
  // Set unlock time to 2 minutes from deployment
  const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 120; // 2 minutes = 120 seconds
  
  // Set locked amount to 0.001 ETH for Sepolia
  const lockedAmount = 1000000000000000n; // 0.001 ETH in wei

  const lock = m.contract("Lock", [unlockTime], {
    value: lockedAmount,
  });

  return { lock };
});

export default LockSepoliaModule; 