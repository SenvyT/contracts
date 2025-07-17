// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title SimpleVault
 * @dev A basic vault contract that demonstrates fundamental Solidity concepts
 * 
 * This contract serves as a learning tool covering:
 * - State variables and their visibility
 * - Function types (view, pure, external, public, internal, private)
 * - Events and their emission
 * - Mappings and their usage
 * - Basic access control
 * - Error handling with require statements
 * 
 * @author Senvy Tech
 * @notice This is Session 1 of the Solidity Workshop - Foundation concepts only
 */
contract SimpleVault {
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    /**
     * @dev The owner of the vault - has special privileges
     * @notice This is a public state variable, automatically creates a getter function
     * @notice Only the owner can withdraw funds and change the vault name
     */
    address public owner;
    
    /**
     * @dev The name of the vault - can be changed by the owner
     * @notice This is a public state variable, automatically creates a getter function
     * @notice The name is stored as a string on-chain (expensive storage)
     */
    string public vaultName;
    
    /**
     * @dev The total amount of ETH deposited in the vault
     * @notice This tracks the sum of all deposits minus all withdrawals
     * @notice Used to ensure the vault has sufficient funds for withdrawals
     */
    uint256 public totalDeposits;
    
    /**
     * @dev The total amount of ETH withdrawn from the vault
     * @notice This tracks the sum of all withdrawals for accounting purposes
     * @notice Used to calculate the current vault balance
     */
    uint256 public totalWithdrawals;
    
    /**
     * @dev Mapping from user address to their total deposits
     * @notice This tracks how much each user has deposited
     * @notice Used to enforce withdrawal limits (users can only withdraw what they deposited)
     * @notice Key: user address, Value: total amount deposited by that user
     */
    mapping(address => uint256) public userDeposits;
    
    /**
     * @dev Mapping from user address to their total withdrawals
     * @notice This tracks how much each user has withdrawn
     * @notice Used to calculate remaining balance for each user
     * @notice Key: user address, Value: total amount withdrawn by that user
     */
    mapping(address => uint256) public userWithdrawals;
    
    /**
     * @dev Mapping to track if an address has ever deposited
     * @notice This is a simple boolean flag for each address
     * @notice Used to identify "active" users of the vault
     * @notice Key: user address, Value: true if user has deposited, false otherwise
     */
    mapping(address => bool) public hasDeposited;
    
    // ============================================
    // EVENTS
    // ============================================
    
    /**
     * @dev Emitted when someone deposits ETH into the vault
     * @param user The address of the user making the deposit
     * @param amount The amount of ETH deposited
     * @param timestamp The block timestamp when the deposit occurred
     * @notice Events are used for off-chain applications to track contract activity
     * @notice Events are much cheaper than storing data on-chain
     */
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    
    /**
     * @dev Emitted when the owner withdraws ETH from the vault
     * @param user The address of the user making the withdrawal
     * @param amount The amount of ETH withdrawn
     * @param timestamp The block timestamp when the withdrawal occurred
     * @notice Only the owner can withdraw, so this event tracks owner activity
     */
    event Withdrawal(address indexed user, uint256 amount, uint256 timestamp);
    
    /**
     * @dev Emitted when the vault name is changed
     * @param oldName The previous name of the vault
     * @param newName The new name of the vault
     * @param timestamp The block timestamp when the name was changed
     * @notice Only the owner can change the vault name
     */
    event VaultNameChanged(string oldName, string newName, uint256 timestamp);
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /**
     * @dev Constructor function - called once when the contract is deployed
     * @param _name The initial name for the vault
     * @notice This function sets up the initial state of the contract
     * @notice The deployer becomes the owner of the vault
     * @notice Constructor can only be called once during deployment
     */
    constructor(string memory _name) {
        // Set the owner to the address that deploys the contract
        // msg.sender is a global variable that contains the address of the transaction sender
        owner = msg.sender;
        
        // Set the initial vault name
        // memory keyword indicates this string is stored in memory, not storage
        vaultName = _name;
        
        // Initialize totals to zero
        // These are already zero by default, but explicit for clarity
        totalDeposits = 0;
        totalWithdrawals = 0;
    }
    
    // ============================================
    // EXTERNAL FUNCTIONS
    // ============================================
    
    /**
     * @dev Allows anyone to deposit ETH into the vault
     * @notice This is an external function - can only be called from outside the contract
     * @notice The function is payable, meaning it can receive ETH
     * @notice No access control - anyone can deposit
     * @notice Emits a Deposit event when successful
     */
    function deposit() external payable {
        // Call the internal deposit handler to avoid code duplication
        _handleDeposit();
    }
    
    // ============================================
    // PUBLIC FUNCTIONS
    // ============================================
    
    /**
     * @dev Allows the owner to withdraw ETH from the vault
     * @param amount The amount of ETH to withdraw
     * @notice Only the owner can call this function
     * @notice The function transfers ETH to the owner's address
     * @notice Emits a Withdrawal event when successful
     * @notice This is a public function - can be called from inside or outside the contract
     */
    function withdraw(uint256 amount) public {
        // Access control - only the owner can withdraw
        // require statement with custom error message
        require(msg.sender == owner, "Only owner can withdraw");
        
        // Ensure the vault has enough ETH to cover the withdrawal
        // This prevents the vault from going into negative balance
        require(amount <= address(this).balance, "Insufficient vault balance");
        
        // Ensure the withdrawal amount is greater than zero
        require(amount > 0, "Withdrawal amount must be greater than 0");
        
        // Update the owner's withdrawal total
        userWithdrawals[msg.sender] += amount;
        
        // Update the total withdrawals for the vault
        totalWithdrawals += amount;
        
        // Transfer ETH to the owner
        // payable(msg.sender) converts the address to a payable address
        // transfer() is a built-in function that sends ETH
        // If the transfer fails, the entire transaction reverts
        payable(msg.sender).transfer(amount);
        
        // Emit the Withdrawal event
        emit Withdrawal(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Allows the owner to change the vault name
     * @param newName The new name for the vault
     * @notice Only the owner can call this function
     * @notice Emits a VaultNameChanged event when successful
     * @notice This is a public function - can be called from inside or outside the contract
     */
    function changeVaultName(string memory newName) public {
        // Access control - only the owner can change the name
        require(msg.sender == owner, "Only owner can change vault name");
        
        // Ensure the new name is not empty
        // bytes() converts string to bytes for length checking
        require(bytes(newName).length > 0, "Vault name cannot be empty");
        
        // Store the old name before changing it
        // This is needed for the event emission
        string memory oldName = vaultName;
        
        // Update the vault name
        vaultName = newName;
        
        // Emit the VaultNameChanged event
        emit VaultNameChanged(oldName, newName, block.timestamp);
    }
    
    // ============================================
    // VIEW FUNCTIONS (Read-only)
    // ============================================
    
    /**
     * @dev Returns the current balance of the vault
     * @return The amount of ETH currently held by the vault
     * @notice This is a view function - it doesn't modify state
     * @notice address(this).balance returns the ETH balance of the contract
     * @notice This is a public function - can be called from inside or outside the contract
     */
    function getVaultBalance() public view returns (uint256) {
        // address(this) refers to the current contract's address
        // .balance is a property that returns the ETH balance
        return address(this).balance;
    }
    
    /**
     * @dev Returns the remaining balance a user can withdraw
     * @param user The address of the user to check
     * @return The amount of ETH the user can still withdraw
     * @notice This is a view function - it doesn't modify state
     * @notice Calculates: user's total deposits - user's total withdrawals
     * @notice This is a public function - can be called from inside or outside the contract
     */
    function getUserBalance(address user) public view returns (uint256) {
        // Calculate remaining balance by subtracting withdrawals from deposits
        // If user has never deposited, userDeposits[user] returns 0 (default value)
        // If user has never withdrawn, userWithdrawals[user] returns 0 (default value)
        return userDeposits[user] - userWithdrawals[user];
    }
    
    /**
     * @dev Returns detailed information about a user
     * @param user The address of the user to get info for
     * @return totalDeposited The total amount the user has deposited
     * @return totalWithdrawn The total amount the user has withdrawn
     * @return remainingBalance The amount the user can still withdraw
     * @return isActive Whether the user has ever deposited
     * @notice This is a view function - it doesn't modify state
     * @notice Returns multiple values using a tuple
     * @notice This is a public function - can be called from inside or outside the contract
     */
    function getUserInfo(address user) public view returns (
        uint256 totalDeposited,
        uint256 totalWithdrawn,
        uint256 remainingBalance,
        bool isActive
    ) {
        // Get values from mappings
        totalDeposited = userDeposits[user];
        totalWithdrawn = userWithdrawals[user];
        
        // Calculate remaining balance
        remainingBalance = totalDeposited - totalWithdrawn;
        
        // Check if user is active (has deposited at least once)
        isActive = hasDeposited[user];
        
        // Return all values as a tuple
        // Solidity automatically packs these into a return tuple
    }
    
    /**
     * @dev Returns the total number of active users (users who have deposited)
     * @notice This is a view function - it doesn't modify state
     * @notice This is a pure function - it doesn't read from state either
     * @notice Currently returns 0 as we don't track user count (would need additional logic)
     * @notice This is a public function - can be called from inside or outside the contract
     */
    function getActiveUserCount() public pure returns (uint256) {
        // This is a placeholder function
        // In a real implementation, you would need to track user count
        // For now, we return 0 as we don't have this functionality
        return 0;
    }
    
    // ============================================
    // RECEIVE FUNCTION
    // ============================================
    
    /**
     * @dev Fallback function that allows the contract to receive ETH
     * @notice This function is called when ETH is sent to the contract without any data
     * @notice It automatically treats direct ETH transfers as deposits
     * @notice This makes the contract more user-friendly - users can just send ETH
     * @notice receive() is a special function in Solidity 0.6.0+
     */
    receive() external payable {
        // When ETH is sent to the contract without any function call,
        // automatically treat it as a deposit
        // This ensures direct ETH transfers are properly tracked
        _handleDeposit();
    }
    
    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================
    
    /**
     * @dev Internal function to handle deposit logic
     * @notice This is an internal function - can only be called from within the contract
     * @notice Used by both deposit() and receive() functions
     * @notice Contains the core deposit logic to avoid code duplication
     */
    function _handleDeposit() internal {
        // Same logic as the deposit() function
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        userDeposits[msg.sender] += msg.value;
        totalDeposits += msg.value;
        hasDeposited[msg.sender] = true;
        
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }
} 