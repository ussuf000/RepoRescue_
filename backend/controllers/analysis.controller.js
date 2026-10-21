import { createAnalysis } from "../service/analysis.service.js";
import Analysis from "../model/analysis.model.js";
import Project from "../model/project.model.js";
import mongoose from "mongoose";

const supportedLanguages = new Set([
    "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust", "PHP", "Ruby", "Other"
]);

export async function analyzeErrorController(req, res) {
    try {
        const { errorMessage, codeSnippet = "", language = "", projectId = null } = req.body || {};

        if (
            typeof errorMessage !== "string" ||
            !errorMessage.trim() ||
            errorMessage.trim().length > 30000 ||
            typeof codeSnippet !== "string" ||
            codeSnippet.length > 30000 ||
            typeof language !== "string" ||
            language.length > 50 ||
            (language.trim() && !supportedLanguages.has(language.trim()))
        ) {
            return res.status(400).json({
                success: false,
                message: "Provide an error message (up to 30,000 characters), code snippet (up to 30,000 characters), and language (up to 50 characters)"
            });
        }

        const userId = req.user.id;
        let project = null;
        if (projectId) {
            if (typeof projectId !== "string" || !mongoose.isValidObjectId(projectId)) {
                return res.status(400).json({ success: false, message: "Invalid project ID" });
            }
            const ownedProject = await Project.exists({ _id: projectId, user: userId });
            if (!ownedProject) {
                return res.status(404).json({ success: false, message: "Project not found" });
            }
            project = projectId;
        }

        const analysis = await createAnalysis(
            userId,
            { errorMessage: errorMessage.trim(), codeSnippet: codeSnippet.trim(), language: language.trim(), project }
        );

        return res.status(201).json({
            success: true,
            message: "Error analyzed successfully",
            analysis
        });
    } catch (error) {
        console.error("Analysis error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to analyze error"
        });
    }
}



export async function getAnalysisHistory(req, res) {
    try {
        const userId = req.user.id;

        const filter = { user: userId };
        if (req.query.projectId) {
            if (!mongoose.isValidObjectId(req.query.projectId)) {
                return res.status(400).json({ success: false, message: "Invalid project ID" });
            }
            const ownedProject = await Project.exists({ _id: req.query.projectId, user: userId });
            if (!ownedProject) {
                return res.status(404).json({ success: false, message: "Project not found" });
            }
            filter.project = req.query.projectId;
        }
        const analyses = await Analysis.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: analyses.length,
            analyses
        });
    } catch (error) {
        console.error("History error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch analysis history"
        });
    }
}

export async function getDashboardStats(req, res) {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const now = new Date();
        const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const trendStart = new Date(todayStart);
        trendStart.setUTCDate(trendStart.getUTCDate() - 6);

        const [totalAnalyses, todayAnalyses, errorTypes, recentAnalyses, trendRows] = await Promise.all([
            Analysis.countDocuments({ user: userId }),
            Analysis.countDocuments({ user: userId, createdAt: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 86400000) } }),
            Analysis.aggregate([
                { $match: { user: userId } },
                { $group: { _id: "$errorType", count: { $sum: 1 } } },
                { $sort: { count: -1, _id: 1 } },
                { $limit: 8 }
            ]),
            Analysis.find({ user: userId }).sort({ createdAt: -1 }).limit(6)
                .select("errorMessage errorType rootCause solution createdAt project isBookmarked"),
            Analysis.aggregate([
                { $match: { user: userId, createdAt: { $gte: trendStart, $lt: new Date(todayStart.getTime() + 86400000) } } },
                { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ])
        ]);

        const trendMap = new Map(trendRows.map(row => [row._id, row.count]));
        const dailyTrend = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(trendStart);
            date.setUTCDate(date.getUTCDate() + index);
            const key = date.toISOString().slice(0, 10);
            return { date: key, count: trendMap.get(key) || 0 };
        });

        return res.status(200).json({
            success: true,
            stats: { totalAnalyses, todayAnalyses, errorTypes, recentAnalyses, dailyTrend }
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch dashboard statistics" });
    }
}

export async function listBookmarks(req, res) {
    try {
        const analyses = await Analysis.find({ user: req.user.id, isBookmarked: true }).sort({ updatedAt: -1 });
        return res.status(200).json({ success: true, count: analyses.length, analyses });
    } catch (error) {
        console.error("Bookmark list error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch bookmarks" });
    }
}

async function setBookmark(req, res, isBookmarked) {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid analysis ID" });
        }
        const analysis = await Analysis.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { $set: { isBookmarked } },
            { new: true }
        );
        if (!analysis) return res.status(404).json({ success: false, message: "Analysis not found" });
        return res.status(200).json({ success: true, analysis });
    } catch (error) {
        console.error("Bookmark update error:", error);
        return res.status(500).json({ success: false, message: "Failed to update bookmark" });
    }
}

export async function bookmarkAnalysis(req, res) { return setBookmark(req, res, true); }
export async function unbookmarkAnalysis(req, res) { return setBookmark(req, res, false); }


 export async function getAnalysisById(req,res) {
    try {
        const { id } =req.params;
        const userId= req.user.id;

        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                success:false,
                message:"invalid analysis ID"
            })
        }
        const analysis = await Analysis.findOne({
            _id:id,
            user:userId
        });

        if(!analysis){
            return res.status(404).json({
                success:false,
                message:"analysis not found"
            });
        }
        return res.status(200).json({
            success:true,
            analysis
        })


    } catch (error) {
        console.error('get analysis error',error);

        return res.status(500).json({
            success:false,
            message:"failed to retrive analysis"
        })
    }
    
}

export async function deleteAnalysis(req,res) {

    try {

        const { id } =req.params;
        const userId = req.user.id;

        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                success:false,
                message:"Invalid analysis Id"
            })
        }

        const analysis = await Analysis.findOneAndDelete({
            _id:id,
            user:userId
        });

        if(!analysis){
            return res.status(404).json({
                success:false,
                message:"Analysis not found"
            });
        }

        return res.status(200).json({
            success:true,
            message:"Analysis deleted successfully"
        })
        
    } catch (error) {
        console.error("error",error)

        return res.status(500).json({
            success:false,
            message:"failed to delete analysis"
        })
    }
    
}
