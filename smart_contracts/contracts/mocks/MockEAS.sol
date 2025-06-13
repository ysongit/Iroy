// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IEAS.sol";

contract MockEAS is IEAS {
    mapping(bytes32 => bool) private validAttestations;

    function attest(AttestationRequest calldata request) external payable override returns (bytes32) {
        bytes32 uid = keccak256(abi.encodePacked(
            request.schema,
            request.data.recipient,
            request.data.expirationTime,
            request.data.revocable,
            request.data.refUID,
            request.data.data,
            request.data.value,
            block.timestamp
        ));
        validAttestations[uid] = true;
        return uid;
    }

    function revoke(bytes32 schema, bytes32 uid) external override {
        validAttestations[uid] = false;
    }

    function isAttestationValid(bytes32 uid) external view override returns (bool) {
        return validAttestations[uid];
    }
} 