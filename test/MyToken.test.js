const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let myToken;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy token
    const MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy("My Test Token", "MTT", 1000000);
    await myToken.waitForDeployment();
  });

  it("Should transfer tokens between addresses", async function () {
    // Check initial balances
    const ownerBalance = await myToken.balanceOf(owner.address);
    const user1Balance = await myToken.balanceOf(user1.address);
    
    console.log("Initial balances:");
    console.log("Owner:", ethers.formatEther(ownerBalance), "tokens");
    console.log("User1:", ethers.formatEther(user1Balance), "tokens");
    
    // Transfer 100 tokens from owner to user1
    const transferAmount = ethers.parseEther("100");
    await myToken.transfer(user1.address, transferAmount);
    
    // Check balances after transfer
    const newOwnerBalance = await myToken.balanceOf(owner.address);
    const newUser1Balance = await myToken.balanceOf(user1.address);
    
    console.log("\nAfter transfer:");
    console.log("Owner:", ethers.formatEther(newOwnerBalance), "tokens");
    console.log("User1:", ethers.formatEther(newUser1Balance), "tokens");
    
    // Verify the transfer
    expect(newUser1Balance).to.equal(transferAmount);
    expect(newOwnerBalance).to.equal(ownerBalance - transferAmount);
  });

  it("Should fail if sender has insufficient balance", async function () {
    // Try to transfer more tokens than user1 has (should fail)
    const transferAmount = ethers.parseEther("100");
    
    await expect(
      myToken.connect(user1).transfer(user2.address, transferAmount)
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  it("Should emit Transfer event", async function () {
    const transferAmount = ethers.parseEther("50");
    
    await expect(myToken.transfer(user1.address, transferAmount))
      .to.emit(myToken, "Transfer")
      .withArgs(owner.address, user1.address, transferAmount);
  });
}); 