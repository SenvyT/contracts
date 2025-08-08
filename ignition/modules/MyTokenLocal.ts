// MyToken ERC-20 deployment module for local network
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyTokenLocalModule = buildModule("MyTokenLocalModule", (m) => {
  // Token configuration for local testing
  const tokenName = "My Local Token";
  const tokenSymbol = "MLT";
  const initialSupply = 1000000; // 1 million tokens
  const maxSupply = 10000000; // 10 million tokens max
  const tokenPrice = 1000000000000000n; // 0.001 ETH per token

  const myToken = m.contract("MyToken", [
    tokenName,
    tokenSymbol,
    initialSupply,
    maxSupply,
    tokenPrice
  ]);

  return { myToken };
});

export default MyTokenLocalModule; 