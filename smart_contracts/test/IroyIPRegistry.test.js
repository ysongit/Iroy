const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IroyIPRegistry", function () {
  let ipRegistry;
  let auditEngine;
  let owner;
  let user1;
  let user2;
  let auditor;

  beforeEach(async function () {
    [owner, user1, user2, auditor] = await ethers.getSigners();

    // Deploy IP Registry
    const IroyIPRegistry = await ethers.getContractFactory("IroyIPRegistry");
    ipRegistry = await IroyIPRegistry.deploy("0x0000000000000000000000000000000000000000"); // Mock Story Protocol address
    console.log('ipRegistry:', ipRegistry);
    console.log('ipRegistry.target:', ipRegistry.target);

    // Deploy Audit Engine
    const IroyAuditEngine = await ethers.getContractFactory("IroyAuditEngine");
    auditEngine = await IroyAuditEngine.deploy(ipRegistry.target, 5000); // 50% similarity threshold

    // Authorize auditor
    await ipRegistry.setAuditorAuthorization(auditor.address, true);
    await auditEngine.setProviderAuthorization(auditor.address, true);
  });

  describe("IP Asset Registration", function () {
    it("Should register IP asset successfully", async function () {
      const contentHash = "QmTest123";
      const metadataURI = "https://ipfs.io/ipfs/QmMetadata123";
      const mediaType = 0; // IMAGE

      const tx = await ipRegistry.connect(user1).registerIPAsset(
        contentHash,
        metadataURI,
        mediaType
      );

      await expect(tx)
        .to.emit(ipRegistry, "IPAssetRegistered")
        .withArgs(1, user1.address, contentHash, mediaType);

      const ipAsset = await ipRegistry.getIPAsset(1);
      expect(ipAsset.owner).to.equal(user1.address);
      expect(ipAsset.contentHash).to.equal(contentHash);
      expect(ipAsset.metadataURI).to.equal(metadataURI);
      expect(ipAsset.mediaType).to.equal(mediaType);
    });

    it("Should prevent duplicate content hash registration", async function () {
      const contentHash = "QmTest123";
      
      await ipRegistry.connect(user1).registerIPAsset(
        contentHash,
        "https://metadata1.com",
        0
      );

      await expect(
        ipRegistry.connect(user2).registerIPAsset(
          contentHash,
          "https://metadata2.com",
          0
        )
      ).to.be.revertedWithCustomError(ipRegistry, "IPAlreadyExists");
    });

    it("Should prevent empty content hash", async function () {
      await expect(
        ipRegistry.connect(user1).registerIPAsset("", "https://metadata.com", 0)
      ).to.be.revertedWithCustomError(ipRegistry, "InvalidIPAsset");
    });
  });

  describe("Audit Reports", function () {  
    let ipAssetId;

    beforeEach(async function () {
      // Register an IP asset first
      await ipRegistry.connect(user1).registerIPAsset(
        "QmTest123",
        "https://metadata.com",
        0
      );
      ipAssetId = 1;
    });

    it("Should create audit report successfully", async function () {
      const similarityScore = 7500; // 75%
      const similarIPs = [user2.address];
      const similarityScores = [7500];
      const auditMetadataURI = "https://audit-metadata.com";

      const tx = await auditEngine.connect(auditor).createAuditReport(
        ipAssetId,
        similarityScore,
        similarIPs,
        similarityScores,
        auditMetadataURI
      );

      await expect(tx)
        .to.emit(auditEngine, "AuditReportCreated")
        .withArgs(1, ipAssetId, auditor.address, similarityScore);

      const auditReport = await auditEngine.getAuditReport(1);
      expect(auditReport.ipAssetId).to.equal(ipAssetId);
      expect(auditReport.similarityScore).to.equal(similarityScore);
      expect(auditReport.auditor).to.equal(auditor.address);
    });

    it("Should detect high similarity correctly", async function () {
      // Create audit with high similarity (above 50% threshold)
      await auditEngine.connect(auditor).createAuditReport(
        ipAssetId,
        7500, // 75%
        [user2.address],
        [7500],
        "https://audit-metadata.com"
      );

      const hasHighSimilarity = await auditEngine.hasHighSimilarity(ipAssetId);
      expect(hasHighSimilarity).to.be.true;
    });

    it("Should prevent unauthorized audit creation", async function () {
      await expect(
        auditEngine.connect(user1).createAuditReport(
          ipAssetId,
          5000,
          [],
          [],
          "https://audit-metadata.com"
        )
      ).to.be.revertedWithCustomError(auditEngine, "UnauthorizedAccess");
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to authorize auditors", async function () {
      await ipRegistry.setAuditorAuthorization(user1.address, true);
      expect(await ipRegistry.authorizedAuditors(user1.address)).to.be.true;
    });

    it("Should prevent non-owners from authorizing auditors", async function () {
      await expect(
        ipRegistry.connect(user1).setAuditorAuthorization(user2.address, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Integration", function () {
    it("Should integrate with Story Protocol", async function () {
      // Register IP asset
      await ipRegistry.connect(user1).registerIPAsset(
        "QmTest123",
        "https://metadata.com",
        0
      );

      // Integrate with Story Protocol
      const storyProtocolId = 12345;
      await ipRegistry.connect(auditor).integrateWithStoryProtocol(1, storyProtocolId);

      const ipAsset = await ipRegistry.getIPAsset(1);
      expect(ipAsset.storyProtocolId).to.equal(storyProtocolId);
    });

    it("Should get IP assets by owner", async function () {
      // Register multiple IP assets
      await ipRegistry.connect(user1).registerIPAsset("QmTest1", "https://meta1.com", 0);
      await ipRegistry.connect(user1).registerIPAsset("QmTest2", "https://meta2.com", 1);
      await ipRegistry.connect(user2).registerIPAsset("QmTest3", "https://meta3.com", 0);

      const user1IPs = await ipRegistry.getIPAssetsByOwner(user1.address);
      const user2IPs = await ipRegistry.getIPAssetsByOwner(user2.address);

      expect(user1IPs.length).to.equal(2);
      expect(user2IPs.length).to.equal(1);
      expect(user1IPs[0]).to.equal(1);
      expect(user1IPs[1]).to.equal(2);
      expect(user2IPs[0]).to.equal(3);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle invalid similarity scores", async function () {
      await ipRegistry.connect(user1).registerIPAsset("QmTest123", "https://metadata.com", 0);

      await expect(
        auditEngine.connect(auditor).createAuditReport(
          1,
          15000, // > 100%
          [],
          [],
          "https://audit-metadata.com"
        )
      ).to.be.revertedWithCustomError(auditEngine, "InvalidSimilarityScore");
    });

    it("Should handle mismatched array lengths", async function () {
      await ipRegistry.connect(user1).registerIPAsset("QmTest123", "https://metadata.com", 0);

      await expect(
        auditEngine.connect(auditor).createAuditReport(
          1,
          5000,
          [user1.address, user2.address], // 2 addresses
          [5000], // 1 score
          "https://audit-metadata.com"
        )
      ).to.be.revertedWithCustomError(auditEngine, "InvalidSimilarityScore");
    });
  });
});