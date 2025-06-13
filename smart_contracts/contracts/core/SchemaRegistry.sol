// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SchemaRegistry is Ownable {
    struct Schema {
        string name;
        string description;
        string schema;
        address resolver;
        bool revocable;
    }

    mapping(bytes32 => Schema) public schemas;
    mapping(bytes32 => bool) public isRegistered;

    event Registered(bytes32 indexed schemaId, string name, string description, string schema, address resolver, bool revocable);

    constructor() Ownable() {}

    function register(
        string memory name,
        string memory description,
        string memory schema,
        address resolver,
        bool revocable
    ) external returns (bytes32) {
        bytes32 schemaId = keccak256(abi.encodePacked(name, description, schema, resolver, revocable));
        require(!isRegistered[schemaId], "Schema already registered");

        schemas[schemaId] = Schema({
            name: name,
            description: description,
            schema: schema,
            resolver: resolver,
            revocable: revocable
        });
        isRegistered[schemaId] = true;

        emit Registered(schemaId, name, description, schema, resolver, revocable);
        return schemaId;
    }

    function getSchema(bytes32 schemaId) external view returns (Schema memory) {
        require(isRegistered[schemaId], "Schema not registered");
        return schemas[schemaId];
    }
} 