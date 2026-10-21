import express from 'express'
import * as  analysis from '../controllers/analysis.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js';

const route=express.Router();

route.post('/api/analysis',authMiddleware,analysis.analyzeErrorController)
route.get('/api/dashboard/stats',authMiddleware,analysis.getDashboardStats)
route.get('/api/history',authMiddleware,analysis.getAnalysisHistory);
route.get('/api/bookmarks',authMiddleware,analysis.listBookmarks)
route.post('/api/bookmarks/:id',authMiddleware,analysis.bookmarkAnalysis)
route.delete('/api/bookmarks/:id',authMiddleware,analysis.unbookmarkAnalysis)
route.get('/:id',authMiddleware,analysis.getAnalysisById);
route.delete('/:id',authMiddleware,analysis.deleteAnalysis)
export default route;
