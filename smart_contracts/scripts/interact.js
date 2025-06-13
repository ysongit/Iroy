const { ethers } = require("hardhat");

async function main() {
  console.log("🔗 Interacting with Iroy contracts...");

  // Load deployment info
  const fs = require('fs');
  let deploymentInfo;
  
  try {
    deploymentInfo = JSON.parse(fs.readFileSync('deployment.json', 'utf8'));
  } catch (error) {
    console.error("❌ deployment.json not found. Please deploy contracts first.");
    process.exit(1);
  }

  const [deployer, user1] = await ethers.getSigners();

  // Get contract instances
  const ipRegistry = await ethers.getContractAt("IroyIPRegistry", deploymentInfo.ipRegistry);
  const auditEngine = await ethers.getContractAt("IroyAuditEngine", deploymentInfo.auditEngine);

  try {
    // Example 1: Register IP Asset
    console.log("\n📝 Registering IP Asset...");
    const contentHash = "QmExampleHash123456789";
    const metadataURI = "https://ipfs.io/ipfs/QmMetadataExample";
    const mediaType = 0; // IMAGE

    const registerTx = await ipRegistry.connect(user1).registerIPAsset(
      contentHash,
      metadataURI,
      mediaType
    );
    
    const receipt = await registerTx.wait();
    const ipAssetId = receipt.events.find(e => e.event === 'IPAssetRegistered').args.ipAssetId;
    
    console.log("✅ IP Asset registered with ID:", ipAssetId.toString());

    // Example 2: Get IP Asset Info
    console.log("\n📊 Getting IP Asset Info...");
    const ipAsset = await ipRegistry.getIPAsset(ipAssetId);
    console.log("IP Asset Details:");
    console.log("- Owner:", ipAsset.owner);
    console.log("- Content Hash:", ipAsset.contentHash);
    console.log("- Media Type:", ipAsset.mediaType);
    console.log("- Created At:", new Date(ipAsset.createdAt * 1000).toISOString());

    // Example 3: Create Audit Report
    console.log("\n🔍 Creating Audit Report...");
    const similarityScore = 2500; // 25%
    const similarIPs = []; // No similar IPs found
    const similarityScores = [];
    const auditMetadataURI = "https://ipfs.io/ipfs/QmAuditReport123";

    const auditTx = await auditEngine.createAuditReport(
      ipAssetId,
      similarityScore,
      similarIPs,
      similarityScores,
      auditMetadataURI
    );

    const auditReceipt = await auditTx.wait();
    const auditId = auditReceipt.events.find(e => e.event === 'AuditReportCreated').args.auditId;
    
    console.log("✅ Audit Report created with ID:", auditId.toString());

    // Example 4: Check Similarity
    console.log("\n🎯 Checking Similarity...");
    const hasHighSimilarity = await auditEngine.hasHighSimilarity(ipAssetId);
    console.log("Has High Similarity:", hasHighSimilarity);

    // Example 5: Get Contract Stats
    console.log("\n📈 Contract Statistics...");
    const totalIPs = await ipRegistry.getTotalIPAssets();
    const totalAudits = await auditEngine.getTotalAuditReports();
    const similarityThreshold = await auditEngine.similarityThreshold();
    
    console.log("- Total IP Assets:", totalIPs.toString());
    console.log("- Total Audit Reports:", totalAudits.toString());
    console.log("- Similarity Threshold:", (similarityThreshold / 100).toString() + "%");

    console.log("\n🎉 Interaction completed successfully!");

  } catch (error) {
    console.error("❌ Interaction failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });