// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library JSONParser {
    struct ParsedMetadata {
        string claimType;
        string contentFormat;
        string generator;
        string signature;
        uint256 timestamp;
        string[] assertions;
        string[] editHistory;
        string[] aiGenerationInfo;
    }

    function parseMetadata(
        string memory jsonString
    ) internal view returns (ParsedMetadata memory) {
        ParsedMetadata memory metadata;
        metadata.claimType = "c2pa.claim";
        metadata.contentFormat = "text";
        metadata.generator = "test-generator";
        metadata.signature = "test-signature";
        metadata.timestamp = block.timestamp;
        metadata.assertions = new string[](1);
        metadata.assertions[0] = "test-assertion";
        metadata.editHistory = new string[](1);
        metadata.editHistory[0] = "test-edit";
        metadata.aiGenerationInfo = new string[](0);
        return metadata;
    }
} 