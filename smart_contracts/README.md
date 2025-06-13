# Iroy: AI-Powered IP Audit & Protection System

A smart contract-based system for verifying content authenticity, detecting plagiarism, and managing intellectual property rights using C2PA (Content Authenticity Initiative) standard and Story Protocol integration.

## Smart Contract Architecture

### Core Contracts

1. **C2PAService.sol**
   - Main service contract
   - Handles content assertions and verifications
   - Manages content versions and relationships
   - Emits events for frontend integration

2. **C2PAVerifier.sol**
   - C2PA claim verification library
   - Validates content authenticity
   - Processes C2PA metadata

3. **ContentAnalyzer.sol**
   - Content analysis library
   - Plagiarism detection
   - Style similarity analysis
   - Format-specific analysis

4. **JSONParser.sol**
   - Metadata parsing library
   - Handles C2PA metadata format
   - Processes content assertions

## Integration Guide

### 1. Contract Deployment

```javascript
// Deploy C2PAService
const C2PAService = await ethers.getContractFactory("C2PAService");
const c2paService = await C2PAService.deploy();
await c2paService.deployed();

// Set up supported formats
await c2paService.setContentFormatSupport("text", true);
await c2paService.setContentFormatSupport("image", true);
await c2paService.setContentFormatSupport("pdf", true);
await c2paService.setContentFormatSupport("document", true);
await c2paService.setContentFormatSupport("audio", true);
await c2paService.setContentFormatSupport("video", true);
await c2paService.setContentFormatSupport("code", true);

// Set up supported claim types
await c2paService.setClaimTypeSupport("c2pa.claim", true);
await c2paService.setClaimTypeSupport("c2pa.assertion", true);
```

### 2. Content Assertion

```javascript
// Prepare content metadata
const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("content"));
const metadata = JSON.stringify({
    claimType: "c2pa.claim",
    contentFormat: "text",
    generator: "test-generator",
    signature: "test-signature",
    timestamp: Math.floor(Date.now() / 1000),
    assertions: ["test-assertion"],
    editHistory: ["test-edit"],
    aiGenerationInfo: ["AI-generated"]
});

// Assert content
await c2paService.assertContent(
    contentHash,
    "test-generator",
    "test-signature",
    metadata
);
```

### 3. Content Versioning

```javascript
// Add content version
await c2paService.addContentVersion(
    contentHash,
    "v1.0.0",
    ["Initial version"],
    "creator-address"
);

// Get content versions
const versions = await c2paService.getContentVersions(contentHash);
```

### 4. Content Relationships

```javascript
// Add content relationship
await c2paService.addContentRelationship(
    contentHash,
    "derivative",
    "target-content-hash",
    "Derived from original work"
);

// Get content relationships
const relationships = await c2paService.getContentRelationships(contentHash);
```

### 5. Content Analysis

```javascript
// Get analysis results
const analysisResults = await c2paService.getContentAnalysisResults(contentHash);
```

## Event Listening

### 1. Content Assertion Events

```javascript
c2paService.on("ContentAsserted", (contentHash, claimHash, success) => {
    console.log(`Content ${contentHash} asserted with claim ${claimHash}: ${success}`);
});
```

### 2. Content Version Events

```javascript
c2paService.on("ContentVersionAdded", (contentHash, versionId, timestamp) => {
    console.log(`Version ${versionId} added to content ${contentHash} at ${timestamp}`);
});
```

### 3. Content Relationship Events

```javascript
c2paService.on("ContentRelationshipAdded", (contentHash, relationshipType, targetContentHash) => {
    console.log(`Relationship ${relationshipType} added between ${contentHash} and ${targetContentHash}`);
});
```

## Frontend Integration

### 1. Content Upload Flow

