const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IroyAttestationManager", function () {
    let ipRegistry;
    let auditEngine;
    let attestationManager;
    let owner;
    let user1;
    let user2;
    let mockEAS;
    let mockSchemaRegistry;
    let mockSchemaId;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy mock EAS contract
        const MockEAS = await ethers.getContractFactory("MockEAS");
        mockEAS = await MockEAS.deploy();

        // Deploy mock Schema Registry
        const MockSchemaRegistry = await ethers.getContractFactory("MockSchemaRegistry");
        mockSchemaRegistry = await MockSchemaRegistry.deploy();

        // Deploy IP Registry
        const IroyIPRegistry = await ethers.getContractFactory("IroyIPRegistry");
        ipRegistry = await IroyIPRegistry.deploy(ethers.ZeroAddress);

        // Deploy Audit Engine
        const IroyAuditEngine = await ethers.getContractFactory("IroyAuditEngine");
        auditEngine = await IroyAuditEngine.deploy(ipRegistry.target, 5000);

        // Deploy Attestation Manager
        const IroyAttestationManager = await ethers.getContractFactory("IroyAttestationManager");
        attestationManager = await IroyAttestationManager.deploy(
            ipRegistry.target,
            auditEngine.target,
            mockEAS.target,
            mockSchemaRegistry.target
        );

        // Register a mock schema
        mockSchemaId = ethers.keccak256(ethers.toUtf8Bytes("IP_ATTESTATION_SCHEMA"));
        await mockSchemaRegistry.registerSchema(mockSchemaId);
        await attestationManager.setIPAttestationSchema(mockSchemaId);
    });

    describe("Initialization", function () {
        it("Should set the correct initial values", async function () {
            expect(await attestationManager.ipRegistry()).to.equal(ipRegistry.target);
            expect(await attestationManager.auditEngine()).to.equal(auditEngine.target);
            expect(await attestationManager.easContract()).to.equal(mockEAS.target);
            expect(await attestationManager.schemaRegistry()).to.equal(mockSchemaRegistry.target);
            expect(await attestationManager.ipAttestationSchema()).to.equal(mockSchemaId);
        });
    });

    describe("Delegated Attesters", function () {
        it("Should allow owner to update delegated attesters", async function () {
            await attestationManager.updateDelegatedAttester(user1.address, true);
            expect(await attestationManager.delegatedAttesters(user1.address)).to.be.true;
        });

        it("Should not allow non-owners to update delegated attesters", async function () {
            await expect(
                attestationManager.connect(user1).updateDelegatedAttester(user2.address, true)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Attestation Creation", function () {
        beforeEach(async function () {
            // Register an IP asset
            const contentHash = "QmTest123";
            const metadataURI = "ipfs://test";
            await ipRegistry.registerIPAsset(
                contentHash,
                metadataURI,
                0 // MediaType.IMAGE
            );
        });

        it("Should create an attestation successfully", async function () {
            const attestationData = ethers.AbiCoder.defaultAbiCoder().encode(
                ["string", "uint256"],
                ["Test Attestation", 100]
            );

            const tx = await attestationManager.createIPAttestation(
                1, // IP asset ID
                attestationData,
                true // revocable
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === "AttestationCreated"
            );

            expect(event).to.not.be.undefined;
            expect(event.args[0]).to.equal(1); // ipAssetId
            expect(event.args[2]).to.equal(owner.address); // attester
            expect(event.args[3]).to.equal(true); // revocable

            const attestations = await attestationManager.getIPAttestations(1);
            expect(attestations.length).to.equal(1);
        });

        it("Should not allow non-authorized users to create attestations", async function () {
            const attestationData = ethers.AbiCoder.defaultAbiCoder().encode(
                ["string", "uint256"],
                ["Test Attestation", 100]
            );

            await expect(
                attestationManager.connect(user1).createIPAttestation(
                    1,
                    attestationData,
                    true
                )
            ).to.be.revertedWith("Not authorized to create attestations");
        });

        it("Should create batch attestations successfully", async function () {
            // Register another IP asset
            const contentHash2 = "QmTest456";
            const metadataURI2 = "ipfs://test2";
            await ipRegistry.registerIPAsset(
                contentHash2,
                metadataURI2,
                0 // MediaType.IMAGE
            );

            const attestationData1 = ethers.AbiCoder.defaultAbiCoder().encode(
                ["string", "uint256"],
                ["Test Attestation 1", 100]
            );
            const attestationData2 = ethers.AbiCoder.defaultAbiCoder().encode(
                ["string", "uint256"],
                ["Test Attestation 2", 200]
            );

            const tx = await attestationManager.batchCreateIPAttestations(
                [1, 2],
                [attestationData1, attestationData2],
                true
            );

            const receipt = await tx.wait();
            const events = receipt.logs.filter(
                log => log.fragment && log.fragment.name === "AttestationCreated"
            );

            expect(events.length).to.equal(2);
            expect(events[0].args[0]).to.equal(1); // First IP asset ID
            expect(events[1].args[0]).to.equal(2); // Second IP asset ID
            expect(events[0].args[2]).to.equal(owner.address); // attester
            expect(events[0].args[3]).to.equal(true); // revocable

            const attestations1 = await attestationManager.getIPAttestations(1);
            const attestations2 = await attestationManager.getIPAttestations(2);
            expect(attestations1.length).to.equal(1);
            expect(attestations2.length).to.equal(1);
        });
    });

    describe("Attestation Revocation", function () {
        let attestationUID;

        beforeEach(async function () {
            // Register an IP asset
            const contentHash = "QmTest123";
            const metadataURI = "ipfs://test";
            await ipRegistry.registerIPAsset(
                contentHash,
                metadataURI,
                0 // MediaType.IMAGE
            );

            // Create an attestation
            const attestationData = ethers.AbiCoder.defaultAbiCoder().encode(
                ["string", "uint256"],
                ["Test Attestation", 100]
            );

            const tx = await attestationManager.createIPAttestation(
                1,
                attestationData,
                true
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === "AttestationCreated"
            );
            attestationUID = event.args[1];
        });

        it("Should revoke an attestation successfully", async function () {
            const tx = await attestationManager.revokeAttestation(attestationUID);

            const receipt = await tx.wait();
            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === "AttestationRevoked"
            );

            expect(event).to.not.be.undefined;
            expect(event.args[0]).to.equal(attestationUID);
            expect(event.args[1]).to.equal(owner.address);

            expect(await attestationManager.revokedAttestations(attestationUID)).to.be.true;
        });

        it("Should not allow non-authorized users to revoke attestations", async function () {
            await expect(
                attestationManager.connect(user1).revokeAttestation(attestationUID)
            ).to.be.revertedWith("Not authorized to revoke attestations");
        });

        it("Should not allow revoking an already revoked attestation", async function () {
            await attestationManager.revokeAttestation(attestationUID);

            await expect(
                attestationManager.revokeAttestation(attestationUID)
            ).to.be.revertedWith("Attestation already revoked");
        });
    });

    describe("Attestation Validation", function () {
        let attestationUID;

        beforeEach(async function () {
            // Register an IP asset
            const contentHash = "QmTest123";
            const metadataURI = "ipfs://test";
            await ipRegistry.registerIPAsset(
                contentHash,
                metadataURI,
                0 // MediaType.IMAGE
            );

            // Create an attestation
            const attestationData = ethers.AbiCoder.defaultAbiCoder().encode(
                ["string", "uint256"],
                ["Test Attestation", 100]
            );

            const tx = await attestationManager.createIPAttestation(
                1,
                attestationData,
                true
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === "AttestationCreated"
            );
            attestationUID = event.args[1];
        });

        it("Should validate a valid attestation", async function () {
            expect(await attestationManager.isAttestationValid(attestationUID)).to.be.true;
        });

        it("Should not validate a revoked attestation", async function () {
            await attestationManager.revokeAttestation(attestationUID);
            expect(await attestationManager.isAttestationValid(attestationUID)).to.be.false;
        });
    });
}); 