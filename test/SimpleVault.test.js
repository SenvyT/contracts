const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @dev Comprehensive test suite for SimpleVault - Session 1: Foundation
 * 
 * This test suite covers:
 * - Contract deployment and initialization
 * - Deposit functionality (both direct function calls and receive() fallback)
 * - Withdrawal functionality (owner only)
 * - Vault name management
 * - View functions and data retrieval
 * - Event emissions
 * - Access control and security
 * - Error handling and edge cases
 */
describe("SimpleVault - Session 1: Foundation", function () {
    let SimpleVault;
    let simpleVault;
    let owner;
    let user1;
    let user2;
    let user3;
    let addrs;

    /**
     * @dev Setup function that runs before each test
     * @notice Deploys a fresh contract instance for each test
     * @notice This ensures tests are isolated and don't affect each other
     */
    beforeEach(async function () {
        // Get signers (accounts) for testing
        // owner will be the contract deployer
        // user1, user2, user3 will be regular users
        [owner, user1, user2, user3, ...addrs] = await ethers.getSigners();

        // Deploy the contract with an initial name
        // The constructor requires a name parameter
        SimpleVault = await ethers.getContractFactory("SimpleVault");
        simpleVault = await SimpleVault.deploy("My Test Vault");
        await simpleVault.waitForDeployment();
    });

    // ============================================
    // DEPLOYMENT TESTS
    // ============================================
    
    describe("Deployment", function () {
        /**
         * @dev Test that the contract is deployed with correct initial state
         */
        it("Should set the right owner", async function () {
            // The deployer should be set as the owner
            expect(await simpleVault.owner()).to.equal(owner.address);
        });

        it("Should set the correct initial vault name", async function () {
            // The vault name should match what was passed to constructor
            expect(await simpleVault.vaultName()).to.equal("My Test Vault");
        });

        it("Should start with zero deposits and withdrawals", async function () {
            // All totals should start at zero
            expect(await simpleVault.totalDeposits()).to.equal(0);
            expect(await simpleVault.totalWithdrawals()).to.equal(0);
            expect(await simpleVault.getVaultBalance()).to.equal(0);
        });

        it("Should have zero vault balance initially", async function () {
            // The contract should start with no ETH
            expect(await simpleVault.getVaultBalance()).to.equal(0);
        });
    });

    // ============================================
    // DEPOSIT TESTS
    // ============================================
    
    describe("Deposits", function () {
        /**
         * @dev Test basic deposit functionality
         */
        it("Should allow anyone to deposit ETH", async function () {
            const depositAmount = ethers.parseEther("1.0");
            
            // User1 deposits 1 ETH
            await simpleVault.connect(user1).deposit({ value: depositAmount });

            // Check that user's deposit is recorded
            expect(await simpleVault.userDeposits(user1.address)).to.equal(depositAmount);
            
            // Check that total deposits is updated
            expect(await simpleVault.totalDeposits()).to.equal(depositAmount);
            
            // Check that user is marked as active
            expect(await simpleVault.hasDeposited(user1.address)).to.be.true;
            
            // Check that vault balance increased
            expect(await simpleVault.getVaultBalance()).to.equal(depositAmount);
        });

        it("Should not allow zero deposits", async function () {
            // Attempting to deposit 0 ETH should fail
            await expect(simpleVault.connect(user1).deposit({ value: 0 }))
                .to.be.revertedWith("Deposit amount must be greater than 0");
        });

        it("Should emit Deposit event", async function () {
            const depositAmount = ethers.parseEther("1.0");
            const tx = await simpleVault.connect(user1).deposit({ value: depositAmount });
            const receipt = await tx.wait();
            const event = receipt.logs.map(log => simpleVault.interface.parseLog(log)).find(e => e.name === "Deposit");
            expect(event).to.not.be.undefined;
            expect(event.args.user).to.equal(user1.address);
            expect(event.args.amount).to.equal(depositAmount);
            expect(event.args.timestamp).to.be.a('bigint');
        });

        it("Should handle multiple deposits from same user", async function () {
            const deposit1 = ethers.parseEther("1.0");
            const deposit2 = ethers.parseEther("2.0");
            
            // User makes two deposits
            await simpleVault.connect(user1).deposit({ value: deposit1 });
            await simpleVault.connect(user1).deposit({ value: deposit2 });

            // Total should be sum of both deposits
            expect(await simpleVault.userDeposits(user1.address)).to.equal(deposit1 + deposit2);
            expect(await simpleVault.totalDeposits()).to.equal(deposit1 + deposit2);
        });

        it("Should handle deposits from multiple users", async function () {
            const deposit1 = ethers.parseEther("1.0");
            const deposit2 = ethers.parseEther("2.0");
            
            // Two different users deposit
            await simpleVault.connect(user1).deposit({ value: deposit1 });
            await simpleVault.connect(user2).deposit({ value: deposit2 });

            // Each user's deposits should be tracked separately
            expect(await simpleVault.userDeposits(user1.address)).to.equal(deposit1);
            expect(await simpleVault.userDeposits(user2.address)).to.equal(deposit2);
            
            // Total should be sum of all deposits
            expect(await simpleVault.totalDeposits()).to.equal(deposit1 + deposit2);
        });

        it("Should handle direct ETH transfers via receive()", async function () {
            const depositAmount = ethers.parseEther("1.0");
            
            // Send ETH directly to contract (triggers receive() function)
            await user1.sendTransaction({
                to: await simpleVault.getAddress(),
                value: depositAmount
            });

            // Should be treated as a deposit
            expect(await simpleVault.userDeposits(user1.address)).to.equal(depositAmount);
            expect(await simpleVault.totalDeposits()).to.equal(depositAmount);
            expect(await simpleVault.hasDeposited(user1.address)).to.be.true;
        });
    });

    // ============================================
    // WITHDRAWAL TESTS
    // ============================================
    
    describe("Withdrawals", function () {
        const depositAmount = ethers.parseEther("2.0");
        const withdrawAmount = ethers.parseEther("1.0");

        /**
         * @dev Setup: Owner deposits some ETH first
         */
        beforeEach(async function () {
            // Owner deposits ETH so there's something to withdraw
            await simpleVault.connect(owner).deposit({ value: depositAmount });
        });

        it("Should allow owner to withdraw", async function () {
            const initialBalance = await ethers.provider.getBalance(owner.address);
            
            // Owner withdraws 1 ETH
            await simpleVault.connect(owner).withdraw(withdrawAmount);
            
            // Check that withdrawal is recorded
            expect(await simpleVault.userWithdrawals(owner.address)).to.equal(withdrawAmount);
            expect(await simpleVault.totalWithdrawals()).to.equal(withdrawAmount);
            
            // Check that vault balance decreased
            expect(await simpleVault.getVaultBalance()).to.equal(depositAmount - withdrawAmount);
        });

        it("Should not allow non-owner to withdraw", async function () {
            // Only owner can withdraw, other users cannot
            await expect(simpleVault.connect(user1).withdraw(withdrawAmount))
                .to.be.revertedWith("Only owner can withdraw");
        });

        it("Should not allow withdrawal of more than vault balance", async function () {
            const tooMuch = ethers.parseEther("3.0");
            
            // Cannot withdraw more than what's in the vault
            await expect(simpleVault.connect(owner).withdraw(tooMuch))
                .to.be.revertedWith("Insufficient vault balance");
        });

        it("Should not allow zero withdrawals", async function () {
            // Cannot withdraw 0 ETH
            await expect(simpleVault.connect(owner).withdraw(0))
                .to.be.revertedWith("Withdrawal amount must be greater than 0");
        });

        it("Should emit Withdrawal event", async function () {
            const tx = await simpleVault.connect(owner).withdraw(withdrawAmount);
            const receipt = await tx.wait();
            const event = receipt.logs.map(log => simpleVault.interface.parseLog(log)).find(e => e.name === "Withdrawal");
            expect(event).to.not.be.undefined;
            expect(event.args.user).to.equal(owner.address);
            expect(event.args.amount).to.equal(withdrawAmount);
            expect(event.args.timestamp).to.be.a('bigint');
        });

        it("Should handle multiple withdrawals", async function () {
            const withdraw1 = ethers.parseEther("0.5");
            const withdraw2 = ethers.parseEther("0.5");
            
            // Owner makes two withdrawals
            await simpleVault.connect(owner).withdraw(withdraw1);
            await simpleVault.connect(owner).withdraw(withdraw2);

            // Total withdrawals should be sum of both
            expect(await simpleVault.userWithdrawals(owner.address)).to.equal(withdraw1 + withdraw2);
            expect(await simpleVault.totalWithdrawals()).to.equal(withdraw1 + withdraw2);
        });
    });

    // ============================================
    // VAULT NAME MANAGEMENT TESTS
    // ============================================
    
    describe("Vault Name Management", function () {
        it("Should allow owner to change vault name", async function () {
            const newName = "New Vault Name";
            
            // Owner changes the vault name
            await simpleVault.connect(owner).changeVaultName(newName);
            
            // Name should be updated
            expect(await simpleVault.vaultName()).to.equal(newName);
        });

        it("Should not allow non-owner to change vault name", async function () {
            const newName = "New Vault Name";
            
            // Only owner can change name
            await expect(simpleVault.connect(user1).changeVaultName(newName))
                .to.be.revertedWith("Only owner can change vault name");
        });

        it("Should not allow empty vault name", async function () {
            // Cannot set empty name
            await expect(simpleVault.connect(owner).changeVaultName(""))
                .to.be.revertedWith("Vault name cannot be empty");
        });

        it("Should emit VaultNameChanged event", async function () {
            const newName = "New Vault Name";
            const oldName = await simpleVault.vaultName();
            const tx = await simpleVault.connect(owner).changeVaultName(newName);
            const receipt = await tx.wait();
            const event = receipt.logs.map(log => simpleVault.interface.parseLog(log)).find(e => e.name === "VaultNameChanged");
            expect(event).to.not.be.undefined;
            expect(event.args.oldName).to.equal(oldName);
            expect(event.args.newName).to.equal(newName);
            expect(event.args.timestamp).to.be.a('bigint');
        });
    });

    // ============================================
    // VIEW FUNCTION TESTS
    // ============================================
    
    describe("View Functions", function () {
        const depositAmount = ethers.parseEther("1.5");
        const withdrawAmount = ethers.parseEther("0.5");

        /**
         * @dev Setup: Create some activity in the vault
         */
        beforeEach(async function () {
            // User1 deposits and owner withdraws some
            await simpleVault.connect(user1).deposit({ value: depositAmount });
            await simpleVault.connect(owner).deposit({ value: ethers.parseEther("2.0") });
            await simpleVault.connect(owner).withdraw(withdrawAmount);
        });

        it("Should return correct vault balance", async function () {
            // Vault balance should be total deposits minus total withdrawals
            const expectedBalance = depositAmount + ethers.parseEther("2.0") - withdrawAmount;
            expect(await simpleVault.getVaultBalance()).to.equal(expectedBalance);
        });

        it("Should return correct user balance", async function () {
            // User1 has only deposited, no withdrawals
            expect(await simpleVault.getUserBalance(user1.address)).to.equal(depositAmount);
            
            // Owner has deposited and withdrawn
            const ownerBalance = ethers.parseEther("2.0") - withdrawAmount;
            expect(await simpleVault.getUserBalance(owner.address)).to.equal(ownerBalance);
        });

        it("Should return correct user info", async function () {
            // Get detailed info about user1
            const userInfo = await simpleVault.getUserInfo(user1.address);
            
            expect(userInfo.totalDeposited).to.equal(depositAmount);
            expect(userInfo.totalWithdrawn).to.equal(0);
            expect(userInfo.remainingBalance).to.equal(depositAmount);
            expect(userInfo.isActive).to.be.true;
        });

        it("Should return correct user info for inactive user", async function () {
            // Get info about user2 who has never deposited
            const userInfo = await simpleVault.getUserInfo(user2.address);
            
            expect(userInfo.totalDeposited).to.equal(0);
            expect(userInfo.totalWithdrawn).to.equal(0);
            expect(userInfo.remainingBalance).to.equal(0);
            expect(userInfo.isActive).to.be.false;
        });

        it("Should return correct user info for user with withdrawals", async function () {
            // Get info about owner who has deposited and withdrawn
            const userInfo = await simpleVault.getUserInfo(owner.address);
            
            expect(userInfo.totalDeposited).to.equal(ethers.parseEther("2.0"));
            expect(userInfo.totalWithdrawn).to.equal(withdrawAmount);
            expect(userInfo.remainingBalance).to.equal(ethers.parseEther("2.0") - withdrawAmount);
            expect(userInfo.isActive).to.be.true;
        });

        it("Should return zero for active user count (placeholder)", async function () {
            // This is a placeholder function that returns 0
            // In a real implementation, this would track actual user count
            expect(await simpleVault.getActiveUserCount()).to.equal(0);
        });
    });

    // ============================================
    // EDGE CASES AND ERROR HANDLING
    // ============================================
    
    describe("Edge Cases and Error Handling", function () {
        it("Should handle very small deposits", async function () {
            const smallAmount = 1; // 1 wei
            
            // Even very small amounts should work
            await simpleVault.connect(user1).deposit({ value: smallAmount });
            
            expect(await simpleVault.userDeposits(user1.address)).to.equal(smallAmount);
            expect(await simpleVault.hasDeposited(user1.address)).to.be.true;
        });

        it("Should handle large deposits", async function () {
            const largeAmount = ethers.parseEther("1000.0"); // 1000 ETH
            
            // Large amounts should work (assuming account has enough ETH)
            await simpleVault.connect(user1).deposit({ value: largeAmount });
            
            expect(await simpleVault.userDeposits(user1.address)).to.equal(largeAmount);
            expect(await simpleVault.totalDeposits()).to.equal(largeAmount);
        });

        it("Should handle multiple users with same deposit amounts", async function () {
            const amount = ethers.parseEther("1.0");
            
            // Multiple users deposit the same amount
            await simpleVault.connect(user1).deposit({ value: amount });
            await simpleVault.connect(user2).deposit({ value: amount });
            await simpleVault.connect(user3).deposit({ value: amount });

            // Each should be tracked separately
            expect(await simpleVault.userDeposits(user1.address)).to.equal(amount);
            expect(await simpleVault.userDeposits(user2.address)).to.equal(amount);
            expect(await simpleVault.userDeposits(user3.address)).to.equal(amount);
            
            // Total should be 3x the amount
            expect(await simpleVault.totalDeposits()).to.equal(amount * 3n);
        });

        it("Should maintain correct state after multiple operations", async function () {
            // Complex scenario with multiple operations
            await simpleVault.connect(user1).deposit({ value: ethers.parseEther("1.0") });
            await simpleVault.connect(user2).deposit({ value: ethers.parseEther("2.0") });
            await simpleVault.connect(owner).deposit({ value: ethers.parseEther("3.0") });
            await simpleVault.connect(owner).withdraw(ethers.parseEther("1.0"));
            await simpleVault.connect(owner).changeVaultName("Updated Vault");

            // Verify final state
            expect(await simpleVault.totalDeposits()).to.equal(ethers.parseEther("6.0"));
            expect(await simpleVault.totalWithdrawals()).to.equal(ethers.parseEther("1.0"));
            expect(await simpleVault.getVaultBalance()).to.equal(ethers.parseEther("5.0"));
            expect(await simpleVault.vaultName()).to.equal("Updated Vault");
        });
    });
});

/**
 * @dev Helper function to get current block timestamp
 * @return Current block timestamp
 */
async function time() {
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    return block.timestamp;
} 