// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../libraries/IroyTypes.sol";
import "../interfaces/IIroyIPRegistry.sol";
import "../interfaces/IIroyAuditEngine.sol";
import "../interfaces/IEAS.sol";
import "../interfaces/ISchemaRegistry.sol";

/**
 * @title IroyAttestationManager
 * @dev Manages attestations for IP assets using Ethereum Attestation Service
 * @notice Handles creating and managing attestations for IP legitimacy
 */
contract IroyAttestationManager is Ownable, ReentrancyGuard {
    using IroyTypes for *;

    /// @notice EAS contract address
    IEAS public easContract;
    
    /// @notice Schema Registry contract address  
    ISchemaRegistry public schemaRegistry;
    
    /// @notice IP Registry reference
    IIroyIPRegistry public ipRegistry;
    
    /// @notice Audit Engine reference
    IIroyAuditEngine public auditEngine;

    /// @notice Schema ID for IP attestations
    bytes32 public ipAttestationSchema;

    /// @notice Mapping from IP asset ID to attestation UIDs
    mapping(uint256 => bytes32[]) public ipAttestations;

    /// @notice Mapping of revoked attestations
    mapping(bytes32 => bool) public revokedAttestations;

    /// @notice Mapping of delegated attesters
    mapping(address => bool) public delegatedAttesters;

    /// @notice Events
    event AttestationCreated(
        uint256 indexed ipAssetId,
        bytes32 indexed attestationUID,
        address indexed attester,
        bool revocable
    );

    event AttestationRevoked(
        bytes32 indexed attestationUID,
        address indexed revoker
    );

    event SchemaRegistered(bytes32 indexed schemaId);

    event DelegatedAttesterUpdated(
        address indexed attester,
        bool isDelegated
    );

    /**
     * @notice Initialize the contract
     * @param _ipRegistry IP Registry contract address
     * @param _auditEngine Audit Engine contract address
     * @param _easContract EAS contract address
     * @param _schemaRegistry Schema Registry contract address
     */
    constructor(
        address _ipRegistry,
        address _auditEngine,
        address _easContract,
        address _schemaRegistry
    ) Ownable() {
        ipRegistry = IIroyIPRegistry(_ipRegistry);
        auditEngine = IIroyAuditEngine(_auditEngine);
        easContract = IEAS(_easContract);
        schemaRegistry = ISchemaRegistry(_schemaRegistry);
    }

    /**
     * @notice Set the IP attestation schema ID
     * @param _schemaId The schema ID to use for IP attestations
     */
    function setIPAttestationSchema(bytes32 _schemaId) external onlyOwner {
        require(schemaRegistry.isRegistered(_schemaId), "Invalid schema ID");
        ipAttestationSchema = _schemaId;
        emit SchemaRegistered(_schemaId);
    }

    /**
     * @notice Update delegated attester status
     * @param attester Address of the attester
     * @param isDelegated Whether the attester is delegated
     */
    function updateDelegatedAttester(address attester, bool isDelegated) external onlyOwner {
        delegatedAttesters[attester] = isDelegated;
        emit DelegatedAttesterUpdated(attester, isDelegated);
    }

    /**
     * @notice Create an attestation for an IP asset
     * @param ipAssetId ID of the IP asset
     * @param attestationData Encoded attestation data
     * @param revocable Whether the attestation is revocable
     * @return attestationUID The UID of the created attestation
     */
    function createIPAttestation(
        uint256 ipAssetId,
        bytes calldata attestationData,
        bool revocable
    ) external nonReentrant returns (bytes32 attestationUID) {
        require(
            msg.sender == owner() || delegatedAttesters[msg.sender],
            "Not authorized to create attestations"
        );

        // Verify IP asset exists
        IroyTypes.IPAsset memory ipAsset = ipRegistry.getIPAsset(ipAssetId);
        require(ipAsset.isRegistered, "IP asset not found");

        // Create attestation using EAS
        attestationUID = easContract.attest(
            IEAS.AttestationRequest({
                schema: ipAttestationSchema,
                data: IEAS.AttestationRequestData({
                    recipient: address(this),
                    expirationTime: 0, // No expiration
                    revocable: revocable,
                    refUID: bytes32(0),
                    data: attestationData,
                    value: 0
                })
            })
        );

        ipAttestations[ipAssetId].push(attestationUID);

        emit AttestationCreated(ipAssetId, attestationUID, msg.sender, revocable);
    }

    /**
     * @notice Create multiple attestations in a batch
     * @param ipAssetIds Array of IP asset IDs
     * @param attestationDataArray Array of encoded attestation data
     * @param revocable Whether the attestations are revocable
     * @return attestationUIDs Array of created attestation UIDs
     */
    function batchCreateIPAttestations(
        uint256[] calldata ipAssetIds,
        bytes[] calldata attestationDataArray,
        bool revocable
    ) external nonReentrant returns (bytes32[] memory attestationUIDs) {
        require(
            msg.sender == owner() || delegatedAttesters[msg.sender],
            "Not authorized to create attestations"
        );
        require(
            ipAssetIds.length == attestationDataArray.length,
            "Array lengths must match"
        );

        attestationUIDs = new bytes32[](ipAssetIds.length);

        for (uint256 i = 0; i < ipAssetIds.length; i++) {
            // Verify IP asset exists
            IroyTypes.IPAsset memory ipAsset = ipRegistry.getIPAsset(ipAssetIds[i]);
            require(ipAsset.isRegistered, "IP asset not found");

            // Create attestation using EAS
            bytes32 attestationUID = easContract.attest(
                IEAS.AttestationRequest({
                    schema: ipAttestationSchema,
                    data: IEAS.AttestationRequestData({
                        recipient: address(this),
                        expirationTime: 0,
                        revocable: revocable,
                        refUID: bytes32(0),
                        data: attestationDataArray[i],
                        value: 0
                    })
                })
            );

            ipAttestations[ipAssetIds[i]].push(attestationUID);
            attestationUIDs[i] = attestationUID;

            emit AttestationCreated(ipAssetIds[i], attestationUID, msg.sender, revocable);
        }
    }

    /**
     * @notice Revoke an attestation
     * @param attestationUID The UID of the attestation to revoke
     */
    function revokeAttestation(bytes32 attestationUID) external {
        require(
            msg.sender == owner() || delegatedAttesters[msg.sender],
            "Not authorized to revoke attestations"
        );
        require(!revokedAttestations[attestationUID], "Attestation already revoked");

        easContract.revoke(ipAttestationSchema, attestationUID);
        revokedAttestations[attestationUID] = true;

        emit AttestationRevoked(attestationUID, msg.sender);
    }

    /**
     * @notice Get all attestations for an IP asset
     * @param ipAssetId ID of the IP asset
     * @return Array of attestation UIDs
     */
    function getIPAttestations(uint256 ipAssetId) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return ipAttestations[ipAssetId];
    }

    /**
     * @notice Check if an attestation is valid
     * @param attestationUID The UID of the attestation to check
     * @return bool Whether the attestation is valid
     */
    function isAttestationValid(bytes32 attestationUID) external view returns (bool) {
        return !revokedAttestations[attestationUID] && 
               easContract.isAttestationValid(attestationUID);
    }
}