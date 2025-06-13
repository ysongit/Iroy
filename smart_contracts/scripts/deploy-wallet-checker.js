const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying Wallet Content Checker with account:", deployer.address);

    // Deploy Wallet Content Checker
    const WalletContentChecker = await ethers.getContractFactory("WalletContentChecker");
    const walletChecker = await WalletContentChecker.deploy(
        3600,    // 1 hour check cooldown
        3,       // Maximum 3 violations before blacklist
        86400    // 24 hour blacklist duration
    );

    await walletChecker.waitForDeployment();
    console.log("Wallet Content Checker deployed to:", await walletChecker.getAddress());

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        walletChecker: await walletChecker.getAddress(),
        deployer: deployer.address,
        deployedAt: new Date().toISOString()
    };

    fs.writeFileSync("wallet-checker-deployment.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to wallet-checker-deployment.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 