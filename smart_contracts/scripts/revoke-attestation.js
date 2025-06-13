const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    // Load attestation info
    const attestationInfo = JSON.parse(fs.readFileSync("attestation-info.json", "utf8"));
    const easDeployment = JSON.parse(fs.readFileSync("eas-deployment.json", "utf8"));

    // Get contract instance
    const EAS = await ethers.getContractFactory("EAS");
    const eas = await EAS.attach(easDeployment.contracts.eas);

    console.log("Revoking attestation:", attestationInfo.attestationId);

    // Revoke the attestation
    const tx = await eas.revoke(attestationInfo.attestationId);
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();

    // Find the Revoked event
    const event = receipt.logs.find(log => log.fragment && log.fragment.name === "Revoked");
    if (event) {
        console.log("Attestation revoked successfully!");
        
        // Update attestation info
        attestationInfo.revoked = true;
        attestationInfo.revokedAt = new Date().toISOString();
        fs.writeFileSync("attestation-info.json", JSON.stringify(attestationInfo, null, 2));
        console.log("Updated attestation-info.json with revocation info");
    } else {
        console.log("Transaction successful but no Revoked event found");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    }); 