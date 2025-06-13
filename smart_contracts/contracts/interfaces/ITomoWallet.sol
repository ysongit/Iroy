// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITomoWallet {
    struct WalletInfo {
        address walletAddress;
        uint256 balance;
        bool isVerified;
        uint256 lastVerified;
    }

    struct ContentVerification {
        bytes32 contentHash;
        address verifier;
        uint256 timestamp;
        bool isValid;
        string metadata;
    }

    event WalletVerified(address indexed wallet, uint256 timestamp);
    event ContentVerified(bytes32 indexed contentHash, address indexed verifier, bool isValid);

    function verifyWallet(address wallet) external returns (bool);
    function verifyContent(bytes32 contentHash, string memory metadata) external returns (bool);
    function getWalletInfo(address wallet) external view returns (WalletInfo memory);
    function getContentVerification(bytes32 contentHash) external view returns (ContentVerification memory);
} 