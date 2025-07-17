# Session 1: Foundation - SimpleVault

## 🎯 **Learning Objectives**

This session covers the fundamental Solidity concepts:

- ✅ **State Variables** - Storing data on the blockchain
- ✅ **Mappings** - Key-value data structures
- ✅ **Events** - Logging and communication
- ✅ **Functions** - Basic function types and visibility
- ✅ **Constructor** - Contract initialization
- ✅ **Payable Functions** - Handling ETH transactions
- ✅ **View Functions** - Reading data without state changes
- ✅ **Require Statements** - Input validation and access control

## 📋 **Contract Overview**

### **SimpleVault.sol**
A basic vault contract where users can:
1. **Register** - Become a vault user
2. **Deposit** - Send ETH to the vault
3. **Withdraw** - Take ETH out of the vault
4. **View** - Check balances and statistics

## 🔧 **Key Concepts Demonstrated**

### **1. State Variables**
```solidity
uint256 public totalBalance;    // Total ETH in vault
address public owner;           // Contract owner
uint256 public userCount;       // Number of registered users
```

### **2. Mappings**
```solidity
mapping(address => uint256) public userBalances;  // User ETH balances
mapping(address => bool) public isUser;           // User registration status
```

### **3. Events**
```solidity
event UserRegistered(address indexed user);
event Deposit(address indexed user, uint256 amount);
event Withdraw(address indexed user, uint256 amount);
event OwnerChanged(address indexed oldOwner, address indexed newOwner);
```

### **4. Function Types**
```solidity
// External function (can only be called from outside)
function register() external { ... }

// Payable function (can receive ETH)
function deposit() external payable { ... }

// View function (reads data, no state changes)
function getUserBalance(address user) external view returns (uint256) { ... }
```

### **5. Constructor**
```solidity
constructor() {
    owner = msg.sender;  // Set deployer as owner
}
```

### **6. Access Control**
```solidity
require(msg.sender == owner, "Only owner can change owner");
require(!isUser[msg.sender], "Already registered");
require(userBalances[msg.sender] >= amount, "Insufficient balance");
```

## 🚀 **How to Use**

### **1. Deploy the Contract**
```bash
npx hardhat compile
npx hardhat test
```

### **2. Basic Workflow**
```javascript
// 1. Register as a user
await simpleVault.register();

// 2. Deposit ETH
await simpleVault.deposit({ value: ethers.parseEther("1.0") });

// 3. Check balance
const balance = await simpleVault.getUserBalance(userAddress);

// 4. Withdraw ETH
await simpleVault.withdraw(ethers.parseEther("0.5"));
```

### **3. View Functions**
```javascript
// Get user balance
const balance = await simpleVault.getUserBalance(userAddress);

// Check if address is registered
const isRegistered = await simpleVault.checkIfUser(userAddress);

// Get vault statistics
const [totalBalance, userCount, owner] = await simpleVault.getVaultStats();
```

## 🧪 **Testing**

Run the comprehensive test suite:
```bash
npx hardhat test
```

**Test Coverage:**
- ✅ Contract deployment
- ✅ User registration
- ✅ ETH deposits
- ✅ ETH withdrawals
- ✅ Owner functions
- ✅ View functions
- ✅ Event emissions
- ✅ Error conditions

## 📚 **Key Takeaways**

### **What You've Learned:**
1. **Variables** - How to store and manage data
2. **Mappings** - Efficient key-value storage
3. **Events** - Blockchain communication
4. **Functions** - Different function types and their uses
5. **Access Control** - Basic security patterns
6. **ETH Handling** - Payable functions and transfers

### **Next Session Preview:**
In Session 2, we'll add:
- **Modifiers** - Reusable access control
- **Advanced Access Control** - Role-based permissions
- **Function Visibility** - Public, private, internal, external

## 🔗 **Files in This Session**

- `contracts/SimpleVault.sol` - Main contract
- `test/SimpleVault.test.js` - Comprehensive tests
- `SESSION_1_README.md` - This documentation

## 🎯 **Success Criteria**

You understand this session when you can:
- ✅ Explain what each state variable does
- ✅ Understand how mappings work
- ✅ Know when to use different function types
- ✅ Explain the purpose of events
- ✅ Understand basic access control with require statements
- ✅ Run and understand the test results

---

**Ready for Session 2?** Let's add modifiers and advanced access control! 