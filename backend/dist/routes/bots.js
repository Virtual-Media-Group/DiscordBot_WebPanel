"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const client_1 = require("@prisma/client");
const bullmq_1 = require("bullmq");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const uuid_1 = require("uuid");
const unzipper = __importStar(require("unzipper"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const upload = (0, multer_1.default)({ dest: 'uploads/tmp' });
const botQueue = new bullmq_1.Queue('bot-deploy', {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: 6379
    }
});
// Middleware to mock auth for MVP. In production, check JWT.
const requireAuth = async (req, res, next) => {
    // For MVP, we pass userId in headers or use a hardcoded one if testing
    req.userId = req.headers['x-user-id'] || 'test-user-id';
    next();
};
router.post('/upload', requireAuth, upload.single('botZip'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No zip file uploaded');
    }
    const userId = req.userId;
    const botId = (0, uuid_1.v4)();
    const extractDir = path_1.default.resolve(`bots/${userId}/${botId}`);
    try {
        await promises_1.default.mkdir(extractDir, { recursive: true });
        // Extract zip
        const zipPath = req.file.path;
        await unzipper.Open.file(zipPath).then(d => d.extract({ path: extractDir, concurrency: 5 }));
        // Create DB record
        const bot = await prisma.bot.create({
            data: {
                id: botId,
                userId: userId, // Assuming user exists or relation handles it
                name: req.body.name || 'Untitled Bot',
                zipPath: zipPath,
                status: 'QUEUED',
            }
        });
        // Enqueue job
        await botQueue.add('deploy', {
            botId,
            extractDir
        });
        res.json(bot);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Upload failed');
    }
});
router.get('/', requireAuth, async (req, res) => {
    const bots = await prisma.bot.findMany({
        where: { userId: req.userId }
    });
    res.json(bots);
});
exports.default = router;
