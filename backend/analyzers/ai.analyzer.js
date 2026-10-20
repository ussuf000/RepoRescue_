import { Ollama } from "ollama";
import "dotenv/config";

const ollama = new Ollama({
    host: "https://ollama.com",
    headers: {
        Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`
    }
});

async function analyzeErrorWithAI(errorMessage) {
    const response = await ollama.chat({
       model: "gemma4:31b-cloud",
        messages: [
            {
                role: "system",
              content: `
    You are RepoRescue, a software debugging assistant.

    Analyze the submitted software error.

    Return a valid JSON object with exactly these fields:
    errorType, rootCause, and solution.

    Do not include Markdown code fences.
    Do not include explanations outside the JSON object.

    If information is insufficient, state the uncertainty.
`
            },
            {
                role: "user",
                content: errorMessage
            }
        ],
        format: "json",
        stream: false
    });
            console.log("Raw Ollama response:", response.message.content);


    const content = response.message.content;

const cleanedContent = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "")
    .trim();

return JSON.parse(cleanedContent);
}

export default analyzeErrorWithAI;