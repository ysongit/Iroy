# Iroy: AI-Powered IP Audit & Protection Assistant

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
