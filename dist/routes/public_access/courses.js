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
const express_1 = __importDefault(require("express"));
const Router = express_1.default.Router();
const index_1 = require("../../models/index");
const funtions_1 = require("../../helper/funtions");
const dbConnection_1 = require("../../dbConnection");
// const {upload,} = require('../../dbConnection');
//@route GET api/course/all
//@desc  get all Courses
//@access  Public
Router.get('/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var courses = yield index_1.CourseModel.find({})
            .populate('instructor')
            .populate({
            path: 'course_content',
            populate: {
                path: 'sections',
                populate: {
                    path: 'section_questions',
                    model: 'questions',
                    // populate: {
                    //     path: 'course_id',
                    //     model: 'couses',
                    // }
                },
            }
        });
        let apiData = courses.map(course => {
            funtions_1.filterOutSomeCourseContentProperties(course.course_content);
            return Object.assign(Object.assign({}, course._doc), { instructor: funtions_1.filterOutUserProperties(course.instructor) });
        });
        return res.json({ message: apiData, code: 200 });
    }
    catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error.', code: 500 });
    }
}));
//@route GET api/course/media/:filename
//@desc  get media files
//@access  Public
Router.get('/media/:filename', (req, res) => {
    let { filename } = req.params;
    if (!filename) {
        res.json({ message: 'Invalid Request. filename required as params', code: 400 });
    }
    var readStream = dbConnection_1.gfs.createReadStream(filename);
    //Write to filesystem
    readStream.pipe(res);
    readStream.on('close', () => {
        // console.log( 'done' )
    });
    readStream.on('error', (err) => {
        res.json({ message: 'File does not exist.', code: 400 });
    });
});
exports.default = Router;
