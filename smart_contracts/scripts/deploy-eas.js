const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying EAS contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

    // Deploy Schema Registry
    console.log("\n📋 Deploying Schema Registry...");
    const SchemaRegistry = await ethers.getContractFactory("SchemaRegistry");
    const schemaRegistry = await SchemaRegistry.deploy();
    await schemaRegistry.waitForDeployment();
    console.log("✅ Schema Registry deployed to:", await schemaRegistry.getAddress());

    // Deploy EAS
    console.log("\n🔍 Deploying EAS...");
    const EAS = await ethers.getContractFactory("EAS");
    const eas = await EAS.deploy(await schemaRegistry.getAddress());
    await eas.waitForDeployment();
    console.log("✅ EAS deployed to:", await eas.getAddress());

    // Save deployment info
    const deploymentInfo = {
        network: (await ethers.provider.getNetwork()).name,
        deployer: deployer.address,
        contracts: {
            schemaRegistry: await schemaRegistry.getAddress(),
            eas: await eas.getAddress()
        },
        timestamp: new Date().toISOString()
    };

    // Write deployment info to file
    const fs = require('fs');
    fs.writeFileSync('eas-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 EAS deployment info saved to eas-deployment.json");

    console.log("\n🎉 EAS Deployment Summary:");
    console.log("==================================================");
    console.log(`Schema Registry: ${await schemaRegistry.getAddress()}`);
    console.log(`EAS: ${await eas.getAddress()}`);
    console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log("==================================================");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }); 