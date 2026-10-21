import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createProject, getProjectAnalyses, listProjects, renameProject } from '../controllers/project.controller.js';

const route = express.Router();
route.use(authMiddleware);
route.get('/', listProjects);
route.post('/', createProject);
route.get('/:id/analyses', getProjectAnalyses);
route.patch('/:id', renameProject);

export default route;
