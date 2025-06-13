// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IWalletContentChecker {
    struct ContentCheck {
        bytes32 contentHash;
        address checker;
        uint256 timestamp;
        bool isValid;
        string[] violations;
        string metadata;
    }

    struct WalletCheck {
        address wallet;
        uint256 lastCheck;
        uint256 violationCount;
        bool isBlacklisted;
        string[] violations;
    }

    event ContentChecked(bytes32 indexed contentHash, address indexed checker, bool isValid);
    event WalletChecked(address indexed wallet, bool isBlacklisted);
    event WalletBlacklisted(address indexed wallet, string reason);
    event WalletUnblacklisted(address indexed wallet);

    function checkContent(
        bytes32 contentHash,
        string memory metadata
    ) external returns (bool);

    function checkWallet(address wallet) external returns (bool);
    function blacklistWallet(address wallet, string memory reason) external;
    function unblacklistWallet(address wallet) external;
    function getContentCheck(bytes32 contentHash) external view returns (ContentCheck memory);
    function getWalletCheck(address wallet) external view returns (WalletCheck memory);
} 