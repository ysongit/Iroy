import { Request, Response } from 'express';
import { checkPlagiarism } from '../services/plagarismService';

export const handleUpload = async (req: Request, res: Response) => {
  const { content, type } = req.body;

  const result = await checkPlagiarism(content, type);

  res.json({
    audit: result,
    verifiedBy: 'Yakoa + Gaia',
  });
};