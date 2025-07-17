// SimpleVault deployment module for local development
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimpleVaultLocalModule = buildModule("SimpleVaultLocalModule", (m) => {
  // Set vault name for local development
  const vaultName = m.getParameter("vaultName", "Local SimpleVault");

  const simpleVault = m.contract("SimpleVault", [vaultName]);

  return { simpleVault };
});

export default SimpleVaultLocalModule; 