const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying Service Registry with account:", deployer.address);

    // Deploy Service Registry
    const ServiceRegistry = await ethers.getContractFactory("ServiceRegistry");
    const serviceRegistry = await ServiceRegistry.deploy();

    await serviceRegistry.waitForDeployment();
    console.log("Service Registry deployed to:", await serviceRegistry.getAddress());

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        serviceRegistry: await serviceRegistry.getAddress(),
        deployer: deployer.address,
        deployedAt: new Date().toISOString()
    };

    fs.writeFileSync("service-registry-deployment.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to service-registry-deployment.json");

    // Register initial services if they exist
    try {
        const c2paDeployment = JSON.parse(fs.readFileSync("c2pa-service-deployment.json", "utf8"));
        const walletCheckerDeployment = JSON.parse(fs.readFileSync("wallet-checker-deployment.json", "utf8"));
        const aiServiceDeployment = JSON.parse(fs.readFileSync("ai-service-deployment.json", "utf8"));

        console.log("Registering C2PA Service...");
        await serviceRegistry.registerService(c2paDeployment.c2paService, "C2PA");

        console.log("Registering Wallet Checker Service...");
        await serviceRegistry.registerService(walletCheckerDeployment.walletChecker, "WALLET_CHECKER");

        console.log("Registering AI Service...");
        await serviceRegistry.registerService(aiServiceDeployment.aiService, "AI_SERVICE");

        console.log("All services registered successfully!");
    } catch (error) {
        console.log("Some services could not be registered:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 