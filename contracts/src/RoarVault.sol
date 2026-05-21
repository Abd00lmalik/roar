// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title RoarVault
/// @notice Accepts USDC deposits, settles pay-per-second watch sessions,
///         and manages creator earnings and fan reward pool.
/// @dev Price is set at deploy time. All amounts in USDC 6-decimal units.
contract RoarVault is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    address public platformWallet;
    uint256 public pricePerSecond;

    uint256 public creatorBps = 8500;
    uint256 public platformBps = 500;
    uint256 public rewardPoolBps = 1000;

    mapping(address => uint256) public userBalance;
    mapping(address => uint256) public creatorEarnings;
    uint256 public platformRevenue;
    uint256 public fanRewardsPool;
    mapping(address => bool) public settlers;

    event Deposited(address indexed user, uint256 amount);
    event SessionSettled(
        address indexed viewer,
        address indexed creator,
        bytes32 indexed videoHash,
        uint256 billableSeconds,
        uint256 totalAmount,
        uint256 creatorShare,
        uint256 platformShare,
        uint256 rewardPoolShare
    );
    event CreatorWithdrawal(address indexed creator, uint256 amount);
    event ViewerWithdrawal(address indexed viewer, uint256 amount);
    event FanRewardPoolAccrued(uint256 newTotal);
    event SettlerUpdated(address indexed settler, bool authorized);

    constructor(
        address _usdc,
        address _platformWallet,
        uint256 _pricePerSecond,
        address _owner
    ) Ownable(_owner) {
        usdc = IERC20(_usdc);
        platformWallet = _platformWallet;
        pricePerSecond = _pricePerSecond;
    }

    modifier onlySettler() {
        require(settlers[msg.sender] || msg.sender == owner(), "Not authorized settler");
        _;
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        userBalance[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    function settleSession(
        address viewer,
        address creator,
        bytes32 videoHash,
        uint256 billableSeconds
    ) external onlySettler nonReentrant {
        uint256 totalAmount = billableSeconds * pricePerSecond;
        require(userBalance[viewer] >= totalAmount, "Insufficient viewer balance");

        uint256 creatorShare = (totalAmount * creatorBps) / 10000;
        uint256 platformShare = (totalAmount * platformBps) / 10000;
        uint256 rewardShare = totalAmount - creatorShare - platformShare;

        userBalance[viewer] -= totalAmount;
        creatorEarnings[creator] += creatorShare;
        platformRevenue += platformShare;
        fanRewardsPool += rewardShare;

        emit SessionSettled(
            viewer,
            creator,
            videoHash,
            billableSeconds,
            totalAmount,
            creatorShare,
            platformShare,
            rewardShare
        );
        emit FanRewardPoolAccrued(fanRewardsPool);
    }

    function withdrawCreatorEarnings() external nonReentrant {
        uint256 amount = creatorEarnings[msg.sender];
        require(amount > 0, "No earnings to withdraw");
        creatorEarnings[msg.sender] = 0;
        usdc.safeTransfer(msg.sender, amount);
        emit CreatorWithdrawal(msg.sender, amount);
    }

    function withdrawUnusedBalance() external nonReentrant {
        uint256 amount = userBalance[msg.sender];
        require(amount > 0, "No balance to withdraw");
        userBalance[msg.sender] = 0;
        usdc.safeTransfer(msg.sender, amount);
        emit ViewerWithdrawal(msg.sender, amount);
    }

    function withdrawPlatformRevenue() external onlyOwner nonReentrant {
        uint256 amount = platformRevenue;
        require(amount > 0, "No revenue");
        platformRevenue = 0;
        usdc.safeTransfer(platformWallet, amount);
    }

    function setSettler(address settler, bool authorized) external onlyOwner {
        settlers[settler] = authorized;
        emit SettlerUpdated(settler, authorized);
    }

    function setPlatformWallet(address _platformWallet) external onlyOwner {
        platformWallet = _platformWallet;
    }

    function setPricePerSecond(uint256 _price) external onlyOwner {
        pricePerSecond = _price;
    }

    function setSplits(uint256 _creatorBps, uint256 _platformBps, uint256 _rewardBps) external onlyOwner {
        require(_creatorBps + _platformBps + _rewardBps == 10000, "Must sum to 10000");
        creatorBps = _creatorBps;
        platformBps = _platformBps;
        rewardPoolBps = _rewardBps;
    }
}
