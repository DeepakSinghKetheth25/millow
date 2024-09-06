// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/exntensions/ERC721URIStorage.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract RealEstate is ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("RealEstate", "REAL") {}

    function mint(string memory tokenURI) public returns (uint256) {

        _tokenIds.increment();
    
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId); //Creates a token & assigns sender as the owner of token.
        _setTokenURI(newItemId, tokenURI);//tokenURI now points to the json file that contains metadata about the token.

        return newItemId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}