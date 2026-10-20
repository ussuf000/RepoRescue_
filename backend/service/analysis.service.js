import Analysis from "../model/analysis.model.js";
import analyzeErrorWithAI from '../analyzers/ai.analyzer.js';

export async function createAnalysis(userId, errorMessage) {
    const result = await analyzeErrorWithAI(errorMessage);

    const analysis = await Analysis.create({
        user: userId,
        errorMessage,
        ...result
    });

    return analysis;
}