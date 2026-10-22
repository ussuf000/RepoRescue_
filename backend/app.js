import dotenv from 'dotenv';
import express from 'express'
import route from './routers/auth.route.js';
import cookieParse from 'cookie-parser'
import analysisRoute from './routers/analysis.route.js'
import projectRoute from './routers/project.route.js'

dotenv.config();
const app =express();

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'RepoRescue backend is running'
    });
});

app.use(express.json());
app.use(cookieParse())

app.use('/',route);
app.use('/',analysisRoute);
app.use('/api/projects',projectRoute);

export default app;
