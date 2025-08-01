const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT", function () {
  let MyNFT;
  let myNFT;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const NFT_NAME = "My Awesome NFT Collection";
  const NFT_SYMBOL = "MANC";
  const MAX_SUPPLY = 1000;
  const MINT_PRICE = ethers.parseEther("0.01");

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    MyNFT = await ethers.getContractFactory("MyNFT");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy the contract
    myNFT = await MyNFT.deploy(NFT_NAME, NFT_SYMBOL, MAX_SUPPLY, MINT_PRICE);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await myNFT.owner()).to.equal(owner.address);
    });

    it("Should set the correct name and symbol", async function () {
      expect(await myNFT.name()).to.equal(NFT_NAME);
      expect(await myNFT.symbol()).to.equal(NFT_SYMBOL);
    });

    it("Should set the correct max supply", async function () {
      expect(await myNFT.maxSupply()).to.equal(MAX_SUPPLY);
    });

    it("Should set the correct mint price", async function () {
      expect(await myNFT.mintPrice()).to.equal(MINT_PRICE);
    });

    it("Should not be paused initially", async function () {
      expect(await myNFT.isPaused()).to.equal(false);
    });
  });

  describe("Minting", function () {
    const tokenURI = "ipfs://QmYourTokenURI";

    it("Should mint a new NFT with correct payment", async function () {
      await expect(myNFT.connect(addr1).mint(addr1.address, tokenURI, { value: MINT_PRICE }))
        .to.emit(myNFT, "NFTMinted")
        .withArgs(addr1.address, 1, tokenURI);

      expect(await myNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await myNFT.tokenURI(1)).to.equal(tokenURI);
      expect(await myNFT.getCurrentTokenCount()).to.equal(1);
    });

    it("Should fail to mint with insufficient payment", async function () {
      const insufficientPayment = ethers.parseEther("0.005");
      await expect(
        myNFT.connect(addr1).mint(addr1.address, tokenURI, { value: insufficientPayment })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail to mint to zero address", async function () {
      await expect(
        myNFT.connect(addr1).mint(ethers.ZeroAddress, tokenURI, { value: MINT_PRICE })
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("Should fail to mint when contract is paused", async function () {
      await myNFT.setPaused(true);
      await expect(
        myNFT.connect(addr1).mint(addr1.address, tokenURI, { value: MINT_PRICE })
      ).to.be.revertedWith("Contract is paused");
    });

    it("Should fail to mint when max supply is reached", async function () {
      // Mint up to max supply
      for (let i = 0; i < MAX_SUPPLY; i++) {
        await myNFT.connect(addr1).mint(addr1.address, `${tokenURI}${i}`, { value: MINT_PRICE });
      }

      // Try to mint one more
      await expect(
        myNFT.connect(addr1).mint(addr1.address, "extra", { value: MINT_PRICE })
      ).to.be.revertedWith("Max supply reached");
    });
  });

  describe("Owner Minting", function () {
    const tokenURI = "ipfs://QmOwnerTokenURI";

    it("Should allow owner to mint for free", async function () {
      await expect(myNFT.ownerMint(addr1.address, tokenURI))
        .to.emit(myNFT, "NFTMinted")
        .withArgs(addr1.address, 1, tokenURI);

      expect(await myNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await myNFT.tokenURI(1)).to.equal(tokenURI);
    });

    it("Should fail when non-owner tries to owner mint", async function () {
      await expect(
        myNFT.connect(addr1).ownerMint(addr1.address, tokenURI)
      ).to.be.revertedWithCustomError(myNFT, "OwnableUnauthorizedAccount");
    });
  });

  

  describe("Burning", function () {
    const tokenURI = "ipfs://QmBurnTokenURI";

    beforeEach(async function () {
      await myNFT.connect(addr1).mint(addr1.address, tokenURI, { value: MINT_PRICE });
    });

    it("Should allow token owner to burn their token", async function () {
      await expect(myNFT.connect(addr1).burn(1))
        .to.emit(myNFT, "NFTBurned")
        .withArgs(1);

      await expect(myNFT.ownerOf(1)).to.be.revertedWithCustomError(myNFT, "ERC721NonexistentToken");
    });

    it("Should allow contract owner to burn any token", async function () {
      await expect(myNFT.burn(1))
        .to.emit(myNFT, "NFTBurned")
        .withArgs(1);
    });

    it("Should fail when unauthorized user tries to burn", async function () {
      await expect(
        myNFT.connect(addr2).burn(1)
      ).to.be.revertedWith("Not authorized to burn this token");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to update mint price", async function () {
      const newPrice = ethers.parseEther("0.02");
      await expect(myNFT.setMintPrice(newPrice))
        .to.emit(myNFT, "MintPriceUpdated")
        .withArgs(newPrice);

      expect(await myNFT.mintPrice()).to.equal(newPrice);
    });

    it("Should allow owner to update max supply", async function () {
      const newMaxSupply = 2000;
      await expect(myNFT.setMaxSupply(newMaxSupply))
        .to.emit(myNFT, "MaxSupplyUpdated")
        .withArgs(newMaxSupply);

      expect(await myNFT.maxSupply()).to.equal(newMaxSupply);
    });

    it("Should fail to set max supply below current supply", async function () {
      // Mint one token first
      await myNFT.connect(addr1).mint(addr1.address, "test", { value: MINT_PRICE });
      
      // Try to set max supply to 0 (below current supply of 1)
      await expect(myNFT.setMaxSupply(0)).to.be.revertedWith("New max supply cannot be less than current supply");
    });

    it("Should allow owner to pause and unpause", async function () {
      await expect(myNFT.setPaused(true))
        .to.emit(myNFT, "ContractPaused")
        .withArgs(true);

      expect(await myNFT.isPaused()).to.equal(true);

      await expect(myNFT.setPaused(false))
        .to.emit(myNFT, "ContractPaused")
        .withArgs(false);

      expect(await myNFT.isPaused()).to.equal(false);
    });

    it("Should fail when non-owner tries to call owner functions", async function () {
      await expect(
        myNFT.connect(addr1).setMintPrice(ethers.parseEther("0.02"))
      ).to.be.revertedWithCustomError(myNFT, "OwnableUnauthorizedAccount");

      await expect(
        myNFT.connect(addr1).setMaxSupply(2000)
      ).to.be.revertedWithCustomError(myNFT, "OwnableUnauthorizedAccount");

      await expect(
        myNFT.connect(addr1).setPaused(true)
      ).to.be.revertedWithCustomError(myNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    it("Should return correct current token count", async function () {
      expect(await myNFT.getCurrentTokenCount()).to.equal(0);

      await myNFT.connect(addr1).mint(addr1.address, "test1", { value: MINT_PRICE });
      expect(await myNFT.getCurrentTokenCount()).to.equal(1);

      await myNFT.connect(addr1).mint(addr1.address, "test2", { value: MINT_PRICE });
      expect(await myNFT.getCurrentTokenCount()).to.equal(2);
    });

    it("Should return correct remaining supply", async function () {
      expect(await myNFT.getRemainingSupply()).to.equal(MAX_SUPPLY);

      await myNFT.connect(addr1).mint(addr1.address, "test", { value: MINT_PRICE });
      expect(await myNFT.getRemainingSupply()).to.equal(MAX_SUPPLY - 1);
    });

    it("Should check if token exists", async function () {
      expect(await myNFT.tokenExists(1)).to.equal(false);

      await myNFT.connect(addr1).mint(addr1.address, "test", { value: MINT_PRICE });
      expect(await myNFT.tokenExists(1)).to.equal(true);
    });

    it("Should get tokens by owner", async function () {
      // Mint tokens to different addresses
      await myNFT.connect(addr1).mint(addr1.address, "test1", { value: MINT_PRICE });
      await myNFT.connect(addr2).mint(addr2.address, "test2", { value: MINT_PRICE });
      await myNFT.connect(addr1).mint(addr1.address, "test3", { value: MINT_PRICE });

      const addr1Tokens = await myNFT.getTokensByOwner(addr1.address);
      const addr2Tokens = await myNFT.getTokensByOwner(addr2.address);

      expect(addr1Tokens).to.deep.equal([1n, 3n]);
      expect(addr2Tokens).to.deep.equal([2n]);
    });
  });

  describe("Withdrawal", function () {
    it("Should allow owner to withdraw contract balance", async function () {
      // Mint some NFTs to add balance to contract
      await myNFT.connect(addr1).mint(addr1.address, "test1", { value: MINT_PRICE });
      await myNFT.connect(addr2).mint(addr2.address, "test2", { value: MINT_PRICE });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      await myNFT.withdraw();
      const finalBalance = await ethers.provider.getBalance(owner.address);

      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should fail when non-owner tries to withdraw", async function () {
      await expect(
        myNFT.connect(addr1).withdraw()
      ).to.be.revertedWithCustomError(myNFT, "OwnableUnauthorizedAccount");
    });

    it("Should fail to withdraw when balance is zero", async function () {
      await expect(myNFT.withdraw()).to.be.revertedWith("No balance to withdraw");
    });
  });

  describe("ERC721 Standard", function () {
    it("Should support ERC721 interface", async function () {
      const erc721InterfaceId = "0x80ac58cd";
      expect(await myNFT.supportsInterface(erc721InterfaceId)).to.equal(true);
    });

    it("Should support ERC721Metadata interface", async function () {
      const erc721MetadataInterfaceId = "0x5b5e139f";
      expect(await myNFT.supportsInterface(erc721MetadataInterfaceId)).to.equal(true);
    });
  });
}); 