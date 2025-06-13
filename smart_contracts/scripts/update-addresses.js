const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Updating contract addresses with account:", deployer.address);

    // Load deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync('deployment.json', 'utf8'));
    const easDeploymentInfo = JSON.parse(fs.readFileSync('eas-deployment.json', 'utf8'));

    // Get contract instances
    const IroyAttestationManager = await ethers.getContractFactory("IroyAttestationManager");
    const attestationManager = await IroyAttestationManager.attach(deploymentInfo.contracts.attestationManager);

    console.log("\n⚙️ Updating contract addresses...");

    // Update EAS and Schema Registry addresses
    const tx = await attestationManager.updateEASAddresses(
        easDeploymentInfo.contracts.eas,
        easDeploymentInfo.contracts.schemaRegistry
    );
    await tx.wait();

    console.log("✅ Contract addresses updated successfully");
    console.log("\nUpdated Addresses:");
    console.log("==================================================");
    console.log(`EAS Contract: ${easDeploymentInfo.contracts.eas}`);
    console.log(`Schema Registry: ${easDeploymentInfo.contracts.schemaRegistry}`);
    console.log("==================================================");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Update failed:", error);
        process.exit(1);
    }); 