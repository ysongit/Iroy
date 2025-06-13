const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Iroy IP Audit System deployment...");

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  try {
    // Deploy IP Registry
    console.log("\n📋 Deploying IroyIPRegistry...");
    const IroyIPRegistry = await ethers.getContractFactory("IroyIPRegistry");
    
    const ipRegistry = await IroyIPRegistry.deploy(ethers.ZeroAddress);
    await ipRegistry.waitForDeployment();
    console.log("✅ IroyIPRegistry deployed to:", await ipRegistry.getAddress());

    // Deploy Audit Engine
    console.log("\n🔍 Deploying IroyAuditEngine...");
    const IroyAuditEngine = await ethers.getContractFactory("IroyAuditEngine");
    
    const similarityThreshold = 5000; // 50% threshold
    const auditEngine = await IroyAuditEngine.deploy(await ipRegistry.getAddress(), similarityThreshold);
    await auditEngine.waitForDeployment();
    console.log("✅ IroyAuditEngine deployed to:", await auditEngine.getAddress());

    // Deploy Attestation Manager
    console.log("\n🔍 Deploying IroyAttestationManager...");
    const IroyAttestationManager = await ethers.getContractFactory("IroyAttestationManager");
    
    const attestationManager = await IroyAttestationManager.deploy(
        await ipRegistry.getAddress(),
        await auditEngine.getAddress(),
        ethers.ZeroAddress, // EAS contract address - replace with actual address
        ethers.ZeroAddress  // Schema Registry address - replace with actual address
    );
    await attestationManager.waitForDeployment();
    console.log("✅ IroyAttestationManager deployed to:", await attestationManager.getAddress());

    // Set up initial configuration
    console.log("\n⚙️ Setting up initial permissions...");
    
    // Authorize deployer as auditor and provider
    await ipRegistry.setAuditorAuthorization(deployer.address, true);
    console.log("✅ Deployer authorized as auditor");

    // Set the attestation manager in Audit Engine
    // await auditEngine.setAttestationManager(await attestationManager.getAddress());
    // console.log("✅ Attestation manager set in Audit Engine");

    // Save deployment info
    const deploymentInfo = {
        network: (await ethers.provider.getNetwork()).name,
        deployer: deployer.address,
        contracts: {
            ipRegistry: await ipRegistry.getAddress(),
            auditEngine: await auditEngine.getAddress(),
            attestationManager: await attestationManager.getAddress()
        },
        timestamp: new Date().toISOString()
    };

    // Write deployment info to file
    const fs = require('fs');
    fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to deployment.json");

    console.log("\n🎉 Deployment Summary:");
    console.log("==================================================");
    console.log(`IroyIPRegistry: ${await ipRegistry.getAddress()}`);
    console.log(`IroyAuditEngine: ${await auditEngine.getAddress()}`);
    console.log(`IroyAttestationManager: ${await attestationManager.getAddress()}`);
    console.log(`Network: ${network.name}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log("==================================================");

    console.log("\n⚠️ Note: To complete the setup, you need to:");
    console.log("1. Deploy or connect to an EAS contract");
    console.log("2. Deploy or connect to a Schema Registry");
    console.log("3. Register your IP attestation schema");
    console.log("4. Update the contract addresses in the Attestation Manager");

    // Deploy C2PAService
    console.log("\n🚀 Deploying C2PAService...");
    const C2PAService = await ethers.getContractFactory("contracts/services/C2PAService.sol:C2PAService");
    const c2paService = await C2PAService.deploy();
    await c2paService.waitForDeployment();

    console.log("C2PAService deployed to:", await c2paService.getAddress());

    // Set up supported formats
    console.log("Setting up supported formats...");
    const formats = [
        "text",
        "image",
        "pdf",
        "document",
        "audio",
        "video",
        "code"
    ];

    for (const format of formats) {
        const tx = await c2paService.setContentFormatSupport(format, true);
        await tx.wait();
        console.log(`Format ${format} support enabled`);
    }

    // Set up supported claim types
    console.log("Setting up supported claim types...");
    const claimTypes = [
        "c2pa.claim",
        "c2pa.assertion"
    ];

    for (const claimType of claimTypes) {
        const tx = await c2paService.setClaimTypeSupport(claimType, true);
        await tx.wait();
        console.log(`Claim type ${claimType} support enabled`);
    }

    // Set verification cooldown
    console.log("Setting verification cooldown...");
    const cooldownTx = await c2paService.setVerificationCooldown(3600); // 1 hour
    await cooldownTx.wait();
    console.log("Verification cooldown set to 1 hour");

    // Set max claims per content
    console.log("Setting max claims per content...");
    const maxClaimsTx = await c2paService.setMaxClaimsPerContent(5);
    await maxClaimsTx.wait();
    console.log("Max claims per content set to 5");

    // Deploy to Story Testnet if specified
    if (process.env.STORY_TESTNET_RPC_URL) {
        console.log("\nDeploying to Story Testnet...");
        
        // Get Story Testnet provider
        const storyProvider = new ethers.JsonRpcProvider(process.env.STORY_TESTNET_RPC_URL);
        const storyWallet = new ethers.Wallet(process.env.PRIVATE_KEY, storyProvider);
        
        // Deploy to Story Testnet
        const storyC2PAService = await C2PAService.connect(storyWallet).deploy();
        await storyC2PAService.waitForDeployment();
        
        console.log("C2PAService deployed to Story Testnet:", await storyC2PAService.getAddress());
        
        // Set up formats on Story Testnet
        for (const format of formats) {
            const tx = await storyC2PAService.setContentFormatSupport(format, true);
            await tx.wait();
            console.log(`Story Testnet: Format ${format} support enabled`);
        }
        
        // Set up claim types on Story Testnet
        for (const claimType of claimTypes) {
            const tx = await storyC2PAService.setClaimTypeSupport(claimType, true);
            await tx.wait();
            console.log(`Story Testnet: Claim type ${claimType} support enabled`);
        }
        
        // Set verification cooldown on Story Testnet
        const storyCooldownTx = await storyC2PAService.setVerificationCooldown(3600);
        await storyCooldownTx.wait();
        console.log("Story Testnet: Verification cooldown set to 1 hour");
        
        // Set max claims on Story Testnet
        const storyMaxClaimsTx = await storyC2PAService.setMaxClaimsPerContent(5);
        await storyMaxClaimsTx.wait();
        console.log("Story Testnet: Max claims per content set to 5");
    }

    console.log("Deployment completed successfully!");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });