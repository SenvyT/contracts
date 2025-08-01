// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyNFT
 * @dev A simple NFT contract with ERC-721 standard functionality
 * Features:
 * - Mint NFTs with custom URIs
 * - Burn NFTs
 * - Set base URI for metadata
 * - Pause/unpause functionality
 * - Owner-only minting
 */
contract MyNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    
    // Maximum supply of NFTs
    uint256 public maxSupply;
    
    // Minting price
    uint256 public mintPrice;
    
    // Pause functionality
    bool public isPaused;
    
    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event NFTBurned(uint256 indexed tokenId);
    event MintPriceUpdated(uint256 newPrice);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    event ContractPaused(bool paused);

    /**
     * @dev Constructor sets the name, symbol, max supply, and mint price
     * @param _name Name of the NFT collection
     * @param _symbol Symbol of the NFT collection
     * @param _maxSupply Maximum number of NFTs that can be minted
     * @param _mintPrice Price to mint each NFT (in wei)
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
        isPaused = false;
    }

    /**
     * @dev Mint a new NFT
     * @param to Address to mint the NFT to
     * @param tokenURI URI for the token metadata
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to, string memory tokenURI) 
        public 
        payable 
        returns (uint256) 
    {
        require(!isPaused, "Contract is paused");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_tokenIds < maxSupply, "Max supply reached");
        require(to != address(0), "Cannot mint to zero address");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        emit NFTMinted(to, newTokenId, tokenURI);
        return newTokenId;
    }



    /**
     * @dev Owner-only minting (free)
     * @param to Address to mint the NFT to
     * @param tokenURI URI for the token metadata
     * @return tokenId The ID of the newly minted token
     */
    function ownerMint(address to, string memory tokenURI) 
        public 
        onlyOwner 
        returns (uint256) 
    {
        require(!isPaused, "Contract is paused");
        require(_tokenIds < maxSupply, "Max supply reached");
        require(to != address(0), "Cannot mint to zero address");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        emit NFTMinted(to, newTokenId, tokenURI);
        return newTokenId;
    }

    /**
     * @dev Burn an NFT (only owner or token owner can burn)
     * @param tokenId ID of the token to burn
     */
    function burn(uint256 tokenId) public {
        require(
            (ownerOf(tokenId) == msg.sender || getApproved(tokenId) == msg.sender || isApprovedForAll(ownerOf(tokenId), msg.sender)) || owner() == msg.sender,
            "Not authorized to burn this token"
        );
        
        _burn(tokenId);
        emit NFTBurned(tokenId);
    }

    /**
     * @dev Update the mint price (owner only)
     * @param newPrice New mint price in wei
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }

    /**
     * @dev Update the max supply (owner only)
     * @param newMaxSupply New maximum supply
     */
    function setMaxSupply(uint256 newMaxSupply) public onlyOwner {
        require(newMaxSupply >= _tokenIds, "New max supply cannot be less than current supply");
        maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(newMaxSupply);
    }

    /**
     * @dev Pause or unpause the contract (owner only)
     * @param paused True to pause, false to unpause
     */
    function setPaused(bool paused) public onlyOwner {
        isPaused = paused;
        emit ContractPaused(paused);
    }

    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Get the current token count
     * @return Current number of tokens minted
     */
    function getCurrentTokenCount() public view returns (uint256) {
        return _tokenIds;
    }

    /**
     * @dev Get the remaining supply
     * @return Number of tokens that can still be minted
     */
    function getRemainingSupply() public view returns (uint256) {
        return maxSupply - _tokenIds;
    }

    /**
     * @dev Check if a token exists
     * @param tokenId ID of the token to check
     * @return True if the token exists
     */
    function tokenExists(uint256 tokenId) public view returns (bool) {
        try this.ownerOf(tokenId) {
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @dev Get all tokens owned by an address
     * @param owner Address to get tokens for
     * @return Array of token IDs owned by the address
     */
    function getTokensByOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokens = new uint256[](tokenCount);
        
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= _tokenIds; i++) {
            try this.ownerOf(i) {
                if (ownerOf(i) == owner) {
                    tokens[currentIndex] = i;
                    currentIndex++;
                }
            } catch {
                // Token doesn't exist, skip
            }
        }
        
        return tokens;
    }

    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        // Allow the contract to receive ETH
    }
} 