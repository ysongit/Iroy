// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAIService {
    struct VectorAnalysis {
        bytes32 vectorHash;
        uint256[] similarityScores;
        bytes32[] similarIPs;
        bool hasPlagiarism;
        uint256 plagiarismScore;
    }

    struct StyleAnalysis {
        bytes32 styleHash;
        uint256[] styleScores;
        bytes32[] similarStyles;
        bool hasStyleMatch;
        uint256 styleMatchScore;
    }

    struct ContentAnalysis {
        VectorAnalysis vectorAnalysis;
        StyleAnalysis styleAnalysis;
        string metadata;
        uint256 timestamp;
    }

    event ContentAnalyzed(
        bytes32 indexed contentHash,
        bytes32 indexed vectorHash,
        bytes32 indexed styleHash,
        bool hasPlagiarism,
        bool hasStyleMatch
    );

    function analyzeContent(
        bytes memory content,
        string memory contentType
    ) external returns (ContentAnalysis memory);

    function getVectorSimilarity(
        bytes32 vectorHash1,
        bytes32 vectorHash2
    ) external view returns (uint256);

    function getStyleSimilarity(
        bytes32 styleHash1,
        bytes32 styleHash2
    ) external view returns (uint256);

    function updateAIModel(
        bytes32 modelId,
        bytes memory modelData
    ) external;
} 