// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title RoarballVault
/// @notice Settles EIP-712 signed watch vouchers on OKX X Layer Testnet (Chain ID 1952).
///         Each settlement executes an atomic 85/10/5 split of USDC micro-units.
contract RoarballVault is EIP712, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Token ───────────────────────────────────────────────────────────────
    IERC20 public immutable USDC;

    // ─── Treasury addresses ───────────────────────────────────────────────────
    address public immutable treasury;
    address public immutable fanRewardsPool;

    // ─── Authorized settler (backend worker signing key) ──────────────────────
    address public settler;

    // ─── Split constants (basis points, must sum to 10000) ───────────────────
    uint256 public constant CREATOR_BPS  = 8500; // 85%
    uint256 public constant FAN_BPS      = 1000; // 10%
    uint256 public constant TREASURY_BPS = 500;  //  5%

    // ─── EIP-712 voucher typehash ─────────────────────────────────────────────
    bytes32 public constant VOUCHER_TYPEHASH = keccak256(
        "WatchVoucher(address user,address creator,uint256 totalOwed,uint256 nonce)"
    );

    // ─── State ────────────────────────────────────────────────────────────────
    /// @notice Claimable USDC balances for creators (micro-units, 6 decimals)
    mapping(address => uint256) public creatorEarnings;

    /// @notice Per-user nonce — prevents voucher replay
    mapping(address => uint256) public nonces;

    // ─── Events ───────────────────────────────────────────────────────────────
    event VoucherSettled(
        address indexed user,
        address indexed creator,
        uint256 totalOwed,
        uint256 creatorCut,
        uint256 fanCut,
        uint256 treasuryCut,
        uint256 nonce
    );
    event CreatorClaimed(address indexed creator, uint256 amount);
    event SettlerUpdated(address indexed previous, address indexed next);

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(
        address _usdc,
        address _treasury,
        address _fanRewardsPool,
        address _settler
    )
        EIP712("RoarballVault", "1")
        Ownable(msg.sender)
    {
        require(_usdc           != address(0), "RoarballVault: zero USDC");
        require(_treasury       != address(0), "RoarballVault: zero treasury");
        require(_fanRewardsPool != address(0), "RoarballVault: zero fan pool");
        require(_settler        != address(0), "RoarballVault: zero settler");

        // Invariant: splits must total exactly 10000 BPS
        assert(CREATOR_BPS + FAN_BPS + TREASURY_BPS == 10000);

        USDC           = IERC20(_usdc);
        treasury       = _treasury;
        fanRewardsPool = _fanRewardsPool;
        settler        = _settler;
    }

    // ─── Modifiers ────────────────────────────────────────────────────────────
    modifier onlySettler() {
        require(msg.sender == settler, "RoarballVault: not settler");
        _;
    }

    // ─── Core settlement ──────────────────────────────────────────────────────

    /// @notice Settle a signed WatchVoucher. May only be called by the authorized settler.
    /// @param user      The viewer whose USDC allowance is consumed
    /// @param creator   The content creator receiving 85% of totalOwed
    /// @param totalOwed Amount in 6-decimal USDC micro-units (1 second = 1000 units)
    /// @param nonce     Must equal nonces[user] — prevents replay
    /// @param signature EIP-712 signature produced by user's wallet over the WatchVoucher struct
    function settleVoucher(
        address user,
        address creator,
        uint256 totalOwed,
        uint256 nonce,
        bytes calldata signature
    ) external onlySettler nonReentrant {
        // CHECK 1 — Nonce replay guard
        require(nonce == nonces[user], "RoarballVault: invalid nonce");

        // CHECK 2 — Non-zero amount
        require(totalOwed > 0, "RoarballVault: zero amount");

        // CHECK 3 — Address sanity
        require(creator != address(0), "RoarballVault: zero creator");
        require(creator != user,       "RoarballVault: self-payment");

        // CHECK 4 — EIP-712 signature verification (CEI: state change before transfer)
        bytes32 structHash = keccak256(
            abi.encode(VOUCHER_TYPEHASH, user, creator, totalOwed, nonce)
        );
        bytes32 digest    = _hashTypedDataV4(structHash);
        address recovered = ECDSA.recover(digest, signature);
        require(recovered == user, "RoarballVault: invalid signature");

        // EFFECT — Increment nonce before any external call
        nonces[user]++;

        // COMPUTE splits — remainder (dust) goes to creator, never locked
        uint256 fanCut      = (totalOwed * FAN_BPS)      / 10000;
        uint256 treasuryCut = (totalOwed * TREASURY_BPS) / 10000;
        uint256 creatorCut  = totalOwed - fanCut - treasuryCut; // absorbs rounding dust

        // INTERACT — Pull from user's pre-approved allowance
        USDC.safeTransferFrom(user, address(this), totalOwed);

        // Credit creator's internal claimable ledger
        creatorEarnings[creator] += creatorCut;

        // Push pool and treasury shares immediately
        USDC.safeTransfer(fanRewardsPool, fanCut);
        USDC.safeTransfer(treasury, treasuryCut);

        emit VoucherSettled(user, creator, totalOwed, creatorCut, fanCut, treasuryCut, nonce);
    }

    // ─── Creator claim ────────────────────────────────────────────────────────

    /// @notice Withdraw all claimable creator earnings to caller's wallet
    function claimCreatorEarnings() external nonReentrant {
        uint256 amount = creatorEarnings[msg.sender];
        require(amount > 0, "RoarballVault: nothing to claim");
        creatorEarnings[msg.sender] = 0;
        USDC.safeTransfer(msg.sender, amount);
        emit CreatorClaimed(msg.sender, amount);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    /// @notice Rotate the authorized settler address (onlyOwner)
    function setSettler(address _settler) external onlyOwner {
        require(_settler != address(0), "RoarballVault: zero settler");
        emit SettlerUpdated(settler, _settler);
        settler = _settler;
    }

    /// @notice Reject accidental OKB deposits
    receive() external payable { revert("RoarballVault: no OKB accepted"); }
}
