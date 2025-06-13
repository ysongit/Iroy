const { run } = require("hardhat");

async function main() {
  console.log("🔍 Verifying contracts...");

  // Load deployment info
  const fs = require('fs');
  let deploymentInfo;
  
  try {
    deploymentInfo = JSON.parse(fs.readFileSync('deployment.json', 'utf8'));
  } catch (error) {
    console.error("❌ deployment.json not found. Please deploy contracts first.");
    process.exit(1);
  }

  try {
    // Note: Contract verification might not be available on Story Testnet yet
    // This is a template for when it becomes available
    
    console.log("📋 Verifying IroyIPRegistry...");
    await run("verify:verify", {
      address: deploymentInfo.ipRegistry,
      constructorArguments: [],
    });

    console.log("🔍 Verifying IroyAuditEngine...");
    await run("verify:verify", {
      address: deploymentInfo.auditEngine,
      constructorArguments: [],
    });

    console.log("✅ All contracts verified successfully!");

  } catch (error) {
    console.log("⚠️ Verification failed (this is expected on testnets):", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });