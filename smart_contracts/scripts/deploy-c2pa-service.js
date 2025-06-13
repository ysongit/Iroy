const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying C2PA Service with account:", deployer.address);

    // Deploy C2PA Service
    const C2PAService = await ethers.getContractFactory("C2PAService");
    const c2paService = await C2PAService.deploy(
        3600, // 1 hour verification cooldown
        10    // Maximum 10 claims per content
    );

    await c2paService.waitForDeployment();
    console.log("C2PA Service deployed to:", await c2paService.getAddress());

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        c2paService: await c2paService.getAddress(),
        deployer: deployer.address,
        deployedAt: new Date().toISOString()
    };

    fs.writeFileSync("c2pa-service-deployment.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to c2pa-service-deployment.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 