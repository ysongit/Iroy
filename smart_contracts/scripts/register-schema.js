const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Registering schema with account:", deployer.address);

    // Load deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync("deployment.json", "utf8"));
    const easDeploymentInfo = JSON.parse(fs.readFileSync("eas-deployment.json", "utf8"));

    // Get contract instances
    const SchemaRegistry = await ethers.getContractFactory("SchemaRegistry");
    const schemaRegistry = await SchemaRegistry.attach(easDeploymentInfo.contracts.schemaRegistry);

    const EAS = await ethers.getContractFactory("EAS");
    const eas = await EAS.attach(easDeploymentInfo.contracts.eas);

    // Define the IP attestation schema
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

    // Register the schema
    console.log("Registering IP attestation schema...");
    const tx = await schemaRegistry.register(
        schemaName,
        schemaDescription,
        schema,
        eas.target, // Use EAS contract as resolver
        true // Make attestations revocable
    );

    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment && log.fragment.name === "Registered");
    const schemaId = event.args[0];

    console.log("Schema registered with ID:", schemaId);

    // Update deployment info with schema ID
    const IroyAttestationManager = await ethers.getContractFactory("IroyAttestationManager");
    const attestationManager = await IroyAttestationManager.attach(deploymentInfo.attestationManager);
    
    console.log("Setting schema ID in AttestationManager...");
    const setSchemaTx = await attestationManager.setIPAttestationSchema(schemaId);
    await setSchemaTx.wait();
    console.log("Updated AttestationManager with schema ID");

    // Save schema ID to deployment info
    easDeploymentInfo.schemaId = schemaId;
    fs.writeFileSync("eas-deployment.json", JSON.stringify(easDeploymentInfo, null, 2));
    console.log("Updated eas-deployment.json with schema ID");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    }); 