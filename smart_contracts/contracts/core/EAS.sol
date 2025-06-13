// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SchemaRegistry.sol";

contract EAS is Ownable {
    SchemaRegistry public schemaRegistry;
    
    struct Attestation {
        bytes32 schemaId;
        address attester;
        address recipient;
        uint256 expirationTime;
        bool revocable;
        bytes data;
    }

    mapping(bytes32 => Attestation) public attestations;
    mapping(bytes32 => bool) public revokedAttestations;

    event Attested(bytes32 indexed attestationId, bytes32 indexed schemaId, address attester, address recipient, uint256 expirationTime, bool revocable, bytes data);
    event Revoked(bytes32 indexed attestationId, address revoker);

    constructor(address _schemaRegistry) Ownable() {
        schemaRegistry = SchemaRegistry(_schemaRegistry);
    }

    function attest(
        bytes32 schemaId,
        address recipient,
        uint256 expirationTime,
        bool revocable,
        bytes memory data
    ) external returns (bytes32) {
        require(schemaRegistry.isRegistered(schemaId), "Schema not registered");
        
        bytes32 attestationId = keccak256(abi.encodePacked(
            schemaId,
            msg.sender,
            recipient,
            expirationTime,
            revocable,
            data
        ));

        attestations[attestationId] = Attestation({
            schemaId: schemaId,
            attester: msg.sender,
            recipient: recipient,
            expirationTime: expirationTime,
            revocable: revocable,
            data: data
        });

        emit Attested(attestationId, schemaId, msg.sender, recipient, expirationTime, revocable, data);
        return attestationId;
    }

    function revoke(bytes32 attestationId) external {
        Attestation memory attestation = attestations[attestationId];
        require(attestation.attester == msg.sender || owner() == msg.sender, "Not authorized to revoke");
        require(attestation.revocable, "Attestation not revocable");
        require(!revokedAttestations[attestationId], "Attestation already revoked");

        revokedAttestations[attestationId] = true;
        emit Revoked(attestationId, msg.sender);
    }

    function isAttestationValid(bytes32 attestationId) external view returns (bool) {
        Attestation memory attestation = attestations[attestationId];
        if (attestation.attester == address(0)) return false;
        if (revokedAttestations[attestationId]) return false;
        if (attestation.expirationTime != 0 && block.timestamp > attestation.expirationTime) return false;
        return true;
    }

    function getAttestation(bytes32 attestationId) external view returns (Attestation memory) {
        return attestations[attestationId];
    }
} 