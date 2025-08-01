import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyNFTLocalModule", (m) => {
  const myNFT = m.contract("MyNFT", [
    "My Awesome NFT Collection", // name
    "MANC", // symbol
    1000, // maxSupply
    "10000000000000000" // mintPrice (0.01 ETH in wei)
  ]);

  return { myNFT };
}); 