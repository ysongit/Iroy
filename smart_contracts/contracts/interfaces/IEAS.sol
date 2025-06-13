// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEAS {
    struct AttestationRequestData {
        address recipient;
        uint64 expirationTime;
        bool revocable;
        bytes32 refUID;
        bytes data;
        uint256 value;
    }

    struct AttestationRequest {
        bytes32 schema;
        AttestationRequestData data;
    }

    /**
     * @notice Creates a new attestation
     * @param request The attestation request
     * @return The UID of the new attestation
     */
    function attest(AttestationRequest calldata request) external payable returns (bytes32);

    /**
     * @notice Revokes an existing attestation
     * @param schema The schema of the attestation to revoke
     * @param uid The UID of the attestation to revoke
     */
    function revoke(bytes32 schema, bytes32 uid) external;

    /**
     * @notice Checks if an attestation is valid
     * @param uid The UID of the attestation to check
     * @return Whether the attestation is valid
     */
    function isAttestationValid(bytes32 uid) external view returns (bool);
} 