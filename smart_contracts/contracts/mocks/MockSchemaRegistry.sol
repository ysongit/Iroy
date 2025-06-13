// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/ISchemaRegistry.sol";

contract MockSchemaRegistry is ISchemaRegistry {
    mapping(bytes32 => bool) private registeredSchemas;
    mapping(bytes32 => address) private schemaResolvers;

    function registerSchema(bytes32 schemaId) external {
        registeredSchemas[schemaId] = true;
        schemaResolvers[schemaId] = msg.sender;
    }

    function isRegistered(bytes32 schemaId) external view override returns (bool) {
        return registeredSchemas[schemaId];
    }

    function getSchema(bytes32 schemaId) external view override returns (address) {
        return schemaResolvers[schemaId];
    }
} 