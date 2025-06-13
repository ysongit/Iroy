const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    // Load attestation info
    const attestationInfo = JSON.parse(fs.readFileSync("attestation-info.json", "utf8"));
    const easDeployment = JSON.parse(fs.readFileSync("eas-deployment.json", "utf8"));

    // Get contract instance
    const EAS = await ethers.getContractFactory("EAS");
    const eas = await EAS.attach(easDeployment.contracts.eas);

    console.log("Checking attestation:", attestationInfo.attestationId);

    // Check if attestation is valid
    const isValid = await eas.isAttestationValid(attestationInfo.attestationId);
    console.log("Is attestation valid?", isValid);

    if (isValid) {
        // Get attestation details
        const attestation = await eas.getAttestation(attestationInfo.attestationId);
        console.log("\nAttestation Details:");
        console.log("====================");
        console.log("Schema ID:", attestation.schemaId);
        console.log("Attester:", attestation.attester);
        console.log("Recipient:", attestation.recipient);
        console.log("Expiration Time:", attestation.expirationTime.toString());
        console.log("Revocable:", attestation.revocable);
        console.log("Data:", ethers.toUtf8String(attestation.data));
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
