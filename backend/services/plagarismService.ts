export const checkPlagiarism = async (content: string, type: string) => {
  // Simulate call to Yakoa
  const similarityScore = Math.random();
  // Simulate call to Gaia AI
  const aiComment = similarityScore > 0.7 ? 'High similarity detected' : 'Content appears original';

  return {
    similarityScore,
    aiComment,
    contentHash: hashContent(content),
    type,
    timestamp: new Date().toISOString(),
  };
};
const hashContent = (content: string): string => {
  const hash = require('crypto').createHash('sha256');
  return hash.update(content).digest('hex');
};
