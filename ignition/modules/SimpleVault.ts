// SimpleVault deployment module for Hardhat Ignition
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimpleVaultModule = buildModule("SimpleVaultModule", (m) => {
  // Set vault name parameter with default value
  const vaultName = m.getParameter("vaultName", "My SimpleVault");

  const simpleVault = m.contract("SimpleVault", [vaultName]);

  return { simpleVault };
});

export default SimpleVaultModule; 