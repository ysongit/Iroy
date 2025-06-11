
import express from 'express';
import { handleUpload } from '../controllers/ipAuditController';

const router = express.Router();
router.post('/upload', handleUpload);


export default router;
