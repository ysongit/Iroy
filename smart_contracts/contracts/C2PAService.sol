// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./C2PAVerifier.sol";
import "./ContentAnalyzer.sol";
import "./JSONParser.sol";

contract C2PAService is Ownable {
    using C2PAVerifier for bytes;
    using ContentAnalyzer for bytes;
    using JSONParser for string;

    // State variables
    mapping(bytes32 => bool) public contentExists;
    mapping(bytes32 => C2PAVerifier.Claim[]) public contentClaims;
    mapping(bytes32 => C2PAVerifier.VerificationResult[]) public contentVerificationResults;
    mapping(bytes32 => ContentAnalyzer.AnalysisResult[]) public contentAnalysisResults;
    mapping(string => bool) public contentFormatSupport;
    mapping(string => bool) public claimTypeSupport;
    mapping(bytes32 => uint256) public lastVerificationTimestamp;
    mapping(bytes32 => uint256) public claimCount;
    mapping(bytes32 => ContentAnalyzer.ContentVersion[]) public contentVersions;
    mapping(bytes32 => ContentAnalyzer.ContentRelationship[]) public contentRelationships;

    // Pattern storage
    string[] public AI_STYLE_PATTERNS;
    string[] public PLAGIARISM_PATTERNS;
    mapping(string => string[]) public FORMAT_PATTERNS;
    mapping(string => string[]) public FORMAT_AI_PATTERNS;
    mapping(string => string[]) public FORMAT_PLAGIARISM_PATTERNS;

    // Constants
    uint256 public verificationCooldown;
    uint256 public maxClaimsPerContent;

    // Events
    event ContentAsserted(bytes32 indexed contentHash, bytes32 indexed claimHash, bool success);
    event ClaimVerified(bytes32 indexed claimHash, bool isValid);
    event PlagiarismDetected(bytes32 indexed contentHash, uint256 score);
    event StyleMatchDetected(bytes32 indexed contentHash, uint256 score);
    event ContentFormatSupportUpdated(string format, bool supported);
    event ClaimTypeSupportUpdated(string claimType, bool supported);
    event VerificationCooldownUpdated(uint256 cooldown);
    event MaxClaimsPerContentUpdated(uint256 maxClaims);
    event ContentVersionAdded(bytes32 indexed contentHash, bytes32 indexed versionHash);
    event ContentRelationshipAdded(bytes32 indexed contentHash, bytes32 indexed relatedContentHash);
    event PatternUpdated(string patternType, string pattern, bool added);

    constructor() Ownable() {
        verificationCooldown = 3600; // 1 hour
        maxClaimsPerContent = 5;
    }

    function setContentFormatSupport(string memory format, bool supported) external onlyOwner {
        contentFormatSupport[format] = supported;
        emit ContentFormatSupportUpdated(format, supported);
    }

    function setClaimTypeSupport(string memory claimType, bool supported) external onlyOwner {
        claimTypeSupport[claimType] = supported;
        emit ClaimTypeSupportUpdated(claimType, supported);
    }

    function setVerificationCooldown(uint256 cooldown) external onlyOwner {
        verificationCooldown = cooldown;
        emit VerificationCooldownUpdated(cooldown);
    }

    function setMaxClaimsPerContent(uint256 maxClaims) external onlyOwner {
        maxClaimsPerContent = maxClaims;
        emit MaxClaimsPerContentUpdated(maxClaims);
    }

    function addPattern(string memory patternType, string memory pattern) external onlyOwner {
        if (keccak256(bytes(patternType)) == keccak256(bytes("AI"))) {
            AI_STYLE_PATTERNS.push(pattern);
        } else if (keccak256(bytes(patternType)) == keccak256(bytes("PLAGIARISM"))) {
            PLAGIARISM_PATTERNS.push(pattern);
        }
        emit PatternUpdated(patternType, pattern, true);
    }

    function addFormatPattern(string memory format, string memory pattern) external onlyOwner {
        FORMAT_PATTERNS[format].push(pattern);
        emit PatternUpdated("FORMAT", pattern, true);
    }

    function addFormatAiPattern(string memory format, string memory pattern) external onlyOwner {
        FORMAT_AI_PATTERNS[format].push(pattern);
        emit PatternUpdated("FORMAT_AI", pattern, true);
    }

    function addFormatPlagiarismPattern(string memory format, string memory pattern) external onlyOwner {
        FORMAT_PLAGIARISM_PATTERNS[format].push(pattern);
        emit PatternUpdated("FORMAT_PLAGIARISM", pattern, true);
    }

    function assertContent(
        bytes32 contentHash,
        string memory generator,
        string memory signature,
        string memory metadata
    ) external {
        require(!contentExists[contentHash], "Content already exists");
        require(claimCount[contentHash] < maxClaimsPerContent, "Max claims reached for content");

        JSONParser.ParsedMetadata memory parsedMetadata = JSONParser.parseMetadata(metadata);
        require(contentFormatSupport[parsedMetadata.contentFormat], "Unsupported content format");
        require(claimTypeSupport[parsedMetadata.claimType], "Unsupported claim type");

        // Create claim
        C2PAVerifier.Claim memory claim = C2PAVerifier.Claim({
            claimHash: keccak256(abi.encodePacked(contentHash, generator, signature)),
            generator: generator,
            signature: signature,
            timestamp: block.timestamp,
            isValid: true
        });

        // Verify claim
        C2PAVerifier.VerificationResult memory verificationResult = C2PAVerifier.verifyClaim(
            abi.encodePacked(contentHash, generator, signature),
            signature
        );

        // Create version
        ContentAnalyzer.ContentVersion memory version = ContentAnalyzer.ContentVersion({
            versionHash: keccak256(abi.encodePacked(contentHash, block.timestamp)),
            timestamp: block.timestamp,
            changes: parsedMetadata.editHistory,
            metadata: parsedMetadata.assertions
        });

        // Analyze content
        ContentAnalyzer.AnalysisResult memory analysisResult = ContentAnalyzer.analyzeContent(
            abi.encodePacked(contentHash, metadata),
            metadata
        );

        // Store data
        contentExists[contentHash] = true;
        contentClaims[contentHash].push(claim);
        contentVerificationResults[contentHash].push(verificationResult);
        contentAnalysisResults[contentHash].push(analysisResult);
        contentVersions[contentHash].push(version);
        claimCount[contentHash]++;

        emit ContentAsserted(contentHash, claim.claimHash, true);
        emit ContentVersionAdded(contentHash, version.versionHash);
    }

    function addContentRelationship(
        bytes32 contentHash,
        bytes32 relatedContentHash,
        string memory relationshipType,
        uint256 similarityScore,
        string[] memory metadata
    ) external {
        require(contentExists[contentHash], "Content does not exist");
        require(contentExists[relatedContentHash], "Related content does not exist");

        ContentAnalyzer.ContentRelationship memory relationship = ContentAnalyzer.ContentRelationship({
            relatedContentHash: relatedContentHash,
            relationshipType: relationshipType,
            similarityScore: similarityScore,
            timestamp: block.timestamp,
            metadata: metadata
        });

        contentRelationships[contentHash].push(relationship);
        emit ContentRelationshipAdded(contentHash, relatedContentHash);
    }

    function verifyClaim(bytes32 claimHash) external {
        require(block.timestamp >= lastVerificationTimestamp[claimHash] + verificationCooldown, "Verification cooldown active");
        
        bool isValid = C2PAVerifier.verifySignature(
            abi.encodePacked(claimHash),
            "test-signature"
        );

        lastVerificationTimestamp[claimHash] = block.timestamp;
        emit ClaimVerified(claimHash, isValid);
    }

    function getContentAssertion(bytes32 contentHash) external view returns (
        C2PAVerifier.Claim[] memory claims,
        C2PAVerifier.VerificationResult[] memory verificationResults,
        ContentAnalyzer.AnalysisResult[] memory analysisResults
    ) {
        require(contentExists[contentHash], "Content does not exist");
        return (
            contentClaims[contentHash],
            contentVerificationResults[contentHash],
            contentAnalysisResults[contentHash]
        );
    }

    function getContentAnalysisResults(bytes32 contentHash) external view returns (ContentAnalyzer.AnalysisResult[] memory) {
        require(contentExists[contentHash], "Content does not exist");
        return contentAnalysisResults[contentHash];
    }

    function getContentVersions(bytes32 contentHash) external view returns (ContentAnalyzer.ContentVersion[] memory) {
        require(contentExists[contentHash], "Content does not exist");
        return contentVersions[contentHash];
    }

    function getContentRelationships(bytes32 contentHash) external view returns (ContentAnalyzer.ContentRelationship[] memory) {
        require(contentExists[contentHash], "Content does not exist");
        return contentRelationships[contentHash];
    }
} 