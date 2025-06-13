const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying AI Service with account:", deployer.address);

    // Load configuration
    const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

    // Deploy AI Service
    const AIService = await ethers.getContractFactory("AIService");
    const aiService = await AIService.deploy(
        config.elizaEndpoint,
        config.yakoaEndpoint,
        config.gaiaEndpoint,
        config.plagiarismThreshold || 80, // Default 80%
        config.styleMatchThreshold || 70  // Default 70%
    );

    await aiService.waitForDeployment();
    console.log("AI Service deployed to:", await aiService.getAddress());

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        aiService: await aiService.getAddress(),
        deployer: deployer.address,
        deployedAt: new Date().toISOString()
    };

    fs.writeFileSync("ai-service-deployment.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to ai-service-deployment.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 