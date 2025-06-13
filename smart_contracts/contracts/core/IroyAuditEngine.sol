// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../libraries/IroyTypes.sol";
import "../interfaces/IIroyAuditEngine.sol";
import "../interfaces/IIroyIPRegistry.sol";

/**
 * @title IroyAuditEngine
 * @dev Handles audit reports and similarity detection results
 * @notice Manages audit processes and stores audit results
 */
contract IroyAuditEngine is 
    Ownable,
    ReentrancyGuard,
    IIroyAuditEngine 
{
    using IroyTypes for *;

    /// @notice Version of the contract
    string public constant VERSION = "1.0.0";

    /// @notice Reference to IP Registry contract
    IIroyIPRegistry public ipRegistry;

    /// @notice Counter for audit report IDs
    uint256 private _auditReportIdCounter;

    /// @notice Mapping from audit ID to audit report
    mapping(uint256 => IroyTypes.AuditReport) private _auditReports;

    /// @notice Mapping from IP asset ID to audit report IDs
    mapping(uint256 => uint256[]) private _ipAssetToAudits;

    /// @notice Mapping from auditor to their audit report IDs
    mapping(address => uint256[]) private _auditorToReports;

    /// @notice Authorized audit providers
    mapping(address => bool) public authorizedProviders;

    /// @notice Minimum similarity score threshold (basis points, 10000 = 100%)
    uint256 public similarityThreshold;

    /// @notice Events
    event AuditReportCreated(
        uint256 indexed auditId,
        uint256 indexed ipAssetId,
        address indexed auditor,
        uint256 similarityScore
    );

    event AuditReportUpdated(
        uint256 indexed auditId,
        IroyTypes.AuditStatus newStatus
    );

    event SimilarityThresholdUpdated(uint256 newThreshold);

    event ProviderAuthorized(address indexed provider, bool authorized);

    /// @notice Modifiers
    modifier onlyAuthorizedProvider() {
        if (!authorizedProviders[msg.sender] && msg.sender != owner()) {
            revert IroyTypes.UnauthorizedAccess();
        }
        _;
    }

    modifier validAuditId(uint256 auditId) {
        if (auditId == 0 || auditId > _auditReportIdCounter) {
            revert IroyTypes.AuditNotFound();
        }
        _;
    }

    modifier validSimilarityScore(uint256 score) {
        if (score > 10000) {
            revert IroyTypes.InvalidSimilarityScore();
        }
        _;
    }

    /**
     * @notice Constructor
     * @param _ipRegistry Address of the IP Registry contract
     * @param _similarityThreshold Initial similarity threshold
     */
    constructor(
        address _ipRegistry,
        uint256 _similarityThreshold
    ) {
        ipRegistry = IIroyIPRegistry(_ipRegistry);
        similarityThreshold = _similarityThreshold;
        _auditReportIdCounter = 0;
    }

    /**
     * @notice Create a new audit report
     * @param ipAssetId ID of the IP asset being audited
     * @param similarityScore Overall similarity score
     * @param similarIPs Array of similar IP asset addresses
     * @param similarityScores Array of similarity scores for each similar IP
     * @param auditMetadataURI URI pointing to detailed audit metadata
     * @return auditId The ID of the created audit report
     */
    function createAuditReport(
        uint256 ipAssetId,
        uint256 similarityScore,
        address[] memory similarIPs,
        uint256[] memory similarityScores,
        string memory auditMetadataURI
    ) external onlyAuthorizedProvider nonReentrant 
      validSimilarityScore(similarityScore) 
      returns (uint256 auditId) {
        
        // Validate that IP asset exists
        IroyTypes.IPAsset memory ipAsset = ipRegistry.getIPAsset(ipAssetId);
        if (!ipAsset.isRegistered) {
            revert IroyTypes.InvalidIPAsset();
        }

        // Validate arrays have same length
        if (similarIPs.length != similarityScores.length) {
            revert IroyTypes.InvalidSimilarityScore();
        }

        // Validate individual similarity scores
        for (uint256 i = 0; i < similarityScores.length; i++) {
            if (similarityScores[i] > 10000) {
                revert IroyTypes.InvalidSimilarityScore();
            }
        }

        _auditReportIdCounter++;
        auditId = _auditReportIdCounter;

        _auditReports[auditId] = IroyTypes.AuditReport({
            ipAssetId: ipAssetId,
            similarityScore: similarityScore,
            similarIPs: similarIPs,
            similarityScores: similarityScores,
            auditMetadataURI: auditMetadataURI,
            auditedAt: block.timestamp,
            status: IroyTypes.AuditStatus.COMPLETED,
            auditor: msg.sender
        });

        _ipAssetToAudits[ipAssetId].push(auditId);
        _auditorToReports[msg.sender].push(auditId);

        emit AuditReportCreated(auditId, ipAssetId, msg.sender, similarityScore);
    }

    /**
     * @notice Update audit report status
     * @param auditId ID of the audit report
     * @param newStatus New status
     */
    function updateAuditStatus(
        uint256 auditId,
        IroyTypes.AuditStatus newStatus
    ) external onlyOwner validAuditId(auditId) {
        _auditReports[auditId].status = newStatus;
        emit AuditReportUpdated(auditId, newStatus);
    }

    /**
     * @notice Set similarity threshold
     * @param newThreshold New threshold in basis points (10000 = 100%)
     */
    function setSimilarityThreshold(uint256 newThreshold) 
        external 
        onlyOwner 
        validSimilarityScore(newThreshold) 
    {
        similarityThreshold = newThreshold;
        emit SimilarityThresholdUpdated(newThreshold);
    }

    /**
     * @notice Authorize or deauthorize audit providers
     * @param provider Address of the provider
     * @param authorized Whether to authorize or deauthorize
     */
    function setProviderAuthorization(
        address provider,
        bool authorized
    ) external onlyOwner {
        authorizedProviders[provider] = authorized;
        emit ProviderAuthorized(provider, authorized);
    }

    /**
     * @notice Get audit report by ID
     * @param auditId ID of the audit report
     * @return Audit report data
     */
    function getAuditReport(uint256 auditId) 
        external 
        view 
        validAuditId(auditId) 
        returns (IroyTypes.AuditReport memory) 
    {
        return _auditReports[auditId];
    }

    /**
     * @notice Get all audit reports for an IP asset
     * @param ipAssetId ID of the IP asset
     * @return Array of audit report IDs
     */
    function getAuditsByIPAsset(uint256 ipAssetId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _ipAssetToAudits[ipAssetId];
    }

    /**
     * @notice Get all audit reports by a specific auditor
     * @param auditor Address of the auditor
     * @return Array of audit report IDs
     */
    function getAuditsByAuditor(address auditor) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _auditorToReports[auditor];
    }

    /**
     * @notice Check if an IP asset has high similarity with existing IPs
     * @param ipAssetId ID of the IP asset
     * @return True if similarity exceeds threshold
     */
    function hasHighSimilarity(uint256 ipAssetId) 
        external 
        view 
        returns (bool) 
    {
        uint256[] memory auditIds = _ipAssetToAudits[ipAssetId];
        
        for (uint256 i = 0; i < auditIds.length; i++) {
            if (_auditReports[auditIds[i]].similarityScore >= similarityThreshold) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * @notice Get latest audit report for an IP asset
     * @param ipAssetId ID of the IP asset
     * @return Latest audit report ID (0 if none exists)
     */
    function getLatestAudit(uint256 ipAssetId) 
        external 
        view 
        returns (uint256) 
    {
        uint256[] memory auditIds = _ipAssetToAudits[ipAssetId];
        if (auditIds.length == 0) {
            return 0;
        }
        return auditIds[auditIds.length - 1];
    }

    /**
     * @notice Get total number of audit reports
     * @return Total count
     */
    function getTotalAuditReports() external view returns (uint256) {
        return _auditReportIdCounter;
    }
}