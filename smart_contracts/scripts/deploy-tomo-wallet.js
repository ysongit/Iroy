const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying Tomo Wallet Service with account:", deployer.address);

    // Load configuration
    const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

    // Deploy Tomo Wallet Service
    const TomoWalletService = await ethers.getContractFactory("TomoWalletService");
    const tomoWalletService = await TomoWalletService.deploy(
        config.tomoWalletClientId,
        3600, // 1 hour verification cooldown
        ethers.parseEther("0.1") // 0.1 ETH minimum balance
    );

    await tomoWalletService.waitForDeployment();
    console.log("Tomo Wallet Service deployed to:", await tomoWalletService.getAddress());

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        tomoWalletService: await tomoWalletService.getAddress(),
        deployer: deployer.address,
        deployedAt: new Date().toISOString()
    };

    fs.writeFileSync("tomo-wallet-deployment.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to tomo-wallet-deployment.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 