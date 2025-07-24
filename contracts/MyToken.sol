// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MyToken
 * @dev A complete ERC-20 token implementation with additional features
 * 
 * Features:
 * - Standard ERC-20 functionality
 * - Minting (only owner)
 * - Burning (anyone can burn their own tokens)
 * - Pausing (emergency stop)
 * - Ownership management
 * 
 * @author Your Name
 */
contract MyToken is ERC20, Ownable, Pausable {
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    /**
     * @dev Maximum supply of tokens
     */
    uint256 public maxSupply;
    
    /**
     * @dev Token price in wei (for future sale functionality)
     */
    uint256 public tokenPrice;
    

    
    // ============================================
    // EVENTS
    // ============================================
    
    /**
     * @dev Emitted when tokens are minted
     */
    event TokensMinted(address indexed to, uint256 amount);
    
    /**
     * @dev Emitted when tokens are burned
     */
    event TokensBurned(address indexed from, uint256 amount);
    

    
    /**
     * @dev Emitted when token price is updated
     */
    event TokenPriceUpdated(uint256 oldPrice, uint256 newPrice);
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /**
     * @dev Constructor function
     * @param name Token name (e.g., "My Token")
     * @param symbol Token symbol (e.g., "MTK")
     * @param initialSupply Initial token supply
     * @param _maxSupply Maximum token supply
     * @param _tokenPrice Token price in wei
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 _maxSupply,
        uint256 _tokenPrice
    ) ERC20(name, symbol) Ownable(msg.sender) {
        require(initialSupply <= _maxSupply, "Initial supply cannot exceed max supply");
        require(_maxSupply > 0, "Max supply must be greater than 0");
        
        maxSupply = _maxSupply * 10**decimals();
        tokenPrice = _tokenPrice;
        
        // Mint initial supply to the deployer
        _mint(msg.sender, initialSupply * 10**decimals());
        
        emit TokensMinted(msg.sender, initialSupply * 10**decimals());
    }
    
    // ============================================
    // PUBLIC FUNCTIONS
    // ============================================
    
    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Get token information
     * @return tokenName Token name
     * @return tokenSymbol Token symbol
     * @return tokenDecimals Token decimals
     * @return tokenTotalSupply Total tokens in circulation
     * @return tokenMaxSupply Maximum possible tokens
     * @return price Token price in wei
     */
    function getTokenInfo() public view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        uint256 tokenTotalSupply,
        uint256 tokenMaxSupply,
        uint256 price
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            maxSupply,
            tokenPrice
        );
    }
    
    // ============================================
    // OWNER FUNCTIONS
    // ============================================
    
    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= maxSupply, "Would exceed max supply");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Mint tokens to multiple addresses
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to mint
     */
    function mintBatch(address[] memory recipients, uint256[] memory amounts) public onlyOwner whenNotPaused {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Cannot mint to zero address");
            require(amounts[i] > 0, "Amount must be greater than 0");
            require(totalSupply() + amounts[i] <= maxSupply, "Would exceed max supply");
            
            _mint(recipients[i], amounts[i]);
            emit TokensMinted(recipients[i], amounts[i]);
        }
    }
    

    
    /**
     * @dev Update token price
     * @param newPrice New token price in wei
     */
    function setTokenPrice(uint256 newPrice) public onlyOwner {
        uint256 oldPrice = tokenPrice;
        tokenPrice = newPrice;
        emit TokenPriceUpdated(oldPrice, newPrice);
    }
    
    /**
     * @dev Pause all token transfers
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause all token transfers
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    // ============================================
    // OVERRIDE FUNCTIONS
    // ============================================
    
    /**
     * @dev Override transfer function
     */
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom function
     */
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Override approve function
     */
    function approve(address spender, uint256 amount) public override whenNotPaused returns (bool) {
        return super.approve(spender, amount);
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    /**
     * @dev Get remaining mintable tokens
     * @return Remaining tokens that can be minted
     */
    function getRemainingMintable() public view returns (uint256) {
        return maxSupply - totalSupply();
    }
    
    /**
     * @dev Check if contract is paused
     * @return True if paused, false otherwise
     */
    function isPaused() public view returns (bool) {
        return paused();
    }
}
