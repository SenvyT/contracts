// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MyToken
 * @dev A simple ERC-20 token with initial minting in constructor
 * 
 * Features:
 * - Standard ERC-20 functionality
 * - Initial minting in constructor
 * 
 * @author Your Name
 */
contract MyToken is ERC20 {
    
    // ============================================
    // EVENTS
    // ============================================
    
    /**
     * @dev Emitted when tokens are minted
     */
    event TokensMinted(address indexed to, uint256 amount);
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /**
     * @dev Constructor function
     * @param name Token name (e.g., "My Token")
     * @param symbol Token symbol (e.g., "MTK")
     * @param initialSupply Initial token supply
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        require(initialSupply > 0, "Initial supply must be greater than 0");
        
        // Mint initial supply to the deployer
        _mint(msg.sender, initialSupply * 10**decimals());
        
        emit TokensMinted(msg.sender, initialSupply * 10**decimals());
    }
}
