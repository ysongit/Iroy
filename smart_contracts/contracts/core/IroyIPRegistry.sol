// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../libraries/IroyTypes.sol";
import "../interfaces/IIroyIPRegistry.sol";

/**
 * @title IroyIPRegistry
 * @dev Core registry for IP assets with audit capabilities
 * @notice Manages IP asset registration, ownership, and audit reports
 */
contract IroyIPRegistry is 
    Ownable,
    ReentrancyGuard,
    Pausable,
    IIroyIPRegistry 
{
    using IroyTypes for *;

    /// @notice Version of the contract
    string public constant VERSION = "1.0.0";

    /// @notice Counter for IP asset IDs
    uint256 private _ipAssetIdCounter;

    /// @notice Mapping from IP ID to IP asset data
    mapping(uint256 => IroyTypes.IPAsset) private _ipAssets;

    /// @notice Mapping from content hash to IP asset ID
    mapping(string => uint256) private _contentHashToId;

    /// @notice Mapping from owner to their IP asset IDs
    mapping(address => uint256[]) private _ownerToIPs;

    /// @notice Mapping to check if content hash exists
    mapping(string => bool) private _contentHashExists;

    /// @notice Story Protocol integration address
    address public storyProtocolAddress;

    /// @notice Authorized auditors
    mapping(address => bool) public authorizedAuditors;

    /// @notice Events
    event IPAssetRegistered(
        uint256 indexed ipAssetId,
        address indexed owner,
        string contentHash,
        IroyTypes.MediaType mediaType
    );

    event IPAssetUpdated(
        uint256 indexed ipAssetId,
        string newMetadataURI
    );

    event StoryProtocolIntegrated(
        uint256 indexed ipAssetId,
        uint256 storyProtocolId
    );

    event AuditorAuthorized(address indexed auditor, bool authorized);

    /// @notice Modifiers
    modifier onlyIPOwner(uint256 ipAssetId) {
        if (_ipAssets[ipAssetId].owner != msg.sender) {
            revert IroyTypes.UnauthorizedAccess();
        }
        _;
    }

    modifier onlyAuthorizedAuditor() {
        if (!authorizedAuditors[msg.sender] && msg.sender != owner()) {
            revert IroyTypes.UnauthorizedAccess();
        }
        _;
    }

    modifier validIPAsset(uint256 ipAssetId) {
        if (ipAssetId == 0 || ipAssetId > _ipAssetIdCounter) {
            revert IroyTypes.InvalidIPAsset();
        }
        _;
    }

    /**
     * @notice Constructor
     * @param _storyProtocolAddress Address of Story Protocol contract
     */
    constructor(address _storyProtocolAddress) {
        storyProtocolAddress = _storyProtocolAddress;
        _ipAssetIdCounter = 0;
    }

    /**
     * @notice Register a new IP asset
     * @param contentHash Hash of the content
     * @param metadataURI URI pointing to metadata
     * @param mediaType Type of media
     * @return ipAssetId The ID of the registered IP asset
     */
    function registerIPAsset(
        string memory contentHash,
        string memory metadataURI,
        IroyTypes.MediaType mediaType
    ) external nonReentrant whenNotPaused returns (uint256 ipAssetId) {
        if (bytes(contentHash).length == 0) {
            revert IroyTypes.InvalidIPAsset();
        }
        
        if (_contentHashExists[contentHash]) {
            revert IroyTypes.IPAlreadyExists();
        }

        _ipAssetIdCounter++;
        ipAssetId = _ipAssetIdCounter;

        _ipAssets[ipAssetId] = IroyTypes.IPAsset({
            owner: msg.sender,
            contentHash: contentHash,
            metadataURI: metadataURI,
            mediaType: mediaType,
            createdAt: block.timestamp,
            storyProtocolId: 0,
            isRegistered: true
        });

        _contentHashToId[contentHash] = ipAssetId;
        _contentHashExists[contentHash] = true;
        _ownerToIPs[msg.sender].push(ipAssetId);

        emit IPAssetRegistered(ipAssetId, msg.sender, contentHash, mediaType);
    }

    /**
     * @notice Update IP asset metadata
     * @param ipAssetId ID of the IP asset
     * @param newMetadataURI New metadata URI
     */
    function updateIPAssetMetadata(
        uint256 ipAssetId,
        string memory newMetadataURI
    ) external onlyIPOwner(ipAssetId) validIPAsset(ipAssetId) {
        _ipAssets[ipAssetId].metadataURI = newMetadataURI;
        emit IPAssetUpdated(ipAssetId, newMetadataURI);
    }

    /**
     * @notice Integrate with Story Protocol
     * @param ipAssetId ID of the IP asset
     * @param storyProtocolId Story Protocol ID
     */
    function integrateWithStoryProtocol(
        uint256 ipAssetId,
        uint256 storyProtocolId
    ) external onlyAuthorizedAuditor validIPAsset(ipAssetId) {
        _ipAssets[ipAssetId].storyProtocolId = storyProtocolId;
        emit StoryProtocolIntegrated(ipAssetId, storyProtocolId);
    }

    /**
     * @notice Authorize or deauthorize auditors
     * @param auditor Address of the auditor
     * @param authorized Whether to authorize or deauthorize
     */
    function setAuditorAuthorization(
        address auditor,
        bool authorized
    ) external onlyOwner {
        authorizedAuditors[auditor] = authorized;
        emit AuditorAuthorized(auditor, authorized);
    }

    /**
     * @notice Get IP asset by ID
     * @param ipAssetId ID of the IP asset
     * @return IPAsset data
     */
    function getIPAsset(uint256 ipAssetId) 
        external 
        view 
        validIPAsset(ipAssetId) 
        returns (IroyTypes.IPAsset memory) 
    {
        return _ipAssets[ipAssetId];
    }

    /**
     * @notice Get IP asset ID by content hash
     * @param contentHash Hash of the content
     * @return IP asset ID
     */
    function getIPAssetIdByHash(string memory contentHash) 
        external 
        view 
        returns (uint256) 
    {
        return _contentHashToId[contentHash];
    }

    /**
     * @notice Get all IP assets owned by an address
     * @param owner Owner address
     * @return Array of IP asset IDs
     */
    function getIPAssetsByOwner(address owner) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _ownerToIPs[owner];
    }

    /**
     * @notice Check if content hash exists
     * @param contentHash Hash to check
     * @return True if exists
     */
    function contentHashExists(string memory contentHash) 
        external 
        view 
        returns (bool) 
    {
        return _contentHashExists[contentHash];
    }

    /**
     * @notice Get total number of registered IP assets
     * @return Total count
     */
    function getTotalIPAssets() external view returns (uint256) {
        return _ipAssetIdCounter;
    }

    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}