// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FanPassport is ERC721, Ownable, ReentrancyGuard {
    struct Passport {
        string countryCode;
        uint256 stakedOKB;
        uint256 mintedAt;
        bool active;
    }

    uint256 public constant MINT_STAKE = 0.01 ether;
    uint256 private _tokenIds;

    mapping(address => uint256) public holderToTokenId;
    mapping(uint256 => Passport) public passports;

    event PassportMinted(address indexed holder, uint256 tokenId, string countryCode);
    event PassportBurned(address indexed holder, uint256 tokenId);

    constructor() ERC721("Roarball Fan Passport", "ROARPASS") Ownable(msg.sender) {}

    function mintPassport(string calldata countryCode) external payable nonReentrant {
        require(msg.value >= MINT_STAKE, "FanPassport: insufficient OKB stake");
        require(holderToTokenId[msg.sender] == 0, "FanPassport: already has passport");
        require(bytes(countryCode).length == 2, "FanPassport: invalid country code");

        _tokenIds++;
        uint256 tokenId = _tokenIds;

        _safeMint(msg.sender, tokenId);

        passports[tokenId] = Passport({
            countryCode: countryCode,
            stakedOKB: msg.value,
            mintedAt: block.timestamp,
            active: true
        });

        holderToTokenId[msg.sender] = tokenId;

        emit PassportMinted(msg.sender, tokenId, countryCode);
    }

    function getStakedCountry(address holder) external view returns (string memory) {
        uint256 tokenId = holderToTokenId[holder];
        if (tokenId == 0) return "";
        return passports[tokenId].countryCode;
    }

    function burnPassport() external nonReentrant {
        uint256 tokenId = holderToTokenId[msg.sender];
        require(tokenId != 0, "FanPassport: no passport");

        uint256 staked = passports[tokenId].stakedOKB;
        passports[tokenId].active = false;
        holderToTokenId[msg.sender] = 0;

        _burn(tokenId);

        (bool ok,) = msg.sender.call{value: staked}("");
        require(ok, "FanPassport: OKB return failed");

        emit PassportBurned(msg.sender, tokenId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal override returns (address)
    {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "FanPassport: non-transferable");
        return super._update(to, tokenId, auth);
    }

    receive() external payable {}
}
