"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const bots_1 = __importDefault(require("./routes/bots"));
const admin_1 = __importDefault(require("./routes/admin"));
const updates_1 = __importDefault(require("./routes/updates"));
const worker_1 = require("./jobs/worker");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/bots', bots_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/updates', updates_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Initialize the deployment worker
(0, worker_1.initWorker)();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
