// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library JSONParser {
    struct ParsedMetadata {
        string claimType;
        string contentFormat;
        string[] aiGenerationInfo;
        string[] assertions;
        string[] editHistory;
        uint256 timestamp;
        string generator;
        string signature;
    }

    function parseMetadata(
        string memory json
    ) internal view returns (ParsedMetadata memory) {
        ParsedMetadata memory metadata = ParsedMetadata({
            claimType: "",
            contentFormat: "text",
            aiGenerationInfo: new string[](0),
            assertions: new string[](0),
            editHistory: new string[](0),
            timestamp: block.timestamp,
            generator: "",
            signature: ""
        });

        // Extract basic fields
        metadata.claimType = _extractString(json, "claimType");
        metadata.generator = _extractString(json, "generator");
        metadata.signature = _extractString(json, "signature");

        // Extract arrays
        metadata.aiGenerationInfo = _extractStringArray(json, "aiGenerationInfo");
        metadata.assertions = _extractStringArray(json, "assertions");
        metadata.editHistory = _extractStringArray(json, "editHistory");

        return metadata;
    }

    function _extractString(
        string memory json,
        string memory key
    ) internal pure returns (string memory) {
        string memory searchKey = string(abi.encodePacked('"', key, '":'));
        uint256 startIndex = _findString(json, searchKey);
        if (startIndex == type(uint256).max) return "";

        startIndex += bytes(searchKey).length;
        uint256 endIndex = _findStringEnd(json, startIndex);
        if (endIndex == type(uint256).max) return "";

        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = 0; i < result.length; i++) {
            result[i] = bytes(json)[startIndex + i];
        }

        return string(result);
    }

    function _extractUint(
        string memory json,
        string memory key
    ) internal pure returns (uint256) {
        string memory value = _extractString(json, key);
        if (bytes(value).length == 0) return 0;
        return uint256(bytes32(bytes(value)));
    }

    function _extractStringArray(
        string memory json,
        string memory key
    ) internal pure returns (string[] memory) {
        string memory searchKey = string(abi.encodePacked('"', key, '":'));
        uint256 startIndex = _findString(json, searchKey);
        if (startIndex == type(uint256).max) return new string[](0);

        startIndex += bytes(searchKey).length;
        uint256 endIndex = _findArrayEnd(json, startIndex);
        if (endIndex == type(uint256).max) return new string[](0);

        // Count array elements
        uint256 count = 0;
        uint256 currentIndex = startIndex;
        while (currentIndex < endIndex) {
            if (bytes(json)[currentIndex] == '"') {
                count++;
                currentIndex = _findStringEnd(json, currentIndex + 1);
            }
            currentIndex++;
        }

        string[] memory result = new string[](count);
        currentIndex = startIndex;
        uint256 resultIndex = 0;

        while (currentIndex < endIndex && resultIndex < count) {
            if (bytes(json)[currentIndex] == '"') {
                uint256 elementEnd = _findStringEnd(json, currentIndex + 1);
                bytes memory element = new bytes(elementEnd - currentIndex - 1);
                for (uint256 i = 0; i < element.length; i++) {
                    element[i] = bytes(json)[currentIndex + 1 + i];
                }
                result[resultIndex] = string(element);
                resultIndex++;
                currentIndex = elementEnd;
            }
            currentIndex++;
        }

        return result;
    }

    function _findString(
        string memory str,
        string memory search
    ) internal pure returns (uint256) {
        bytes memory strBytes = bytes(str);
        bytes memory searchBytes = bytes(search);

        for (uint256 i = 0; i < strBytes.length - searchBytes.length + 1; i++) {
            bool found = true;
            for (uint256 j = 0; j < searchBytes.length; j++) {
                if (strBytes[i + j] != searchBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) return i;
        }
        return type(uint256).max;
    }

    function _findStringEnd(
        string memory str,
        uint256 startIndex
    ) internal pure returns (uint256) {
        bytes memory strBytes = bytes(str);
        for (uint256 i = startIndex; i < strBytes.length; i++) {
            if (strBytes[i] == '"' && strBytes[i - 1] != '\\') {
                return i;
            }
        }
        return type(uint256).max;
    }

    function _findArrayEnd(
        string memory str,
        uint256 startIndex
    ) internal pure returns (uint256) {
        bytes memory strBytes = bytes(str);
        uint256 depth = 0;
        for (uint256 i = startIndex; i < strBytes.length; i++) {
            if (strBytes[i] == '[') depth++;
            if (strBytes[i] == ']') {
                if (depth == 0) return i;
                depth--;
            }
        }
        return type(uint256).max;
    }
} 