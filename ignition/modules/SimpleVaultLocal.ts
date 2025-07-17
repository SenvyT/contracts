// SimpleVault deployment module for local development (Hardhat Network)
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimpleVaultModule = buildModule("SimpleVaultModule", (m) => {
  // Set vault name for local development
  const vaultName = m.getParameter("vaultName", "Local SimpleVault");

  const simpleVault = m.contract("SimpleVault", [vaultName]);

  return { simpleVault };
});

export default SimpleVaultModule; 