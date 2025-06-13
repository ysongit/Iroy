// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IServiceRegistry {
    struct Service {
        address serviceAddress;
        bool isActive;
        uint256 lastUpdated;
        string serviceType;
    }

    event ServiceRegistered(address indexed service, string serviceType);
    event ServiceUpdated(address indexed service, bool isActive);
    event ServiceRemoved(address indexed service);

    function registerService(address service, string memory serviceType) external;
    function updateService(address service, bool isActive) external;
    function removeService(address service) external;
    function getService(address service) external view returns (Service memory);
    function getServicesByType(string memory serviceType) external view returns (address[] memory);
} 