// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library IroyTypes {
    struct IPAsset {
        address owner;
        string contentHash;
        string metadataURI;
        MediaType mediaType;
        uint256 createdAt;
        uint256 storyProtocolId;
        bool isRegistered;
    }

    struct AuditReport {
        uint256 ipAssetId;
        uint256 similarityScore;
        address[] similarIPs;
        uint256[] similarityScores;
        string auditMetadataURI;
        uint256 auditedAt;
        AuditStatus status;
        address auditor;
    }

    struct AttestationData {
        uint256 ipAssetId;
        bytes32 schemaId;
        bytes attestationData;
        uint256 createdAt;
        address attester;
    }

    enum MediaType {
        IMAGE,
        VIDEO,
        AUDIO,
        TEXT,
        DOCUMENT,
        OTHER
    }

    enum AuditStatus {
        PENDING,
        COMPLETED,
        DISPUTED,
        VERIFIED
    }

    error InvalidIPAsset();
    error UnauthorizedAccess();
    error IPAlreadyExists();
    error AuditNotFound();
    error InvalidSimilarityScore();
    error AttestationFailed();
}