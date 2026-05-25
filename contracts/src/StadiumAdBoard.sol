// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StadiumAdBoard is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable USDC;
    address public immutable fanRewardsPool;
    address public immutable gasTreasury;

    struct AdSlot {
        string category;
        address advertiser;
        uint256 bidAmount;
        string adContentURI;
        uint256 expiresAt;
        bool active;
    }

    mapping(string => AdSlot) public activeSlots;
    mapping(string => AdSlot) public pendingBids;

    event SlotWon(string category, address indexed advertiser, uint256 bid);
    event RevenueDistributed(uint256 fanPoolCut, uint256 gasCut);

    constructor(address _usdc, address _fanRewardsPool, address _gasTreasury) Ownable(msg.sender) {
        require(_usdc != address(0) && _fanRewardsPool != address(0) && _gasTreasury != address(0));
        USDC = IERC20(_usdc);
        fanRewardsPool = _fanRewardsPool;
        gasTreasury = _gasTreasury;
    }

    function placeBid(
        string calldata category,
        string calldata adContentURI,
        uint256 bidAmount,
        uint256 durationSeconds
    ) external nonReentrant {
        require(bidAmount > 0, "AdBoard: zero bid");
        require(bytes(category).length > 0, "AdBoard: empty category");

        AdSlot storage current = activeSlots[category];

        if (current.active && current.expiresAt > block.timestamp) {
            require(bidAmount > current.bidAmount, "AdBoard: bid too low");
            USDC.safeTransfer(current.advertiser, current.bidAmount);
        }

        USDC.safeTransferFrom(msg.sender, address(this), bidAmount);

        activeSlots[category] = AdSlot({
            category: category,
            advertiser: msg.sender,
            bidAmount: bidAmount,
            adContentURI: adContentURI,
            expiresAt: block.timestamp + durationSeconds,
            active: true
        });

        _distributeRevenue(bidAmount);
        emit SlotWon(category, msg.sender, bidAmount);
    }

    function _distributeRevenue(uint256 amount) internal {
        uint256 fanCut = amount / 2;
        uint256 gasCut = amount - fanCut;

        USDC.safeTransfer(fanRewardsPool, fanCut);
        USDC.safeTransfer(gasTreasury, gasCut);

        emit RevenueDistributed(fanCut, gasCut);
    }

    function getActiveSlot(string calldata category) external view returns (AdSlot memory) {
        return activeSlots[category];
    }
}
