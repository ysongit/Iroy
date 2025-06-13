const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("C2PAService Integration", function () {
    let c2paService;
    let owner;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const C2PAService = await ethers.getContractFactory("C2PAService");
        c2paService = await C2PAService.deploy();
        await c2paService.deployed();

        // Set up supported formats
        await c2paService.setContentFormatSupport("text", true);
        await c2paService.setContentFormatSupport("image", true);
        await c2paService.setContentFormatSupport("pdf", true);
        await c2paService.setContentFormatSupport("document", true);
        await c2paService.setContentFormatSupport("audio", true);
        await c2paService.setContentFormatSupport("video", true);
        await c2paService.setContentFormatSupport("code", true);

        await c2paService.setClaimTypeSupport("c2pa.claim", true);
        await c2paService.setClaimTypeSupport("c2pa.assertion", true);
    });

    describe("IP Registration Flow", function () {
        it("should register IP with audit report", async function () {
            const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test content"));
            const metadata = JSON.stringify({
                claimType: "c2pa.claim",
                contentFormat: "text",
                generator: "test-generator",
                signature: "test-signature",
                timestamp: Math.floor(Date.now() / 1000),
                assertions: ["test-assertion"],
                editHistory: ["test-edit"],
                aiGenerationInfo: ["AI-generated"],
                ipRegistration: {
                    title: "Test IP",
                    description: "Test IP Description",
                    creator: owner.address,
                    license: "MIT"
                }
            });

            // Assert content
            await c2paService.assertContent(
                contentHash,
                "test-generator",
                "test-signature",
                metadata
            );

            // Get analysis results
            const analysisResults = await c2paService.getContentAnalysisResults(contentHash);
            expect(analysisResults.length).to.equal(1);
            expect(analysisResults[0].hasPlagiarism).to.be.false;
            expect(analysisResults[0].hasStyleMatch).to.be.true;
        });

        it("should detect and report plagiarism", async function () {
            // First content
            const content1Hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("original content"));
            const metadata1 = JSON.stringify({
                claimType: "c2pa.claim",
                contentFormat: "text",
                generator: "test-generator",
                signature: "test-signature",
                timestamp: Math.floor(Date.now() / 1000),
                assertions: ["test-assertion"],
                editHistory: ["test-edit"],
                aiGenerationInfo: []
            });

            await c2paService.assertContent(
                content1Hash,
                "test-generator",
                "test-signature",
                metadata1
            );

            // Similar content
            const content2Hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("original content with minor changes"));
            const metadata2 = JSON.stringify({
                claimType: "c2pa.claim",
                contentFormat: "text",
                generator: "test-generator",
                signature: "test-signature",
                timestamp: Math.floor(Date.now() / 1000),
                assertions: ["test-assertion"],
                editHistory: ["test-edit"],
                aiGenerationInfo: []
            });

            await c2paService.assertContent(
                content2Hash,
                "test-generator",
                "test-signature",
                metadata2
            );

            // Get analysis results
            const analysisResults = await c2paService.getContentAnalysisResults(content2Hash);
            expect(analysisResults.length).to.equal(1);
            expect(analysisResults[0].hasPlagiarism).to.be.true;
            expect(analysisResults[0].plagiarismScore).to.be.gt(80);
        });
    });

    describe("Style Plagiarism Detection", function () {
        it("should detect style plagiarism in images", async function () {
            const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test image"));
            const metadata = JSON.stringify({
                claimType: "c2pa.claim",
                contentFormat: "image",
                generator: "test-generator",
                signature: "test-signature",
                timestamp: Math.floor(Date.now() / 1000),
                assertions: ["test-assertion"],
                editHistory: ["test-edit"],
                aiGenerationInfo: ["AI-generated"],
                styleInfo: {
                    colorPalette: ["#FF0000", "#00FF00", "#0000FF"],
                    composition: "rule of thirds",
                    technique: "digital art"
                }
            });

            await c2paService.assertContent(
                contentHash,
                "test-generator",
                "test-signature",
                metadata
            );

            const analysisResults = await c2paService.getContentAnalysisResults(contentHash);
            expect(analysisResults.length).to.equal(1);
            expect(analysisResults[0].hasStyleMatch).to.be.true;
            expect(analysisResults[0].styleSimilarityScore).to.be.gt(70);
        });

        it("should detect style plagiarism in text", async function () {
            const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test text"));
            const metadata = JSON.stringify({
                claimType: "c2pa.claim",
                contentFormat: "text",
                generator: "test-generator",
                signature: "test-signature",
                timestamp: Math.floor(Date.now() / 1000),
                assertions: ["test-assertion"],
                editHistory: ["test-edit"],
                aiGenerationInfo: ["AI-generated"],
                styleInfo: {
                    writingStyle: "academic",
                    tone: "formal",
                    structure: "research paper"
                }
            });

            await c2paService.assertContent(
                contentHash,
                "test-generator",
                "test-signature",
                metadata
            );

            const analysisResults = await c2paService.getContentAnalysisResults(contentHash);
            expect(analysisResults.length).to.equal(1);
            expect(analysisResults[0].hasStyleMatch).to.be.true;
            expect(analysisResults[0].styleSimilarityScore).to.be.gt(70);
        });
    });

    describe("Document Parsing", function () {
        it("should parse and analyze PDF documents", async function () {
            const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test pdf"));
            const metadata = JSON.stringify({
                claimType: "c2pa.claim",
                contentFormat: "pdf",
                generator: "test-generator",
                signature: "test-signature",
                timestamp: Math.floor(Date.now() / 1000),
                assertions: ["test-assertion"],
                editHistory: ["test-edit"],
                aiGenerationInfo: [],
                documentInfo: {
                    title: "Test Document",
                    author: "Test Author",
                    keywords: ["test", "document", "pdf"],
                    sections: ["introduction", "methodology", "results"]
                }
            });

            await c2paService.assertContent(
                contentHash,
                "test-generator",
                "test-signature",
                metadata
            );

            const analysisResults = await c2paService.getContentAnalysisResults(contentHash);
            expect(analysisResults.length).to.equal(1);
            expect(analysisResults[0].detectedIssues.length).to.be.gt(0);
        });

        it("should parse and analyze academic papers", async function () {
            const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test paper"));
            const metadata = JSON.stringify({
                claimType: "c2pa.claim",
                contentFormat: "document",
                generator: "test-generator",
                signature: "test-signature",
                timestamp: Math.floor(Date.now() / 1000),
                assertions: ["test-assertion"],
                editHistory: ["test-edit"],
                aiGenerationInfo: [],
                documentInfo: {
                    title: "Test Paper",
                    authors: ["Author 1", "Author 2"],
                    abstract: "Test abstract",
                    keywords: ["test", "paper", "academic"],
                    references: ["ref1", "ref2", "ref3"]
                }
            });

            await c2paService.assertContent(
                contentHash,
                "test-generator",
                "test-signature",
                metadata
            );

            const analysisResults = await c2paService.getContentAnalysisResults(contentHash);
            expect(analysisResults.length).to.equal(1);
            expect(analysisResults[0].detectedIssues.length).to.be.gt(0);
        });
    });

    describe("Content Vectorization", function () {
        it("should vectorize and compare content", async function () {
            // First content
            const content1Hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("original content"));
            const metadata1 = JSON.stringify({
                claimType: "c2pa.claim",
                contentFormat: "text",
                generator: "test-generator",
                signature: "test-signature",
                timestamp: Math.floor(Date.now() / 1000),
                assertions: ["test-assertion"],
                editHistory: ["test-edit"],
                aiGenerationInfo: [],
                vectorInfo: {
                    dimensions: 768,
                    model: "text-embedding-ada-002"
                }
            });

            await c2paService.assertContent(
                content1Hash,
                "test-generator",
                "test-signature",
                metadata1
            );

            // Similar content
            const content2Hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("similar content"));
            const metadata2 = JSON.stringify({
                claimType: "c2pa.claim",
                contentFormat: "text",
                generator: "test-generator",
                signature: "test-signature",
                timestamp: Math.floor(Date.now() / 1000),
                assertions: ["test-assertion"],
                editHistory: ["test-edit"],
                aiGenerationInfo: [],
                vectorInfo: {
                    dimensions: 768,
                    model: "text-embedding-ada-002"
                }
            });

            await c2paService.assertContent(
                content2Hash,
                "test-generator",
                "test-signature",
                metadata2
            );

            const analysisResults = await c2paService.getContentAnalysisResults(content2Hash);
            expect(analysisResults.length).to.equal(1);
            expect(analysisResults[0].hasPlagiarism).to.be.true;
            expect(analysisResults[0].plagiarismScore).to.be.gt(80);
        });
    });
}); 