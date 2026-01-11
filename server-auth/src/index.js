import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initDatabase } from './utils/database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import client from 'prom-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database connection
await initDatabase();

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    }
}));
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Metrics endpoint
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});

// API Routes (before static files)
app.use('/api/auth', authRoutes);

// Web Interface Routes (before static files to override them)
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    const loginHtml = fs.readFileSync(path.join(__dirname, 'public', 'login.html'), 'utf8');
    const frontendUrl = process.env.FRONTEND_URL;
    const injectedHtml = loginHtml.replace(/FRONTEND_URL_PLACEHOLDER/g, frontendUrl);
    res.send(injectedHtml);
});

app.get('/register', (req, res) => {
    const registerHtml = fs.readFileSync(path.join(__dirname, 'public', 'register.html'), 'utf8');
    const frontendUrl = process.env.FRONTEND_URL;
    const injectedHtml = registerHtml.replace(/FRONTEND_URL_PLACEHOLDER/g, frontendUrl);
    res.send(injectedHtml);
});

app.get('/request-reset', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'request-reset.html'));
});

app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

// Static files for web interface (after custom routes)
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`MeetX Auth Server running on http://localhost:${PORT}`);
    console.log(`Login: http://localhost:${PORT}/login`);
    console.log(`Register: http://localhost:${PORT}/register`);
});