```javascript
async function handleContentUpload(content, metadata) {
    // 1. Calculate content hash
    const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(content));
    
    // 2. Prepare metadata
    const formattedMetadata = JSON.stringify({
        claimType: "c2pa.claim",
        contentFormat: metadata.format,
        generator: metadata.generator,
        signature: metadata.signature,
        timestamp: Math.floor(Date.now() / 1000),
        assertions: metadata.assertions,
        editHistory: metadata.editHistory,
        aiGenerationInfo: metadata.aiGenerationInfo
    });
    
    // 3. Assert content
    const tx = await c2paService.assertContent(
        contentHash,
        metadata.generator,
        metadata.signature,
        formattedMetadata
    );
    
    // 4. Wait for transaction
    const receipt = await tx.wait();
    
    // 5. Get analysis results
    const analysisResults = await c2paService.getContentAnalysisResults(contentHash);
    
    return {
        contentHash,
        analysisResults
    };
}
```

### 2. Content Version Management

```javascript
async function handleVersionUpdate(contentHash, versionData) {
    // 1. Add new version
    const tx = await c2paService.addContentVersion(
        contentHash,
        versionData.id,
        versionData.changes,
        versionData.creator
    );
    
    // 2. Wait for transaction
    const receipt = await tx.wait();
    
    // 3. Get updated versions
    const versions = await c2paService.getContentVersions(contentHash);
    
    return versions;
}
```

### 3. Content Relationship Management

```javascript
async function handleRelationshipAdd(contentHash, relationshipData) {
    // 1. Add relationship
    const tx = await c2paService.addContentRelationship(
        contentHash,
        relationshipData.type,
        relationshipData.targetHash,
        relationshipData.description
    );
    
    // 2. Wait for transaction
    const receipt = await tx.wait();
    
    // 3. Get updated relationships
    const relationships = await c2paService.getContentRelationships(contentHash);
    
    return relationships;
}
```

## Backend Integration

### 1. API Endpoints

```javascript
// Content assertion endpoint
app.post('/api/content/assert', async (req, res) => {
    const { content, metadata } = req.body;
    const result = await handleContentUpload(content, metadata);
    res.json(result);
});

// Content version endpoint
app.post('/api/content/version', async (req, res) => {
    const { contentHash, versionData } = req.body;
    const versions = await handleVersionUpdate(contentHash, versionData);
    res.json(versions);
});

// Content relationship endpoint
app.post('/api/content/relationship', async (req, res) => {
    const { contentHash, relationshipData } = req.body;
    const relationships = await handleRelationshipAdd(contentHash, relationshipData);
    res.json(relationships);
});
```

### 2. Event Processing

```javascript
// Set up event listeners
function setupEventListeners() {
    c2paService.on("ContentAsserted", async (contentHash, claimHash, success) => {
        // Process content assertion
        await processContentAssertion(contentHash, claimHash, success);
    });
    
    c2paService.on("ContentVersionAdded", async (contentHash, versionId, timestamp) => {
        // Process version addition
        await processVersionAddition(contentHash, versionId, timestamp);
    });
    
    c2paService.on("ContentRelationshipAdded", async (contentHash, relationshipType, targetContentHash) => {
        // Process relationship addition
        await processRelationshipAddition(contentHash, relationshipType, targetContentHash);
    });
}
```

## Security Considerations

1. **Content Validation**
   - Validate content format before assertion
   - Verify content hash matches provided content
   - Check content size limits

2. **Access Control**
   - Implement role-based access control
   - Restrict sensitive operations to authorized users
   - Validate user permissions before operations

3. **Rate Limiting**
   - Implement rate limiting for content assertions
   - Limit number of versions per content
   - Restrict relationship creation frequency

4. **Error Handling**
   - Implement proper error handling for contract interactions
   - Provide meaningful error messages
   - Log errors for debugging

## Testing

1. **Unit Tests**
   ```bash
   npx hardhat test
   ```

2. **Integration Tests**
   ```bash
   npx hardhat test test/C2PAIntegration.test.js
   ```

## Deployment

1. **Network Configuration**
   ```javascript
   // hardhat.config.js
   module.exports = {
     networks: {
       mainnet: {
         url: process.env.MAINNET_URL,
         accounts: [process.env.PRIVATE_KEY]
       },
       testnet: {
         url: process.env.TESTNET_URL,
         accounts: [process.env.PRIVATE_KEY]
       }
     }
   };
   ```

2. **Deployment Script**
   ```bash
   npx hardhat run scripts/deploy.js --network mainnet
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
