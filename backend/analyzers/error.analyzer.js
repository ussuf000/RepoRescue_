function analyzeError(errorMessage) {
    const error = errorMessage.toLowerCase();

    // 1. Express is not defined
    if (
        error.includes("express is not defined") ||
        error.includes("referenceerror")
    ) {
        return {
            errorType: "REFERENCE_ERROR",
            rootCause: "A variable is being used without being defined or imported.",
            solution: "If you are using Express, add import express from 'express'; at the beginning of your file."
        };
    }

    // 2. Module not found
    if (error.includes("cannot find module")) {
        return {
            errorType: "MODULE_NOT_FOUND",
            rootCause: "A required module could not be found.",
            solution: "Check the import path and install the missing package."
        };
    }

    // 3. Connection error
    if (
        error.includes("econnrefused") ||
        error.includes("connection refused")
    ) {
        return {
            errorType: "CONNECTION_ERROR",
            rootCause: "The connection to the target service was refused.",
            solution: "Check whether the service is running and verify the host and port."
        };
    }

    // 4. Unknown error
    return {
        errorType: "UNKNOWN_ERROR",
        rootCause: "The exact cause could not be identified.",
        solution: "Review the complete error message and stack trace."
    };
}

export default analyzeError;