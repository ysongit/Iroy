// scripts/setSchema.js
const { ethers } = require("hardhat");

async function main() {
    console.log("🔐 Setting up EAS Schema...");
    
    const [deployer] = await ethers.getSigners();
    
    // Load deployment info
    const fs = require('fs');
    const deploymentInfo = JSON.parse(fs.readFileSync('deployment.json', 'utf8'));
    
    try {
        // Get the AttestationManager contract
        const attestationManager = await ethers.getContractAt(
            "IroyAttestationManager", 
            deploymentInfo.attestationManager || "0x0000000000000000000000000000000000000000"
        );
        
        // For now, let's use a mock schema ID (32 bytes)
        // In production, you'd register this with EAS first
        const mockSchemaId = ethers.keccak256(
            ethers.toUtf8Bytes("string ipType,uint256 confidence,bool isOriginal,string evidence")
        );
        
        console.log("Setting schema ID:", mockSchemaId);
        
        // Set the schema (only if AttestationManager is deployed)
        if (deploymentInfo.attestationManager) {
            const tx = await attestationManager.setIPAttestationSchema(mockSchemaId);
            await tx.wait();
            console.log("✅ Schema set successfully!");
        } else {
            console.log("⚠️ AttestationManager not deployed, skipping schema setup");
        }
        
        // Update deployment.json with schema info
        deploymentInfo.schemaId = mockSchemaId;
        fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
        
        console.log("💾 Schema info saved to deployment.json");
        
    } catch (error) {
        console.error("❌ Schema setup failed:", error.message);
        
        // Create a fallback schema ID
        const fallbackSchemaId = ethers.keccak256(ethers.toUtf8Bytes("fallback-schema"));
        deploymentInfo.schemaId = fallbackSchemaId;
        fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
        
        console.log("✅ Fallback schema ID set:", fallbackSchemaId);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });