// MyToken ERC-20 deployment module for Sepolia testnet
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyTokenSepoliaModule = buildModule("MyTokenSepoliaModule", (m) => {
  // Token configuration for Sepolia
  const tokenName = "My Advanced Token";
  const tokenSymbol = "MAT";
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

export default MyTokenSepoliaModule; 