import Analysis from "../model/analysis.model.js";
import analyzeErrorWithAI from '../analyzers/ai.analyzer.js';

export async function createAnalysis(userId, { errorMessage, codeSnippet = '', language = '', project = null }) {
    const result = await analyzeErrorWithAI({ errorMessage, codeSnippet, language });

    const analysis = await Analysis.create({
        user: userId,
        errorMessage,
        codeSnippet,
        language,
        project,
        ...result
    });

    return analysis;
}
