// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BillingController
 * @notice VAR Review lock — when a VAR review starts, backend calls lockBilling().
 *         Frontend listens for the event and freezes the Circle micropayment loop
 *         immediately. No payments during VAR reviews — fans love this.
 *
 *         matchId is a bytes32 identifier — typically keccak256(abi.encodePacked(matchSlug)).
 */
contract BillingController is Ownable {

    mapping(bytes32 => bool) public matchLocked;

    event BillingLocked(bytes32 indexed matchId, string reason);
    event BillingUnlocked(bytes32 indexed matchId);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Lock billing for a match (VAR review, halftime, etc.)
     *         Emits BillingLocked — frontend billing loop listens for this event.
     */
    function lockBilling(bytes32 matchId, string calldata reason)
        external onlyOwner {
        matchLocked[matchId] = true;
        emit BillingLocked(matchId, reason);
    }

    /**
     * @notice Unlock billing for a match (play resumes after VAR).
     *         Emits BillingUnlocked — frontend billing loop listens for this event.
     */
    function unlockBilling(bytes32 matchId) external onlyOwner {
        matchLocked[matchId] = false;
        emit BillingUnlocked(matchId);
    }

    /**
     * @notice Read-only check — used by backend before processing each charge.
     */
    function isLocked(bytes32 matchId) external view returns (bool) {
        return matchLocked[matchId];
    }

    /**
     * @notice Convenience: compute the matchId bytes32 from a string slug.
     *         Frontend and backend should use the same encoding.
     */
    function encodeMatchId(string calldata matchSlug) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(matchSlug));
    }
}
