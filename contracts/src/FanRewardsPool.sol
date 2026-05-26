// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WatchLeaderboard.sol";

/**
 * @title FanRewardsPool
 * @notice Holds accumulated USDC from the 10% fan pool slice of every micropayment.
 *         Distributes to top fans on the leaderboard at match-week end.
 *
 *         Uses weighted share distribution — rank 1 earns more than rank 10.
 *         Rank weights: [25, 20, 15, 12, 9, 7, 5, 4, 3, 2] (total = 102 shares)
 *
 *         The platform tops up this contract from its Circle pool wallet
 *         after accumulating the 10% slices off-chain.
 */
contract FanRewardsPool is Ownable {

    IERC20           public immutable usdc;
    WatchLeaderboard public immutable leaderboard;

    // Rank weights: rank 0 (1st) gets 25 shares, rank 9 (10th) gets 2 shares
    uint256[10] public RANK_WEIGHTS;

    event Deposited(address indexed from, uint256 amount);
    event Distributed(uint256 indexed weekId, string countryCode, uint256 totalPaid);

    constructor(address _usdc, address _leaderboard) Ownable(msg.sender) {
        usdc        = IERC20(_usdc);
        leaderboard = WatchLeaderboard(_leaderboard);
        RANK_WEIGHTS[0] = 25;
        RANK_WEIGHTS[1] = 20;
        RANK_WEIGHTS[2] = 15;
        RANK_WEIGHTS[3] = 12;
        RANK_WEIGHTS[4] = 9;
        RANK_WEIGHTS[5] = 7;
        RANK_WEIGHTS[6] = 5;
        RANK_WEIGHTS[7] = 4;
        RANK_WEIGHTS[8] = 3;
        RANK_WEIGHTS[9] = 2;
    }

    /**
     * @notice Deposit USDC into the pool. Caller must have approved this contract first.
     */
    function deposit(uint256 amount) external {
        usdc.transferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount);
    }

    /**
     * @notice Emergency top-up without transferFrom (direct send).
     *         Platform uses this when sending accumulated pool funds on-chain.
     */
    function receiveDeposit() external {}
    receive() external payable {}

    /**
     * @notice Distribute pool share to top fans of a country for a given week.
     *         Allocation from pool is proportional to that country's fan count vs global.
     *         Called once per country per week by backend after leaderboard is settled.
     *
     * @param weekId          The week to distribute for
     * @param countryCode     ISO country code
     * @param allocationUSDC  Backend calculates fair share per country (in USDC, 6 decimals)
     */
    function distribute(
        uint256 weekId,
        string calldata countryCode,
        uint256 allocationUSDC
    ) external onlyOwner {
        WatchLeaderboard.FanEntry[] memory board =
            leaderboard.getBoard(weekId, countryCode);
        require(board.length > 0, "FanRewardsPool: no leaderboard for this country/week");
        require(allocationUSDC > 0, "FanRewardsPool: zero allocation");

        uint256 totalWeight = 0;
        for (uint256 i = 0; i < board.length; i++) {
            totalWeight += RANK_WEIGHTS[i];
        }

        uint256 paid = 0;
        for (uint256 i = 0; i < board.length; i++) {
            uint256 share = (allocationUSDC * RANK_WEIGHTS[i]) / totalWeight;
            if (share > 0 && board[i].wallet != address(0)) {
                usdc.transfer(board[i].wallet, share);
                paid += share;
            }
        }
        emit Distributed(weekId, countryCode, paid);
    }

    /**
     * @notice View current pool balance.
     */
    function poolBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
