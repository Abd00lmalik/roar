// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockUSDC
/// @notice Testnet/local development USDC substitute. 6 decimals like real USDC.
/// @dev Deploy only on testnet. Never mainnet.
contract MockUSDC is ERC20, Ownable {
    uint8 private constant DECIMALS = 6;
    uint256 public constant FAUCET_AMOUNT = 100 * 10**6; // 100 USDC per drip

    mapping(address => uint256) public lastFaucetTime;
    uint256 public faucetCooldown = 24 hours;

    event FaucetDrip(address indexed recipient, uint256 amount);

    constructor(address initialOwner)
        ERC20("USD Coin (Testnet)", "USDC")
        Ownable(initialOwner)
    {
        _mint(initialOwner, 1_000_000 * 10**DECIMALS);
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    function faucet() external {
        require(
            block.timestamp >= lastFaucetTime[msg.sender] + faucetCooldown,
            "MockUSDC: cooldown active"
        );
        lastFaucetTime[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetDrip(msg.sender, FAUCET_AMOUNT);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function setCooldown(uint256 seconds_) external onlyOwner {
        faucetCooldown = seconds_;
    }
}
