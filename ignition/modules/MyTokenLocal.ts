// MyToken ERC-20 deployment module for local network
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyTokenLocalModule = buildModule("MyTokenLocalModule", (m) => {
  // Token configuration for local testing
  const tokenName = "My Local Token";
  const tokenSymbol = "MLT";
  const initialSupply = 1000000; // 1 million tokens

  const myToken = m.contract("MyToken", [
    tokenName,
    tokenSymbol,
    initialSupply
  ]);

  return { myToken };
});

export default MyTokenLocalModule; 