// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/IroyTypes.sol";

interface IIroyAuditEngine {
    function createAuditReport(
        uint256 ipAssetId,
        uint256 similarityScore,
        address[] memory similarIPs,
        uint256[] memory similarityScores,
        string memory auditMetadataURI
    ) external returns (uint256 auditId);

    function getAuditReport(uint256 auditId) external view returns (IroyTypes.AuditReport memory);
    function getAuditsByIPAsset(uint256 ipAssetId) external view returns (uint256[] memory);
    function hasHighSimilarity(uint256 ipAssetId) external view returns (bool);
    function getLatestAudit(uint256 ipAssetId) external view returns (uint256);
}