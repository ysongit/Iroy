const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Verifying services with account:", deployer.address);

    // Load deployment info
    const registryDeployment = JSON.parse(fs.readFileSync("service-registry-deployment.json", "utf8"));
    const serviceRegistry = await ethers.getContractAt("ServiceRegistry", registryDeployment.serviceRegistry);

    // Get all services
    const c2paServices = await serviceRegistry.getServicesByType("C2PA");
    const walletCheckerServices = await serviceRegistry.getServicesByType("WALLET_CHECKER");
    const aiServices = await serviceRegistry.getServicesByType("AI_SERVICE");

    console.log("\nVerifying C2PA Services...");
    for (const service of c2paServices) {
        const serviceInfo = await serviceRegistry.getService(service);
        console.log(`C2PA Service: ${service}`);
        console.log(`Active: ${serviceInfo.isActive}`);
        console.log(`Last Updated: ${new Date(serviceInfo.lastUpdated * 1000).toISOString()}`);
    }

    console.log("\nVerifying Wallet Checker Services...");
    for (const service of walletCheckerServices) {
        const serviceInfo = await serviceRegistry.getService(service);
        console.log(`Wallet Checker Service: ${service}`);
        console.log(`Active: ${serviceInfo.isActive}`);
        console.log(`Last Updated: ${new Date(serviceInfo.lastUpdated * 1000).toISOString()}`);
    }

    console.log("\nVerifying AI Services...");
    for (const service of aiServices) {
        const serviceInfo = await serviceRegistry.getService(service);
        console.log(`AI Service: ${service}`);
        console.log(`Active: ${serviceInfo.isActive}`);
        console.log(`Last Updated: ${new Date(serviceInfo.lastUpdated * 1000).toISOString()}`);
    }

    // Test content verification
    console.log("\nTesting content verification...");
    const testContent = "Test content for verification";
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes(testContent));

    // Test C2PA verification
    if (c2paServices.length > 0) {
        const c2paService = await ethers.getContractAt("C2PAService", c2paServices[0]);
        try {
            const tx = await c2paService.assertContent(
                contentHash,
                "Test Generator",
                "Test Signature",
                "Test Metadata"
            );
            await tx.wait();
            console.log("C2PA content assertion successful");
        } catch (error) {
            console.error("C2PA content assertion failed:", error.message);
        }
    }

    // Test wallet verification
    if (walletCheckerServices.length > 0) {
        const walletChecker = await ethers.getContractAt("WalletContentChecker", walletCheckerServices[0]);
        try {
            const tx = await walletChecker.checkContent(contentHash, "Test Metadata");
            await tx.wait();
            console.log("Wallet content check successful");
        } catch (error) {
            console.error("Wallet content check failed:", error.message);
        }
    }

    console.log("\nService verification complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 