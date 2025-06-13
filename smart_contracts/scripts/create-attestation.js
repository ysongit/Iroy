const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Creating attestation with account:", deployer.address);

    // Load deployment info
    const easDeployment = JSON.parse(fs.readFileSync("eas-deployment.json", "utf8"));
    const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf8"));

    // Get contract instances
    const EAS = await ethers.getContractFactory("EAS");
    const eas = await EAS.attach(easDeployment.contracts.eas);

    // Get schema ID
    const schemaId = easDeployment.schemaId;
    if (!schemaId) {
        throw new Error("Schema ID not found in eas-deployment.json");
    }
    console.log("Using schema ID:", schemaId);

    // Example attestation data
    const attestationData = {
        ipAssetId: "123",
        attestationType: "CREATOR",
        metadata: "https://example.com/metadata/123"
    };

    // Convert attestation data to bytes
    const attestationDataBytes = ethers.toUtf8Bytes(JSON.stringify(attestationData));

    console.log("Creating attestation...");
    const tx = await eas.attest(
        schemaId,
        deployer.address, // recipient
        0, // expirationTime (0 = never expires)
        true, // revocable
        attestationDataBytes
    );

    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();

    // Find the Attested event
    const event = receipt.logs.find(log => log.fragment && log.fragment.name === "Attested");
    if (event) {
        const attestationId = event.args[0];
        console.log("Attestation created successfully!");
        console.log("Attestation ID:", attestationId);
        
        // Save attestation info
        const attestationInfo = {
            attestationId,
            schemaId,
            attester: deployer.address,
            recipient: deployer.address,
            data: attestationData,
            timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync("attestation-info.json", JSON.stringify(attestationInfo, null, 2));
        console.log("Attestation info saved to attestation-info.json");
    } else {
        console.log("Transaction successful but no Attested event found");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });