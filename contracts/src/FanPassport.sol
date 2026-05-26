// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FanPassport
 * @notice Soulbound identity NFT for Roarball World Cup fans.
 *         Every user gets exactly one. Cannot be transferred.
 *         Stores country, confederation, and cumulative watch-time (updated by backend).
 */
contract FanPassport is ERC721, Ownable {

    struct Passport {
        string  countryCode;       // e.g. "BR", "ES", "GH"
        string  confederation;     // "UEFA", "CAF", "AFC", etc.
        uint256 watchTimeSeconds;  // lifetime cumulative — updated by backend
        uint256 mintedAt;
    }

    mapping(uint256 => Passport) public passports;
    mapping(address => uint256)  public addressToTokenId;  // 0 = not minted
    uint256 private _nextTokenId = 1;

    event PassportMinted(address indexed user, uint256 tokenId, string countryCode);
    event WatchTimeUpdated(uint256 indexed tokenId, uint256 newTotal);

    constructor() ERC721("ROAR Fan Passport", "ROAR") Ownable(msg.sender) {}

    // ── Soulbound: block all transfers after mint ─────────────────────────────
    function _update(address to, uint256 tokenId, address auth)
        internal override returns (address) {
        require(
            _ownerOf(tokenId) == address(0),
            "FanPassport: soulbound - non-transferable"
        );
        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Mint a Fan Passport for a user. Owner-only. Idempotent guard on-chain.
     * @param user         Wallet address of the fan
     * @param countryCode  ISO 3166-1 alpha-2 or custom (e.g. "GB-ENG")
     * @param confederation  Confederation string e.g. "UEFA"
     */
    function mint(
        address user,
        string calldata countryCode,
        string calldata confederation
    ) external onlyOwner returns (uint256) {
        require(addressToTokenId[user] == 0, "FanPassport: already minted");
        uint256 tokenId = _nextTokenId++;
        _safeMint(user, tokenId);
        passports[tokenId] = Passport(countryCode, confederation, 0, block.timestamp);
        addressToTokenId[user] = tokenId;
        emit PassportMinted(user, tokenId, countryCode);
        return tokenId;
    }

    /**
     * @notice Called by backend in batches — NOT per second.
     *         Accumulates watch-time off-chain; flushes every 60 seconds.
     */
    function updateWatchTime(uint256 tokenId, uint256 additionalSeconds)
        external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "FanPassport: token does not exist");
        passports[tokenId].watchTimeSeconds += additionalSeconds;
        emit WatchTimeUpdated(tokenId, passports[tokenId].watchTimeSeconds);
    }

    /**
     * @notice Convenience view — returns Passport struct and tokenId for an address.
     */
    function getPassport(address user) external view
        returns (Passport memory passport, uint256 tokenId) {
        tokenId = addressToTokenId[user];
        require(tokenId != 0, "FanPassport: no passport for this address");
        passport = passports[tokenId];
    }

    /**
     * @notice Check if an address already has a passport.
     */
    function hasPassport(address user) external view returns (bool) {
        return addressToTokenId[user] != 0;
    }
}
