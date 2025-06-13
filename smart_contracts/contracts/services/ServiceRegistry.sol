// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IServiceRegistry.sol";

contract ServiceRegistry is Ownable, ReentrancyGuard, IServiceRegistry {
    mapping(address => Service) private services;
    mapping(string => address[]) private servicesByType;
    mapping(string => bool) private validServiceTypes;

    constructor() Ownable() {
        // Initialize valid service types
        validServiceTypes["C2PA"] = true;
        validServiceTypes["WALLET_CHECKER"] = true;
        validServiceTypes["AI_SERVICE"] = true;
    }

    function registerService(
        address service,
        string memory serviceType
    ) external override onlyOwner {
        require(service != address(0), "Invalid service address");
        require(validServiceTypes[serviceType], "Invalid service type");
        require(services[service].serviceAddress == address(0), "Service already registered");

        services[service] = Service({
            serviceAddress: service,
            isActive: true,
            lastUpdated: block.timestamp,
            serviceType: serviceType
        });

        servicesByType[serviceType].push(service);
        emit ServiceRegistered(service, serviceType);
    }

    function updateService(
        address service,
        bool isActive
    ) external override onlyOwner {
        require(service != address(0), "Invalid service address");
        require(services[service].serviceAddress != address(0), "Service not registered");

        services[service].isActive = isActive;
        services[service].lastUpdated = block.timestamp;

        emit ServiceUpdated(service, isActive);
    }

    function removeService(address service) external override onlyOwner {
        require(service != address(0), "Invalid service address");
        require(services[service].serviceAddress != address(0), "Service not registered");

        string memory serviceType = services[service].serviceType;
        address[] storage typeServices = servicesByType[serviceType];

        // Remove service from type array
        for (uint256 i = 0; i < typeServices.length; i++) {
            if (typeServices[i] == service) {
                typeServices[i] = typeServices[typeServices.length - 1];
                typeServices.pop();
                break;
            }
        }

        delete services[service];
        emit ServiceRemoved(service);
    }

    function getService(
        address service
    ) external view override returns (Service memory) {
        return services[service];
    }

    function getServicesByType(
        string memory serviceType
    ) external view override returns (address[] memory) {
        return servicesByType[serviceType];
    }

    function addServiceType(string memory serviceType) external onlyOwner {
        validServiceTypes[serviceType] = true;
    }

    function removeServiceType(string memory serviceType) external onlyOwner {
        validServiceTypes[serviceType] = false;
    }
} 