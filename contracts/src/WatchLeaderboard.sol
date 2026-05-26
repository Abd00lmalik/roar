// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WatchLeaderboard
 * @notice Stores weekly watch-time snapshots per country.
 *         Anyone can query the leaderboard — fully verifiable on-chain.
 *         Backend settles it at the end of each match week.
 *
 *         The key fan-facing feature: top 10 fans per country each week
 *         share the Fan Rewards Pool. Rankings are public and cannot be
 *         manipulated by the backend after submission.
 */
contract WatchLeaderboard is Ownable {

    struct FanEntry {
        address wallet;
        uint256 watchSeconds;
        string  countryCode;
    }

    // weekId => countryCode => ranked fan list (top 10, sorted by backend before submit)
    mapping(uint256 => mapping(string => FanEntry[])) public weeklyBoard;

    // weekId => countryCode => settled
    mapping(uint256 => mapping(string => bool)) public settled;

    uint256 public currentWeekId;

    event LeaderboardSubmitted(uint256 indexed weekId, string countryCode, uint256 fanCount);
    event WeekAdvanced(uint256 newWeekId);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Backend submits top 10 fans per country at week end.
     *         fans[] MUST be sorted descending by watchSeconds before calling.
     *         Once settled, a country/week cannot be re-submitted.
     */
    function submitWeeklyBoard(
        uint256 weekId,
        string calldata countryCode,
        address[] calldata wallets,
        uint256[] calldata watchSeconds
    ) external onlyOwner {
        require(!settled[weekId][countryCode], "WatchLeaderboard: already settled");
        require(wallets.length == watchSeconds.length, "WatchLeaderboard: length mismatch");
        require(wallets.length <= 10, "WatchLeaderboard: max 10 fans per country");

        delete weeklyBoard[weekId][countryCode];
        for (uint256 i = 0; i < wallets.length; i++) {
            weeklyBoard[weekId][countryCode].push(
                FanEntry(wallets[i], watchSeconds[i], countryCode)
            );
        }
        settled[weekId][countryCode] = true;
        emit LeaderboardSubmitted(weekId, countryCode, wallets.length);
    }

    /**
     * @notice Advance to the next week. Called by backend at match-week end
     *         after all countries have been settled.
     */
    function advanceWeek() external onlyOwner {
        currentWeekId++;
        emit WeekAdvanced(currentWeekId);
    }

    /**
     * @notice Read the leaderboard for a given week and country.
     */
    function getBoard(uint256 weekId, string calldata countryCode)
        external view returns (FanEntry[] memory) {
        return weeklyBoard[weekId][countryCode];
    }

    /**
     * @notice Get current week's board for a country (convenience).
     */
    function getCurrentBoard(string calldata countryCode)
        external view returns (FanEntry[] memory) {
        return weeklyBoard[currentWeekId][countryCode];
    }
}
