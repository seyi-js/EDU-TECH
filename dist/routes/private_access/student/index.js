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
const middleware_1 = require("../../../helper/middleware");
const index_1 = require("../../../models/index");
Router.post('/register_course', middleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { course_id } = req.body;
    if (!course_id) {
        return res.json({ message: 'Invalid payload suplied, course_id<id> required.', code: 400 });
    }
    ;
    try {
        let user = yield index_1.UserModel.findById(req.user.id);
        let course = yield index_1.CourseModel.findById(course_id);
        if (!course) {
            return res.json({ message: 'Invalid payload suplied, course_id<id> required.', code: 400 });
        }
        else {
            user.registered_courses.push(course._id);
            yield user.save();
            return res.json({ message: "Registration successful.", code: 200 });
        }
    }
    catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error.', code: 500 });
    }
}));
exports.default = Router;
