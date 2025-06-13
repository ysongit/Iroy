// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISchemaRegistry {
    /**
     * @notice Checks if a schema is registered
     * @param schemaId The schema ID to check
     * @return Whether the schema is registered
     */
    function isRegistered(bytes32 schemaId) external view returns (bool);

    /**
     * @notice Gets the schema resolver for a schema
     * @param schemaId The schema ID to get the resolver for
     * @return The address of the schema resolver
     */
    function getSchema(bytes32 schemaId) external view returns (address);
} 