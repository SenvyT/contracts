// SimpleVault deployment module for Sepolia testnet
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimpleVaultSepoliaModule = buildModule("SimpleVaultSepoliaModule", (m) => {
  // Set vault name for Sepolia testnet
  const vaultName = m.getParameter("vaultName", "Sepolia SimpleVault");

  const simpleVault = m.contract("SimpleVault", [vaultName]);

  return { simpleVault };
});

export default SimpleVaultSepoliaModule; 