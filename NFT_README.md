# MyNFT Contract

A comprehensive ERC-721 NFT contract with advanced features for creating, minting, and managing NFT collections.

## 🎨 Features

- **ERC-721 Standard Compliant** - Full compatibility with NFT marketplaces
- **Customizable Collection** - Set name, symbol, max supply, and mint price
- **Multiple Minting Options** - Single mint and owner-only minting
- **Pause/Unpause Functionality** - Emergency stop for minting
- **Burn Functionality** - Allow token owners to burn their NFTs
- **Owner Controls** - Update mint price, max supply, and withdraw funds
- **Comprehensive View Functions** - Get token counts, remaining supply, and owner tokens

## 📋 Contract Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| Name | "My Awesome NFT Collection" | Collection name |
| Symbol | "MANC" | Collection symbol |
| Max Supply | 1000 | Maximum number of NFTs |
| Mint Price | 0.01 ETH | Cost to mint each NFT |

## 🚀 Deployment

### Local Development
```bash
npm run deploy:nft
```

### Sepolia Testnet
```bash
npm run deploy:nft:sepolia
```

### Reset Deployments
```bash
# Local
npm run deploy:nft:reset

# Sepolia
npm run deploy:nft:sepolia:reset
```

## 🧪 Testing

Run the comprehensive test suite:
```bash
npm test test/MyNFT.test.js
```

## 📖 Usage Guide

### 1. Minting NFTs

#### Single NFT Mint
```javascript
// Mint a single NFT
const tokenURI = "ipfs://QmYourTokenURI";
const mintPrice = ethers.parseEther("0.01");

const tx = await myNFT.mint(userAddress, tokenURI, { value: mintPrice });
await tx.wait();
```



#### Owner Minting (Free)
```javascript
// Only contract owner can call this
const tx = await myNFT.ownerMint(userAddress, tokenURI);
await tx.wait();
```

### 2. Managing Your Collection

#### Update Mint Price
```javascript
const newPrice = ethers.parseEther("0.02");
await myNFT.setMintPrice(newPrice);
```

#### Update Max Supply
```javascript
const newMaxSupply = 2000;
await myNFT.setMaxSupply(newMaxSupply);
```

#### Pause/Unpause Contract
```javascript
// Pause minting
await myNFT.setPaused(true);

// Resume minting
await myNFT.setPaused(false);
```

#### Withdraw Funds
```javascript
// Withdraw all ETH from contract
await myNFT.withdraw();
```

### 3. Viewing Collection Data

#### Get Collection Info
```javascript
const name = await myNFT.name();
const symbol = await myNFT.symbol();
const maxSupply = await myNFT.maxSupply();
const mintPrice = await myNFT.mintPrice();
const isPaused = await myNFT.isPaused();
```

#### Get Token Statistics
```javascript
const currentCount = await myNFT.getCurrentTokenCount();
const remainingSupply = await myNFT.getRemainingSupply();
```

#### Get User's Tokens
```javascript
const userTokens = await myNFT.getTokensByOwner(userAddress);
```

#### Check Token Details
```javascript
const owner = await myNFT.ownerOf(tokenId);
const tokenURI = await myNFT.tokenURI(tokenId);
const exists = await myNFT.tokenExists(tokenId);
```

### 4. Burning NFTs

```javascript
// Token owner or contract owner can burn
await myNFT.burn(tokenId);
```

## 🎯 NFT Metadata

### Token URI Format
The contract uses IPFS URIs for metadata:
```
ipfs://QmYourTokenURI
```

### Metadata Structure
Your metadata should follow the ERC-721 metadata standard:
```json
{
  "name": "My NFT #1",
  "description": "A unique digital artwork",
  "image": "ipfs://QmImageHash",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Blue"
    },
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    }
  ]
}
```

## 🔧 Owner Functions

| Function | Description | Access |
|----------|-------------|--------|
| `ownerMint()` | Mint NFTs for free | Owner only |
| `setMintPrice()` | Update mint price | Owner only |
| `setMaxSupply()` | Update max supply | Owner only |
| `setPaused()` | Pause/unpause contract | Owner only |
| `withdraw()` | Withdraw contract balance | Owner only |

## 📊 Events

The contract emits events for important actions:

- `NFTMinted(address to, uint256 tokenId, string tokenURI)` - When an NFT is minted
- `NFTBurned(uint256 tokenId)` - When an NFT is burned
- `MintPriceUpdated(uint256 newPrice)` - When mint price is updated
- `MaxSupplyUpdated(uint256 newMaxSupply)` - When max supply is updated
- `ContractPaused(bool paused)` - When contract is paused/unpaused

## 🛡️ Security Features

- **Access Control** - Owner-only functions for administrative tasks
- **Pause Mechanism** - Emergency stop for minting
- **Input Validation** - Checks for zero addresses and insufficient payments
- **Supply Limits** - Prevents minting beyond max supply
- **Safe Transfers** - Uses `_safeMint` for secure token creation

## 🌐 Integration Examples

### Frontend Integration
```javascript
// Connect to contract
const myNFT = new ethers.Contract(contractAddress, abi, signer);

// Mint NFT
const mintNFT = async (tokenURI) => {
  const mintPrice = await myNFT.mintPrice();
  const tx = await myNFT.mint(userAddress, tokenURI, { value: mintPrice });
  await tx.wait();
  return tx;
};
```

### Marketplace Integration
```javascript
// Check if user owns token
const isOwner = await myNFT.ownerOf(tokenId) === userAddress;

// Get user's collection
const userTokens = await myNFT.getTokensByOwner(userAddress);
```

## 📝 Contract Addresses

After deployment, the contract addresses will be available in:
- Local: `ignition/deployments/chain-31337/deployed_addresses.json`
- Sepolia: `ignition/deployments/chain-11155111/deployed_addresses.json`

## 🚨 Important Notes

1. **Test Thoroughly** - Always test on testnet before mainnet
2. **Secure Private Keys** - Never commit private keys to version control
3. **Verify Contracts** - Verify your contract on Etherscan after deployment
4. **Backup Metadata** - Ensure your IPFS metadata is properly backed up
5. **Gas Optimization** - Consider gas costs when setting mint prices

## 🔗 Related Files

- **Contract**: `contracts/MyNFT.sol`
- **Tests**: `test/MyNFT.test.js`
- **Deployment**: `scripts/deploy-mynft.js`
- **Modules**: `ignition/modules/MyNFTLocal.ts`, `ignition/modules/MyNFTSepolia.ts`

## 📞 Support

For questions or issues:
1. Check the test files for usage examples
2. Review the contract comments for detailed explanations
3. Run the test suite to verify functionality 