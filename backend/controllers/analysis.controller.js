import { createAnalysis } from "../service/analysis.service.js";
import Analysis from "../model/analysis.model.js";
import mongoose from "mongoose";

export async function analyzeErrorController(req, res) {
    try {
        const { errorMessage } = req.body;

        if (
            typeof errorMessage !== "string" ||
            !errorMessage.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid error message"
            });
        }

        const userId = req.user.id;

        const analysis = await createAnalysis(
            userId,
            errorMessage.trim()
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

        const analyses = await Analysis.find({
            user: userId
        }).sort({ createdAt: -1 });

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