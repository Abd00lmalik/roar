// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title RoarBadges
/// @notice ERC1155 badge NFTs for fan achievements.
contract RoarBadges is ERC1155, Ownable {
    mapping(address => bool) public minters;
    mapping(uint256 => string) public badgeURIs;
    mapping(address => mapping(uint256 => bool)) public hasClaimed;

    event BadgeClaimed(address indexed recipient, uint256 indexed badgeId, string badgeName);
    event MinterUpdated(address indexed minter, bool authorized);

    constructor(string memory _baseURI, address _owner) ERC1155(_baseURI) Ownable(_owner) {}

    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized minter");
        _;
    }

    function mintBadge(address recipient, uint256 badgeId, string calldata badgeName) external onlyMinter {
        require(!hasClaimed[recipient][badgeId], "Badge already claimed");
        hasClaimed[recipient][badgeId] = true;
        _mint(recipient, badgeId, 1, "");
        emit BadgeClaimed(recipient, badgeId, badgeName);
    }

    function batchMintBadges(
        address[] calldata recipients,
        uint256[] calldata badgeIds,
        string[] calldata badgeNames
    ) external onlyMinter {
        require(recipients.length == badgeIds.length, "Length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            if (!hasClaimed[recipients[i]][badgeIds[i]]) {
                hasClaimed[recipients[i]][badgeIds[i]] = true;
                _mint(recipients[i], badgeIds[i], 1, "");
                emit BadgeClaimed(recipients[i], badgeIds[i], badgeNames[i]);
            }
        }
    }

    function setMinter(address minter, bool authorized) external onlyOwner {
        minters[minter] = authorized;
        emit MinterUpdated(minter, authorized);
    }

    function setBadgeURI(uint256 badgeId, string calldata _uri) external onlyOwner {
        badgeURIs[badgeId] = _uri;
    }

    function uri(uint256 badgeId) public view override returns (string memory) {
        string memory custom = badgeURIs[badgeId];
        if (bytes(custom).length > 0) return custom;
        return super.uri(badgeId);
    }
}
