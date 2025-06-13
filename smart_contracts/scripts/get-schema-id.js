const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Getting schema ID with account:", deployer.address);

    // Load deployment info
    const easDeployment = JSON.parse(fs.readFileSync("eas-deployment.json", "utf8"));

    // Get contract instances
    const SchemaRegistry = await ethers.getContractFactory("SchemaRegistry");
    const schemaRegistry = await SchemaRegistry.attach(easDeployment.contracts.schemaRegistry);

    // Define the schema parameters (must match the ones used for registration)
    const schemaName = "IP Attestation";
    const schemaDescription = "Schema for attesting IP assets";
    const schema = JSON.stringify({
        type: "object",
        properties: {
            ipAssetId: { type: "string" },
            attestationType: { type: "string" },
            metadata: { type: "string" }
        },
        required: ["ipAssetId", "attestationType"]
    });

    // Calculate schema ID
    const schemaId = ethers.keccak256(
        ethers.solidityPacked(
            ["string", "string", "string", "address", "bool"],
            [schemaName, schemaDescription, schema, easDeployment.contracts.eas, true]
        )
    );

    console.log("Schema ID:", schemaId);

    // Verify the schema exists
    const schemaExists = await schemaRegistry.isRegistered(schemaId);
    console.log("Schema exists:", schemaExists);

    if (schemaExists) {
        // Update eas-deployment.json with the schema ID
        easDeployment.schemaId = schemaId;
        fs.writeFileSync("eas-deployment.json", JSON.stringify(easDeployment, null, 2));
        console.log("Updated eas-deployment.json with schema ID");
    } else {
        console.log("Warning: Schema not found in registry!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    }); 