"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.gfs = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const gridfs_stream_1 = __importDefault(require("gridfs-stream"));
const path = require('path');
const multer_gridfs_storage_1 = __importDefault(require("multer-gridfs-storage"));
const multer_1 = __importDefault(require("multer"));
const crypto_1 = __importDefault(require("crypto"));
mongoose_1.default.set('useCreateIndex', true);
let db;
//Switch Between DB's in Prod
(process.env.NODE_ENV !== 'production') ? db = 'mongodb://localhost:27017/edutech' : db = require('./config').mongo_url;
//Connect To Database
const connectToDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //GridFs connection
        let connection = yield mongoose_1.default.connect(db, { useUnifiedTopology: true, useNewUrlParser: true });
        gridfs_stream_1.default.mongo = mongoose_1.default.mongo;
        console.log('Connected to Edutech Database');
        exports.gfs = gridfs_stream_1.default(connection.connection.db);
        exports.gfs.collection('uploads');
    }
    catch (err) {
        console.log(`Database Connection Error: ${err}`);
    }
});
connectToDatabase();
//Multer Upload
const storage = new multer_gridfs_storage_1.default({
    url: db,
    file: (req, file) => {
        // console.log(req)
        return new Promise((resolve, reject) => {
            crypto_1.default.randomBytes(16, (err, buff) => {
                if (err) {
                    console.log(err);
                }
                const filename = buff.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
exports.upload = multer_1.default({ storage });
