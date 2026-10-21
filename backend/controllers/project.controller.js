import mongoose from 'mongoose';
import Project from '../model/project.model.js';
import Analysis from '../model/analysis.model.js';

const normalizeName = value => typeof value === 'string' ? value.trim() : '';

export async function listProjects(req, res) {
    try {
        const userId = req.user.id;
        const [projects, counts] = await Promise.all([
            Project.find({ user: userId }).sort({ updatedAt: -1 }),
            Analysis.aggregate([
                { $match: { user: new mongoose.Types.ObjectId(userId), project: { $ne: null } } },
                { $group: { _id: '$project', count: { $sum: 1 } } }
            ])
        ]);
        const countByProject = new Map(counts.map(row => [String(row._id), row.count]));
        return res.status(200).json({
            success: true,
            projects: projects.map(project => ({ ...project.toObject(), analysisCount: countByProject.get(String(project._id)) || 0 }))
        });
    } catch (error) {
        console.error('Project list error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch projects' });
    }
}

export async function createProject(req, res) {
    const name = normalizeName(req.body?.name);
    const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
    if (!name || name.length > 80 || description.length > 500) {
        return res.status(400).json({ success: false, message: 'Project name is required (80 characters max); description must be 500 characters max' });
    }
    try {
        const project = await Project.create({ user: req.user.id, name, description });
        return res.status(201).json({ success: true, project: { ...project.toObject(), analysisCount: 0 } });
    } catch (error) {
        if (error?.code === 11000) return res.status(409).json({ success: false, message: 'A project with this name already exists' });
        console.error('Project create error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create project' });
    }
}

export async function renameProject(req, res) {
    const { id } = req.params;
    const name = normalizeName(req.body?.name);
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid project ID' });
    if (!name || name.length > 80) return res.status(400).json({ success: false, message: 'Project name is required and must be 80 characters or fewer' });
    try {
        const project = await Project.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { $set: { name } },
            { new: true, runValidators: true }
        );
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
        return res.status(200).json({ success: true, project });
    } catch (error) {
        if (error?.code === 11000) return res.status(409).json({ success: false, message: 'A project with this name already exists' });
        console.error('Project rename error:', error);
        return res.status(500).json({ success: false, message: 'Failed to rename project' });
    }
}

export async function getProjectAnalyses(req, res) {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid project ID' });
    try {
        const project = await Project.findOne({ _id: id, user: req.user.id });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
        const analyses = await Analysis.find({ user: req.user.id, project: project._id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: analyses.length, analyses });
    } catch (error) {
        console.error('Project analyses error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch project analyses' });
    }
}
