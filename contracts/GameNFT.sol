// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    uint256 public constant SCORE_THRESHOLD = 10;

    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => uint256) public tokenScores;

    constructor() ERC721("Block Base Achievement", "BLOCK") Ownable(msg.sender) {}

    function mintNFT(
        address to,
        uint256 score,
        string memory metadataURI
    ) public returns (uint256) {
        require(score >= SCORE_THRESHOLD, "Score below threshold");

        uint256 newTokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        tokenScores[newTokenId] = score;

        return newTokenId;
    }

    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _tokenURIs[tokenId] = uri;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }
}

