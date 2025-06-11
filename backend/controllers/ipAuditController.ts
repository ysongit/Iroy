import { Request, Response } from 'express';
import { checkPlagiarism } from '../services/plagarismService';

export const handleUpload = async (req: Request, res: Response) => {
  const { content, type } = req.body;
  if (!content || !type) return res.status(400).json({ error: 'Missing content or type' });

  try {
    const result = await checkPlagiarism(content, type);
    res.json({ audit: result, verifiedBy: ['Yakoa', 'Gaia'] });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error', details: e });
  }
};