import dotenv from 'dotenv';
import express from 'express'
import route from './routers/auth.route.js';
import cookieParse from 'cookie-parser'
import analysisRoute from './routers/analysis.route.js'
import projectRoute from './routers/project.route.js'

dotenv.config();
const app =express();

const allowedOrigins = new Set([
    'https://ussuf000.github.io',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
]);

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.has(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.vary('Origin');
        if (req.method === 'OPTIONS') return res.sendStatus(204);
    }
    next();
});

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'RepoRescue backend is running'
    });
});


app.use(cookieParse())

app.use('/',route);
app.use('/',analysisRoute);
app.use('/api/projects',projectRoute);

export default app;
