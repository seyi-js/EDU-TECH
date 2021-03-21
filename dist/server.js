"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
// const mongoose = require('mongoose')
// import helmet from 'helmet';
const helmet_1 = __importDefault(require("helmet"));
const auth_1 = __importDefault(require("./routes/public_access/auth"));
const index_1 = __importDefault(require("./routes/private_access/admin/index"));
const index_2 = __importDefault(require("./routes/private_access/student/index"));
const index_3 = __importDefault(require("./routes/private_access/instructor/index"));
const courses_1 = __importDefault(require("./routes/public_access/courses"));
const dbConnection = require('./dbConnection');
const app = express_1.default();
const PORT = process.env.PORT || 8080;
app.use(helmet_1.default({
    contentSecurityPolicy: false,
}));
app.use(helmet_1.default.referrerPolicy({
    policy: ["origin", "unsafe-url"],
}));
//Body Parser
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/admin', index_1.default);
app.use('/api/course', courses_1.default);
app.use('/api/student', index_2.default);
app.use('/api/instructor', index_3.default);
app.use(express_1.default.static('html'));
app.get('/', (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, 'html', 'index.html'));
});
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
