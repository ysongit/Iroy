// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IC2PAService.sol";
import "../libraries/C2PAVerifier.sol";
import "../libraries/ContentAnalyzer.sol";
import "../libraries/JSONParser.sol";

contract C2PAService is Ownable, ReentrancyGuard, IC2PAService {
    using C2PAVerifier for bytes;
    using ContentAnalyzer for bytes;
    using JSONParser for string;

    // State variables
    mapping(bytes32 => ContentAssertion) private contentAssertions;
    mapping(bytes32 => C2PAVerifier.Claim[]) private contentClaims;
    mapping(bytes32 => C2PAVerifier.VerificationResult[]) private contentVerificationResults;
    mapping(bytes32 => ContentAnalyzer.AnalysisResult[]) private contentAnalysisResults;
    mapping(string => bool) private contentFormatSupport;
    mapping(string => bool) private claimTypeSupport;
    mapping(bytes32 => uint256) private lastVerificationTimestamp;
    mapping(bytes32 => uint256) private claimCount;
    mapping(bytes32 => ContentAnalyzer.ContentVersion[]) private contentVersions;
    mapping(bytes32 => ContentAnalyzer.ContentRelationship[]) private contentRelationships;

    string[] private AI_STYLE_PATTERNS;
    string[] private PLAGIARISM_PATTERNS;
    mapping(string => string[]) private FORMAT_PATTERNS;
    mapping(string => string[]) private FORMAT_AI_PATTERNS;
    mapping(string => string[]) private FORMAT_PLAGIARISM_PATTERNS;

    uint256 public verificationCooldown;
    uint256 public maxClaimsPerContent;

    event VerificationCooldownUpdated(uint256 cooldown);
    event MaxClaimsPerContentUpdated(uint256 maxClaims);
    event ClaimTypeSupportUpdated(string claimType, bool supported);
    event ContentFormatSupportUpdated(string format, bool supported);
    event PatternUpdated(string patternType, string pattern, bool added);

    constructor() Ownable() {
        verificationCooldown = 3600; // 1 hour
        maxClaimsPerContent = 5;
    }

    function setVerificationCooldown(uint256 _cooldown) external onlyOwner {
        verificationCooldown = _cooldown;
        emit VerificationCooldownUpdated(_cooldown);
    }

    function setMaxClaimsPerContent(uint256 _maxClaims) external onlyOwner {
        maxClaimsPerContent = _maxClaims;
        emit MaxClaimsPerContentUpdated(_maxClaims);
    }

    function setClaimTypeSupport(string memory claimType, bool supported) external onlyOwner {
        claimTypeSupport[claimType] = supported;
        emit ClaimTypeSupportUpdated(claimType, supported);
    }

    function setContentFormatSupport(string memory format, bool supported) external onlyOwner {
        contentFormatSupport[format] = supported;
        emit ContentFormatSupportUpdated(format, supported);
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
        string memory claimGenerator,
        string memory claimSignature,
        string memory metadata
    ) external override nonReentrant returns (bool) {
        require(contentHash != bytes32(0), "Invalid content hash");
        require(bytes(claimGenerator).length > 0, "Invalid claim generator");
        require(bytes(claimSignature).length > 0, "Invalid claim signature");
        require(bytes(metadata).length > 0, "Invalid metadata");

        ContentAssertion storage assertion = contentAssertions[contentHash];
        require(assertion.claims.length < maxClaimsPerContent, "Max claims reached for content");

        JSONParser.ParsedMetadata memory parsedMetadata = JSONParser.parseMetadata(metadata);
        require(claimTypeSupport[parsedMetadata.claimType], "Unsupported claim type");
        require(contentFormatSupport[parsedMetadata.contentFormat], "Unsupported content format");

        bytes32 claimHash = keccak256(
            abi.encodePacked(contentHash, claimGenerator, claimSignature)
        );

        C2PAVerifier.Claim memory newClaim = C2PAVerifier.Claim({
            claimHash: claimHash,
            generator: claimGenerator,
            signature: claimSignature,
            timestamp: block.timestamp,
            isValid: true
        });

        contentClaims[contentHash].push(newClaim);
        
        // Convert C2PAVerifier.Claim to C2PAClaim
        C2PAClaim memory c2paClaim = C2PAClaim({
            claimHash: newClaim.claimHash,
            claimGenerator: newClaim.generator,
            claimSignature: newClaim.signature,
            timestamp: newClaim.timestamp,
            isValid: newClaim.isValid,
            metadata: metadata
        });
        
        assertion.claims.push(c2paClaim);
        assertion.contentHash = contentHash;
        assertion.lastVerified = block.timestamp;

        emit ContentAsserted(contentHash, claimHash, true);
        return true;
    }

    function verifyClaim(bytes32 claimHash) external override nonReentrant returns (bool) {
        require(claimHash != bytes32(0), "Invalid claim hash");
        
        // Find the claim in all content claims
        bool found = false;
        bytes32 contentHash;
        uint256 claimIndex;
        
        for (uint256 i = 0; i < contentClaims[contentHash].length; i++) {
            if (contentClaims[contentHash][i].claimHash == claimHash) {
                found = true;
                claimIndex = i;
                break;
            }
        }
        
        require(found, "Claim not found");
        require(
            block.timestamp >= contentClaims[contentHash][claimIndex].timestamp + verificationCooldown,
            "Verification cooldown active"
        );

        // Re-verify the claim
        C2PAVerifier.VerificationResult memory result = C2PAVerifier.verifyClaim(
            abi.encodePacked(contentHash, contentClaims[contentHash][claimIndex].generator, contentClaims[contentHash][claimIndex].signature),
            contentClaims[contentHash][claimIndex].signature
        );
        require(result.isValid, "Claim verification failed");

        contentVerificationResults[contentHash].push(result);
        lastVerificationTimestamp[contentHash] = block.timestamp;

        emit ClaimVerified(claimHash, true);
        return true;
    }

    function getContentAssertion(bytes32 contentHash) external view override returns (ContentAssertion memory) {
        require(contentHash != bytes32(0), "Invalid content hash");
        return contentAssertions[contentHash];
    }

    function getClaim(bytes32 claimHash) external view override returns (C2PAClaim memory) {
        require(claimHash != bytes32(0), "Invalid claim hash");
        
        // Find the claim in all content claims
        bytes32[] memory contentHashes = _getAllContentHashes();
        for (uint256 i = 0; i < contentHashes.length; i++) {
            bytes32 contentHash = contentHashes[i];
            for (uint256 j = 0; j < contentClaims[contentHash].length; j++) {
                if (contentClaims[contentHash][j].claimHash == claimHash) {
                    return C2PAClaim({
                        claimHash: contentClaims[contentHash][j].claimHash,
                        claimGenerator: contentClaims[contentHash][j].generator,
                        claimSignature: contentClaims[contentHash][j].signature,
                        timestamp: contentClaims[contentHash][j].timestamp,
                        isValid: contentClaims[contentHash][j].isValid,
                        metadata: ""
                    });
                }
            }
        }
        
        revert("Claim not found");
    }

    function getContentAnalysisResults(bytes32 contentHash) external view returns (ContentAnalyzer.AnalysisResult[] memory) {
        require(contentHash != bytes32(0), "Invalid content hash");
        return contentAnalysisResults[contentHash];
    }

    function getContentVersions(bytes32 contentHash) external view returns (ContentAnalyzer.ContentVersion[] memory) {
        require(contentHash != bytes32(0), "Invalid content hash");
        return contentVersions[contentHash];
    }

    function getContentRelationships(bytes32 contentHash) external view returns (ContentAnalyzer.ContentRelationship[] memory) {
        require(contentHash != bytes32(0), "Invalid content hash");
        return contentRelationships[contentHash];
    }

    function _getAllContentHashes() internal view returns (bytes32[] memory) {
        // Count content hashes with claims
        uint256 count = 0;
        bytes32[] memory tempHashes = new bytes32[](1000); // Temporary array to store hashes
        uint256 index = 0;
        
        // Iterate through all possible content hashes
        for (uint256 i = 0; i < 1000; i++) {
            bytes32 contentHash = bytes32(i);
            if (contentClaims[contentHash].length > 0) {
                tempHashes[index] = contentHash;
                index++;
                count++;
            }
        }

        // Create final array with exact size
        bytes32[] memory hashes = new bytes32[](count);
        for (uint256 i = 0; i < count; i++) {
            hashes[i] = tempHashes[i];
        }
        return hashes;
    }
} 