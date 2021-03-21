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
exports.verifyIfInstructorIsAlignWithCourse = exports.verifyAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const index_1 = require("../models/index");
const verifyToken = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.json({ message: 'No token, authorization denied', code: 401 });
    }
    else {
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, config_1.privateKey);
                req.user = decoded.data;
                // decoded;
                // console.log( decoded )
                next();
            }
            catch (e) {
                // req.JWTerrorMessage = e.message;
                console.log(e);
                return res.json({ message: 'Invalid Token', code: 403 });
            }
        }
    }
};
exports.verifyToken = verifyToken;
//@desc verfiyAdmin
const verifyAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield index_1.UserModel.findById(req.user.id);
        // console.log(req.user)
        if (user.isAdmin) {
            next();
        }
        else {
            return res.json({ message: 'You are not authorized to access this endpoint.', code: 401 });
        }
        ;
    }
    catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error', code: 500 });
    }
    ;
});
exports.verifyAdmin = verifyAdmin;
const verifyIfInstructorIsAlignWithCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { course_id } = req.body;
    // console.log(req)
    if (!course_id) {
        return res.json({ message: "Invalid payload suplied, course_id required.", code: 400 });
    }
    ;
    try {
        let user = yield index_1.UserModel.findById(req.user.id);
        let course = yield index_1.CourseModel.findById(course_id).populate('instructor');
        // console.log(user.isInstructor , course,req.user.id == course.instructor._id)
        if (user.isInstructor && course && req.user.id == course.instructor._id) {
            next(); //An Instructor for this course
        }
        else {
            return res.json({ message: 'You are not authorized to access this endpoint.', code: 401 });
        }
    }
    catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error', code: 500 });
    }
});
exports.verifyIfInstructorIsAlignWithCourse = verifyIfInstructorIsAlignWithCourse;
