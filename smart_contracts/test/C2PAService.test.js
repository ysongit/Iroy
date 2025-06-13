const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("C2PAService", function () {
    let c2paService;
    let owner;
    let user;

    const VERIFICATION_COOLDOWN = 3600; // 1 hour
    const MAX_CLAIMS_PER_CONTENT = 5;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        const C2PAService = await ethers.getContractFactory("C2PAService");
        c2paService = await C2PAService.deploy(
            VERIFICATION_COOLDOWN,
            MAX_CLAIMS_PER_CONTENT
        );
        await c2paService.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await c2paService.owner()).to.equal(owner.address);
        });

        it("Should set the correct verification cooldown", async function () {
            expect(await c2paService.verificationCooldown()).to.equal(VERIFICATION_COOLDOWN);
        });

        it("Should set the correct max claims per content", async function () {
            expect(await c2paService.maxClaimsPerContent()).to.equal(MAX_CLAIMS_PER_CONTENT);
        });

        it("Should initialize supported claim types", async function () {
            expect(await c2paService.supportedClaimTypes("c2pa.claim")).to.be.true;
            expect(await c2paService.supportedClaimTypes("c2pa.assertion")).to.be.true;
        });

        it("Should initialize supported content formats", async function () {
            expect(await c2paService.supportedContentFormats("text")).to.be.true;
            expect(await c2paService.supportedContentFormats("image")).to.be.true;
            expect(await c2paService.supportedContentFormats("pdf")).to.be.true;
            expect(await c2paService.supportedContentFormats("document")).to.be.true;
        });
    });

    describe("Content Assertion", function () {
        const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test content"));
        const claimGenerator = "test-generator";
        const claimSignature = "test-signature";
        const metadata = JSON.stringify({
            claimType: "c2pa.claim",
            contentFormat: "text",
            generator: claimGenerator,
            signature: claimSignature,
            timestamp: Math.floor(Date.now() / 1000),
            assertions: ["test-assertion"],
            editHistory: ["test-edit"],
            aiGenerationInfo: ["test-ai-info"]
        });

        it("Should assert content successfully", async function () {
            const tx = await c2paService.assertContent(
                contentHash,
                claimGenerator,
                claimSignature,
                metadata
            );

            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "ContentAsserted");
            expect(event.args.contentHash).to.equal(contentHash);
            expect(event.args.success).to.be.true;
        });

        it("Should fail with invalid content hash", async function () {
            await expect(
                c2paService.assertContent(
                    ethers.constants.HashZero,
                    claimGenerator,
                    claimSignature,
                    metadata
                )
            ).to.be.revertedWith("Invalid content hash");
        });

        it("Should fail with invalid claim generator", async function () {
            await expect(
                c2paService.assertContent(
                    contentHash,
                    "",
                    claimSignature,
                    metadata
                )
            ).to.be.revertedWith("Invalid claim generator");
        });

        it("Should fail with invalid claim signature", async function () {
            await expect(
                c2paService.assertContent(
                    contentHash,
                    claimGenerator,
                    "",
                    metadata
                )
            ).to.be.revertedWith("Invalid claim signature");
        });

        it("Should fail with unsupported claim type", async function () {
            const invalidMetadata = JSON.stringify({
                claimType: "invalid.claim",
                contentFormat: "text",
                generator: claimGenerator,
                signature: claimSignature,
                timestamp: Math.floor(Date.now() / 1000),
                assertions: [],
                editHistory: [],
                aiGenerationInfo: []
            });

            await expect(
                c2paService.assertContent(
                    contentHash,
                    claimGenerator,
                    claimSignature,
                    invalidMetadata
                )
            ).to.be.revertedWith("Unsupported claim type");
        });

        it("Should fail with unsupported content format", async function () {
            const invalidMetadata = JSON.stringify({
                claimType: "c2pa.claim",
                contentFormat: "invalid",
                generator: claimGenerator,
                signature: claimSignature,
                timestamp: Math.floor(Date.now() / 1000),
                assertions: [],
                editHistory: [],
                aiGenerationInfo: []
            });

            await expect(
                c2paService.assertContent(
                    contentHash,
                    claimGenerator,
                    claimSignature,
                    invalidMetadata
                )
            ).to.be.revertedWith("Unsupported content format");
        });

        it("Should fail when max claims reached", async function () {
            // First assertion
            await c2paService.assertContent(
                contentHash,
                claimGenerator,
                claimSignature,
                metadata
            );

            // Try to assert more than MAX_CLAIMS_PER_CONTENT times
            for (let i = 0; i < MAX_CLAIMS_PER_CONTENT; i++) {
                await c2paService.assertContent(
                    contentHash,
                    claimGenerator,
                    claimSignature,
                    metadata
                );
            }

            await expect(
                c2paService.assertContent(
                    contentHash,
                    claimGenerator,
                    claimSignature,
                    metadata
                )
            ).to.be.revertedWith("Max claims reached for content");
        });
    });

    describe("Claim Verification", function () {
        const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test content"));
        const claimGenerator = "test-generator";
        const claimSignature = "test-signature";
        const metadata = JSON.stringify({
            claimType: "c2pa.claim",
            contentFormat: "text",
            generator: claimGenerator,
            signature: claimSignature,
            timestamp: Math.floor(Date.now() / 1000),
            assertions: ["test-assertion"],
            editHistory: ["test-edit"],
            aiGenerationInfo: ["test-ai-info"]
        });

        let claimHash;

        beforeEach(async function () {
            const tx = await c2paService.assertContent(
                contentHash,
                claimGenerator,
                claimSignature,
                metadata
            );
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "ContentAsserted");
            claimHash = event.args.claimHash;
        });

        it("Should verify claim successfully", async function () {
            // Fast forward time past cooldown
            await ethers.provider.send("evm_increaseTime", [VERIFICATION_COOLDOWN + 1]);
            await ethers.provider.send("evm_mine");

            const tx = await c2paService.verifyClaim(claimHash);
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "ClaimVerified");
            expect(event.args.claimHash).to.equal(claimHash);
            expect(event.args.isValid).to.be.true;
        });

        it("Should fail with invalid claim hash", async function () {
            await expect(
                c2paService.verifyClaim(ethers.constants.HashZero)
            ).to.be.revertedWith("Invalid claim hash");
        });

        it("Should fail when claim not found", async function () {
            const nonExistentClaimHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("non-existent"));
            await expect(
                c2paService.verifyClaim(nonExistentClaimHash)
            ).to.be.revertedWith("Claim not found");
        });

        it("Should fail during cooldown period", async function () {
            await expect(
                c2paService.verifyClaim(claimHash)
            ).to.be.revertedWith("Verification cooldown active");
        });
    });

    describe("Content Assertion Retrieval", function () {
        const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test content"));
        const claimGenerator = "test-generator";
        const claimSignature = "test-signature";
        const metadata = JSON.stringify({
            claimType: "c2pa.claim",
            contentFormat: "text",
            generator: claimGenerator,
            signature: claimSignature,
            timestamp: Math.floor(Date.now() / 1000),
            assertions: ["test-assertion"],
            editHistory: ["test-edit"],
            aiGenerationInfo: ["test-ai-info"]
        });

        beforeEach(async function () {
            await c2paService.assertContent(
                contentHash,
                claimGenerator,
                claimSignature,
                metadata
            );
        });

        it("Should retrieve content assertion", async function () {
            const assertion = await c2paService.getContentAssertion(contentHash);
            expect(assertion.contentHash).to.equal(contentHash);
            expect(assertion.claims.length).to.equal(1);
            expect(assertion.isVerified).to.be.true;
        });

        it("Should return empty assertion for non-existent content", async function () {
            const nonExistentContentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("non-existent"));
            const assertion = await c2paService.getContentAssertion(nonExistentContentHash);
            expect(assertion.contentHash).to.equal(ethers.constants.HashZero);
            expect(assertion.claims.length).to.equal(0);
            expect(assertion.isVerified).to.be.false;
        });
    });

    describe("Claim Retrieval", function () {
        const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test content"));
        const claimGenerator = "test-generator";
        const claimSignature = "test-signature";
        const metadata = JSON.stringify({
            claimType: "c2pa.claim",
            contentFormat: "text",
            generator: claimGenerator,
            signature: claimSignature,
            timestamp: Math.floor(Date.now() / 1000),
            assertions: ["test-assertion"],
            editHistory: ["test-edit"],
            aiGenerationInfo: ["test-ai-info"]
        });

        let claimHash;

        beforeEach(async function () {
            const tx = await c2paService.assertContent(
                contentHash,
                claimGenerator,
                claimSignature,
                metadata
            );
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "ContentAsserted");
            claimHash = event.args.claimHash;
        });

        it("Should retrieve claim", async function () {
            const claim = await c2paService.getClaim(claimHash);
            expect(claim.claimHash).to.equal(claimHash);
            expect(claim.claimGenerator).to.equal(claimGenerator);
            expect(claim.claimSignature).to.equal(claimSignature);
            expect(claim.isValid).to.be.true;
        });

        it("Should return empty claim for non-existent claim hash", async function () {
            const nonExistentClaimHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("non-existent"));
            const claim = await c2paService.getClaim(nonExistentClaimHash);
            expect(claim.claimHash).to.equal(ethers.constants.HashZero);
            expect(claim.claimGenerator).to.equal("");
            expect(claim.claimSignature).to.equal("");
            expect(claim.isValid).to.be.false;
        });
    });

    describe("Owner Functions", function () {
        it("Should update verification cooldown", async function () {
            const newCooldown = 7200; // 2 hours
            await c2paService.setVerificationCooldown(newCooldown);
            expect(await c2paService.verificationCooldown()).to.equal(newCooldown);
        });

        it("Should update max claims per content", async function () {
            const newMaxClaims = 10;
            await c2paService.setMaxClaimsPerContent(newMaxClaims);
            expect(await c2paService.maxClaimsPerContent()).to.equal(newMaxClaims);
        });

        it("Should update claim type support", async function () {
            const claimType = "test.claim";
            await c2paService.setClaimTypeSupport(claimType, true);
            expect(await c2paService.supportedClaimTypes(claimType)).to.be.true;

            await c2paService.setClaimTypeSupport(claimType, false);
            expect(await c2paService.supportedClaimTypes(claimType)).to.be.false;
        });

        it("Should update content format support", async function () {
            const format = "test-format";
            await c2paService.setContentFormatSupport(format, true);
            expect(await c2paService.supportedContentFormats(format)).to.be.true;

            await c2paService.setContentFormatSupport(format, false);
            expect(await c2paService.supportedContentFormats(format)).to.be.false;
        });

        it("Should fail when non-owner calls owner functions", async function () {
            await expect(
                c2paService.connect(user).setVerificationCooldown(7200)
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                c2paService.connect(user).setMaxClaimsPerContent(10)
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                c2paService.connect(user).setClaimTypeSupport("test.claim", true)
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                c2paService.connect(user).setContentFormatSupport("test-format", true)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
}); 