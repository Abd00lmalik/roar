// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IFanPassport {
    function holderToTokenId(address holder) external view returns (uint256);
}

contract VARSystem is Ownable, ReentrancyGuard {
    IFanPassport public immutable fanPassport;

    uint256 public constant CHALLENGE_STAKE = 0.05 ether;
    uint256 public constant VOTING_PERIOD = 48 hours;
    uint256 public constant QUORUM_THRESHOLD = 10;

    enum VARStatus { Open, Upheld, Dismissed, Expired }

    struct VARChallenge {
        string videoId;
        address challenger;
        uint256 stakeAmount;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 openedAt;
        VARStatus status;
    }

    mapping(string => VARChallenge) public challenges;
    mapping(string => mapping(address => bool)) public hasVoted;
    mapping(string => bool) public burnedVideos;

    event ChallengeOpened(string videoId, address indexed challenger);
    event VoteCast(string videoId, address indexed voter, bool uphold);
    event VideoBurned(string videoId);
    event ChallengeDismissed(string videoId);

    constructor(address _fanPassport) Ownable(msg.sender) {
        fanPassport = IFanPassport(_fanPassport);
    }

    modifier onlyPassportHolder() {
        require(fanPassport.holderToTokenId(msg.sender) != 0, "VARSystem: must hold Fan Passport to participate");
        _;
    }

    function openChallenge(string calldata videoId) external payable nonReentrant onlyPassportHolder {
        require(msg.value >= CHALLENGE_STAKE, "VARSystem: insufficient stake");
        require(challenges[videoId].openedAt == 0, "VARSystem: challenge already open");
        require(!burnedVideos[videoId], "VARSystem: already burned");

        challenges[videoId] = VARChallenge({
            videoId: videoId,
            challenger: msg.sender,
            stakeAmount: msg.value,
            votesFor: 0,
            votesAgainst: 0,
            openedAt: block.timestamp,
            status: VARStatus.Open
        });

        emit ChallengeOpened(videoId, msg.sender);
    }

    function castVote(string calldata videoId, bool uphold) external nonReentrant onlyPassportHolder {
        VARChallenge storage c = challenges[videoId];
        require(c.openedAt != 0, "VARSystem: no challenge");
        require(c.status == VARStatus.Open, "VARSystem: challenge closed");
        require(block.timestamp < c.openedAt + VOTING_PERIOD, "VARSystem: voting period ended");
        require(!hasVoted[videoId][msg.sender], "VARSystem: already voted");

        hasVoted[videoId][msg.sender] = true;
        if (uphold) c.votesFor++; else c.votesAgainst++;

        emit VoteCast(videoId, msg.sender, uphold);
    }

    function settleChallenge(string calldata videoId) external nonReentrant {
        VARChallenge storage c = challenges[videoId];
        require(c.openedAt != 0, "VARSystem: no challenge");
        require(c.status == VARStatus.Open, "VARSystem: already settled");
        require(block.timestamp >= c.openedAt + VOTING_PERIOD, "VARSystem: voting still open");

        uint256 totalVotes = c.votesFor + c.votesAgainst;

        if (totalVotes < QUORUM_THRESHOLD) {
            c.status = VARStatus.Expired;
            (bool ok,) = c.challenger.call{value: c.stakeAmount}("");
            require(ok, "VARSystem: stake return failed");
            emit ChallengeDismissed(videoId);
            return;
        }

        if (c.votesFor > c.votesAgainst) {
            c.status = VARStatus.Upheld;
            burnedVideos[videoId] = true;
            (bool ok,) = c.challenger.call{value: c.stakeAmount}("");
            require(ok);
            emit VideoBurned(videoId);
        } else {
            c.status = VARStatus.Dismissed;
            (bool ok,) = owner().call{value: c.stakeAmount}("");
            require(ok);
            emit ChallengeDismissed(videoId);
        }
    }

    function isVideoBurned(string calldata videoId) external view returns (bool) {
        return burnedVideos[videoId];
    }
}
