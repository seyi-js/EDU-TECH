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
                path: 'module_questions',
                model: 'questions',
            }
        });
        let apiData = courses.map(course => {
            return Object.assign(Object.assign({}, course._doc), { instructor: funtions_1.filterOutUserProperties(course.instructor) });
        });
        return res.json({ message: apiData, code: 200 });
    }
    catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error.', code: 500 });
    }
}));
// var a:any = {
//     name: 'sameul',
//     tolu:'tope'
// }
// delete a.name;
// console.log(a)
exports.default = Router;
