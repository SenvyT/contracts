// Local deployment module - 1000 ETH locked amount
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LockLocalModule = buildModule("LockLocalModule", (m) => {
  // Set unlock time to 2 minutes from deployment
  const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 120; // 2 minutes = 120 seconds
  
  // Set locked amount to 1000 ETH for local development
  const lockedAmount = 1000000000000000000000n; // 1000 ETH in wei

  const lock = m.contract("Lock", [unlockTime], {
    value: lockedAmount,
  });

  return { lock };
});

export default LockLocalModule; 