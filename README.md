<p align="center">
<img src="https://github.com/user-attachments/assets/b8b824a4-1356-427d-b19d-bfcbbfe2e62b" alt="Logo" width="350" height="100">
</p>

<p align="center">
  <a href="https://iroy.netlify.app/" style="color: #a77dff">IROY</a> | <a href="" style="color: #a77dff">Demo Video</a> | <a href="https://www.figma.com/deck/cAYmSnQxE71SLP2WBbBtNo" style="color: #a77dff">Pitchdeck</a> | <a href="https://github.com/ysongit/Iroy/tree/main/smart_contracts" style="color: #a77dff">Smart Contract</a> | <a href="https://github.com/ysongit/Iroy/blob/main/smart_contracts/documentation.txt" style="color: #a77dff">Tech docs</a>
</p>

<h2 align="center">AI-Powered IP Audit & Protection Assistant</h2>

## Smart contract deployed 
- **IroyIPRegistry**: [0x71336a8D1E667d1752E77848edaf0B51AE4c8F05](https://aeneid.storyscan.io/address/0x71336a8D1E667d1752E77848edaf0B51AE4c8F05)
- **IroyAuditEngine**: [0x0022aB73E07E99b23A297B5A44e56F86dd9F4707](https://aeneid.storyscan.io/address/0x0022aB73E07E99b23A297B5A44e56F86dd9F4707)
- **IroyAttestationManager**: [0x21Fa3C87E3175a2Ea4EfAa93de491b1A9B21c589](https://aeneid.storyscan.io/address/0x21Fa3C87E3175a2Ea4EfAa93de491b1A9B21c589)
- **Deployer**: [0x32f2708Cf129a1979Ed36D64188e005C46F97300](https://aeneid.storyscan.io/address/0x32f2708Cf129a1979Ed36D64188e005C46F97300)
- **Network**: StoryTestnet

## Project Overview

**Iroy** is an AI-powered intellectual property (IP) audit service that analyzes user-generated content (images, videos, music, papers, etc.) to determine its similarity with existing IPs and assist in registering new IPs on-chain via Story Protocol.

> Simply upload your work — Iroy vectorizes the content, compares it with registered IPs, detects plagiarism or stylistic overlap, and helps you register your IP with an attached audit report.

## Problem Statement

### "Who protects my creative work in the age of AI?"

Despite the ease of generating creative works with AI tools, several issues remain:

- **Difficulty detecting plagiarism**
    - Human judgment can't easily detect **stylistic plagiarism** (color tones, composition, structure).
    - Verifying if similar IPs already exist is time-consuming and nearly impossible manually.
- **Limited IP verification**
    - Existing services (like SAS and Yakoa) on Story Protocol only check if an IP is registered.
    - Users can't see **how similar** their content is or **what elements are overlapping**.
- **Lack of user-friendly platforms**
    - Current tools are built for developers (API/CLI).
    - No intuitive UI/UX for general users, artists, or designers.

## Our Solution

### "We protect your creative rights."

**Iroy** provides a comprehensive suite of features to audit, protect, and register IP:

### 1) **AI-Based IP Similarity Detection**

- Uses Eliza + Story Protocol Plugin to vectorize and semantically compare content.
- Supports multiple formats: image, text, music, etc.

### 2) **AI Style Plagiarism Detection**

- Trained models detect stylistic similarities such as tone, composition, and color palette.
- Surfaces even subtle creative overlaps undetectable to the human eye.
- Learns and improves with user feedback.

### 3) **Automated IP Registration via Story Protocol**

- Based on audit results, users can register their content on-chain.
- Audit data is also stored, enhancing credibility and transparency.

### 4) **Snap/Wallet Integration**

- Integrates with Tomo Wallet to allow **IP checks directly in-wallet**.
- Users get real-time modal feedback if content is similar to existing IPs.
- Delivered via Snap as a lightweight wallet-based service.

## Differentiation

| Feature | Existing Services (SAS, Yakoa) | **Iroy** |
| --- | --- | --- |
| IP Verification | Only checks if IP is registered | Full similarity analysis + side-by-side comparison |
| Style Detection | ❌ | ✅ AI-powered stylistic plagiarism detection |
| UX | Dev/API-only | User-friendly dashboard |
| Access | Limited to Story Protocol | Available via web & wallet Snap |
| IP Registration | Manual | Auto registration with audit attached |
| Extensibility | Internal use only | API/Snap enables wide integration |

## How to use tech
### [Story Protocol and C2PA](https://github.com/ysongit/Iroy/tree/main/smart_contracts):

Iroy seamlessly integrates Story Protocol and C2PA (Content Credentials Protocol) to establish a comprehensive ecosystem for intellectual property (IP) protection and content authenticity verification. C2PA enables verification of metadata such as the creator, timestamp, and AI-generated status of content using cryptographic signatures. Iroy leverages this to verify the authenticity of user-submitted content and detect any tampering or manipulation. Once verified, the results are securely stored and used as trusted evidence for IP registration.

Verified content is then automatically registered as an IP asset via the IroyIPRegistry smart contract, which is connected to Story Protocol. The content is mapped to a unique Story Protocol ID, enabling cross-chain ownership tracking and licensing management. In other words, once content passes C2PA verification, Iroy links it to Story Protocol, allowing it to be managed and traded as a decentralized IP asset.

This integration goes beyond simple verification by automating and securing the entire lifecycle of IP—from creation and validation to registration and tracking. For users, this means they can experience detailed AI-powered content audits and instant IP registration via Story Protocol in a single seamless process, ensuring both ease of use and high reliability.

### [Gaia agent](https://github.com/ysongit/Iroy/tree/main/smart_contracts):

The Iroy system integrates the Gaia AI Agent to perform AI-generated content detection, automated verification, and advanced content analysis. When content is submitted, it is first analyzed by Gaia AI to determine whether it was created by a human or generated by an AI model. This verification process is crucial, especially in situations where the legal ownership or authenticity of AI-generated content is in question.

Gaia is integrated via Snap and supports different content types such as text and images, applying appropriate analysis algorithms automatically. The analysis returns a Boolean result, and only content that passes this verification is allowed to proceed to IP registration through Story Protocol. This ensures that fake, altered, or AI-generated content is filtered out before registration, preserving the integrity of the IP system.

### [Yakoa](https://github.com/ysongit/Iroy/tree/main/smart_contracts):

Yakoa plays a key role in the Iroy system by performing content similarity checks and copyright infringement detection. When a user submits content, it is hashed and sent to Yakoa’s API to be compared against a global database of registered content. Yakoa returns a similarity score indicating how closely the submitted content matches existing works, as well as a flag indicating whether the content is potentially infringing.

This feature allows Iroy to go beyond authenticity verification, enabling automatic detection of duplicates, plagiarism, or licensing violations. If the similarity score is high or if the content is flagged as infringing, the system automatically suspends the registration process and notifies the creator.

## User Flow

### [A] Web-Based Dashboard
1. User uploads content.
2. Eliza + Story Plugin perform real-time vectorization & analysis.
3. Audit report is generated (shows similar IPs, similarity scores, style match).
4. User can register content as IP via Story Protocol.
5. Audit result is stored on-chain with the IP.

### [B] Snap / Wallet Flow
1. User launches Snap inside Tomo Wallet.
2. Selects and uploads content.
3. Sees a **summary modal** with plagiarism check results.
4. Redirected to full platform if deeper analysis is needed.

## Architecture Diagram

```
User Content Upload
       │
       ▼
[Vectorization & Semantic Comparison]
- Gaia + Story Protocol Plugin
       │
       ▼
[AI Style Similarity Detection]
- Composition, tone, structure, etc.
       │
       ▼
[Audit Report Generation]
- Includes similarity scores and matched IPs
       │
       ├──> User reviews and registers via Story Protocol
       └──> Summary modal shown in Snap/Wallet

```

## Tech Stack & Integrations
- **~~Eliza**: Advanced content vectorization and similarity model~~
- **Story Protocol**:
    - IP Asset API: https://docs.story.foundation/concepts/ip-asset/overview
    - Attestation Service: https://docs.story.foundation/concepts/story-attestation-service
- **C2PA**: Industry-standard provenance metadata: https://c2pa.org/specifications/
- **Yakoa**: IP metadata and matching API: https://www.yakoa.io/
- **Tomo Wallet SDK**: https://docs.tomo.inc/tomo-sdk/tomoevmkit
- **Gaia AI Agent**: Snap-integrated analysis support: https://docs.gaianet.ai/intro/

## Future Roadmap
- Support more formats (audio, 3D, code, etc.)
- Predictive IP conflict alerts (based on audit insights)
- Auto-generate legal documents for copyright disputes
- Improved AI model training via user-uploaded datasets

## Tagline

> “Iroy: Your IP Audit Partner in the AI Era”
> Verify originality, detect plagiarism, and register your work with confidence.
