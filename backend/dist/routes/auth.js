"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// In a real app, use jsonwebtoken
function generateToken(userId) {
    return crypto_1.default.createHash('sha256').update(userId + process.env.JWT_SECRET).digest('hex');
}
router.get('/discord', (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.DISCORD_CALLBACK_URL || '');
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email`;
    res.redirect(url);
});
router.get('/discord/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('No code provided');
    }
    try {
        const data = new URLSearchParams();
        data.append('client_id', process.env.DISCORD_CLIENT_ID);
        data.append('client_secret', process.env.DISCORD_CLIENT_SECRET);
        data.append('grant_type', 'authorization_code');
        data.append('code', code);
        data.append('redirect_uri', process.env.DISCORD_CALLBACK_URL);
        // Get token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: data,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            throw new Error('Failed to get access token');
        }
        // Get user info
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${tokenData.token_type} ${tokenData.access_token}`,
            },
        });
        const userData = await userResponse.json();
        // Check if superadmin
        let role = 'USER';
        if (userData.id === process.env.SUPERADMIN_DISCORD_ID) {
            role = 'ADMIN';
        }
        // Upsert user
        const user = await prisma.user.upsert({
            where: { discordId: userData.id },
            update: {
                email: userData.email,
                role: role,
            },
            create: {
                discordId: userData.id,
                email: userData.email,
                role: role,
            },
        });
        const jwtToken = generateToken(user.id);
        // Redirect back to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/?token=${jwtToken}`);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Authentication failed');
    }
});
exports.default = router;
