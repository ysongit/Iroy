// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IC2PAService {
    struct C2PAClaim {
        bytes32 claimHash;
        string claimGenerator;
        string claimSignature;
        uint256 timestamp;
        bool isValid;
        string metadata;
    }

    struct ContentAssertion {
        bytes32 contentHash;
        C2PAClaim[] claims;
        bool isVerified;
        uint256 lastVerified;
    }

    event ContentAsserted(bytes32 indexed contentHash, bytes32 indexed claimHash, bool isValid);
    event ClaimVerified(bytes32 indexed claimHash, bool isValid);

    function assertContent(
        bytes32 contentHash,
        string memory claimGenerator,
        string memory claimSignature,
        string memory metadata
    ) external returns (bool);

    function verifyClaim(bytes32 claimHash) external returns (bool);
    function getContentAssertion(bytes32 contentHash) external view returns (ContentAssertion memory);
    function getClaim(bytes32 claimHash) external view returns (C2PAClaim memory);
} 