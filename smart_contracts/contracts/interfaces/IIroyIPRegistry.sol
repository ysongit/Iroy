// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/IroyTypes.sol";

interface IIroyIPRegistry {
    function registerIPAsset(
        string memory contentHash,
        string memory metadataURI,
        IroyTypes.MediaType mediaType
    ) external returns (uint256 ipAssetId);

    function getIPAsset(uint256 ipAssetId) external view returns (IroyTypes.IPAsset memory);
    function getIPAssetIdByHash(string memory contentHash) external view returns (uint256);
    function getIPAssetsByOwner(address owner) external view returns (uint256[] memory);
    function contentHashExists(string memory contentHash) external view returns (bool);
    function getTotalIPAssets() external view returns (uint256);
}