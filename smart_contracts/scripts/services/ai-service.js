const axios = require('axios');
const { ethers } = require('ethers');

class AIService {
    constructor(config) {
        this.yakoaEndpoint = config.yakoaEndpoint;
        this.gaiaEndpoint = config.gaiaEndpoint;
        this.yakoaApiKey = config.yakoaApiKey;
        this.gaiaApiKey = config.gaiaApiKey;
    }

    async checkIPSimilarity(content) {
        try {
            const response = await axios.post(
                `${this.yakoaEndpoint}/check-similarity`,
                { content },
                {
                    headers: {
                        'accept': 'application/json',
                        'X-API-KEY': this.yakoaApiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error checking IP similarity:', error);
            throw error;
        }
    }

    async analyzeStyle(content, contentType) {
        try {
            const response = await axios.post(
                `${this.gaiaEndpoint}/analyze-style`,
                {
                    content,
                    contentType
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.gaiaApiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error analyzing style:', error);
            throw error;
        }
    }

    async analyzeContent(content, contentType) {
        // Step 1: Check IP similarity using Yakoa
        const similarityResult = await this.checkIPSimilarity(content);
        
        // Step 2: Analyze style using Gaia
        const styleResult = await this.analyzeStyle(content, contentType);

        // Combine results
        return {
            vectorAnalysis: {
                vectorHash: ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(similarityResult))),
                similarityScores: similarityResult.scores || [],
                similarIPs: similarityResult.similarIPs || [],
                hasPlagiarism: similarityResult.hasPlagiarism || false,
                plagiarismScore: similarityResult.plagiarismScore || 0
            },
            styleAnalysis: {
                styleHash: ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(styleResult))),
                styleScores: styleResult.scores || [],
                similarStyles: styleResult.similarStyles || [],
                hasStyleMatch: styleResult.hasStyleMatch || false,
                styleMatchScore: styleResult.styleMatchScore || 0
            },
            metadata: contentType,
            timestamp: Math.floor(Date.now() / 1000)
        };
    }
}

module.exports = AIService; 