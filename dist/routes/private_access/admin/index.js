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
const funtions_1 = require("../../../helper/funtions");
//@route POST api/admin/user
//@desc  Suspend || unsuspend || Downgrade || Upgrade a user
//@access  Private<Admin>
Router.post('/user', middleware_1.verifyToken, middleware_1.verifyAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, action } = req.body;
    // Actions like SUSPEND UNSUSPEND DOWNGRADE UPGRADE ADMIN are allowed
    if (!userId || !action) {
        return res.json({ message: "Invalid payload supplied, userId and action required.", code: 400 });
    }
    ;
    try {
        let user = yield index_1.UserModel.findById(userId);
        if (user) {
            //Suspend a User
            if (action === 'SUSPEND') {
                user.isSuspended = true;
                yield user.save();
                return res.json({ message: `User with id ${userId} has been suspended successfully.`, code: 200 });
            }
            ;
            //Unsuspend a User
            if (action === 'UNSUSPEND') {
                user.isSuspended = false;
                yield user.save();
                return res.json({ message: `User with id ${userId} has been unsuspended successfully.`, code: 200 });
            }
            ;
            //Upgrade a user to instructor
            if (action === 'UPGRADE') {
                user.isStudent = false;
                user.isInstructor = true;
                yield user.save();
                return res.json({ message: `User with id ${userId} has been upgraded successfully.`, code: 200 });
            }
            ;
            //Downgrade a User
            if (action === 'DOWNGRADE') {
                user.isStudent = true;
                user.isInstructor = false;
                yield user.save();
                return res.json({ message: `User with id ${userId} has been downgraded successfully.`, code: 200 });
            }
            ;
            //Upgrade a user to instructor
            if (action === 'ADMIN') {
                user.isAdmin = true;
                yield user.save();
                return res.json({ message: `User with id ${userId} has been upgraded successfully.`, code: 200 });
            }
            ;
        }
        else {
            return res.json({ message: 'Invalid user, user not found.', code: 400 });
        }
    }
    catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error.', code: 500 });
    }
}));
//@route POST api/admin/createcourse
//@desc  Create Courses
//@access  Private<Admin>
Router.post('/createcourse', middleware_1.verifyToken, middleware_1.verifyAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { course_title, course_description, instructor } = req.body;
    if (!course_description || !course_title || !instructor) {
        return res.json({ message: "Invalid payload suplied, course_title, course_description, instructor<id> required.", code: 400 });
    }
    ;
    try {
        let newCourse = new index_1.CourseModel({
            course_title: course_title.toUpperCase(),
            course_description,
            instructor
        });
        yield newCourse.save();
        return res.json({ message: "Course has been added successfully.", code: 200 });
    }
    catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error.', code: 500 });
    }
}));
//@route POST api/admin/user/all
//@desc  Get all Users
//@access  Private<Admin>
Router.get('/user/all', middleware_1.verifyToken, middleware_1.verifyAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let users = yield index_1.UserModel.find({})
            .populate({
            path: 'registered_courses',
            populate: {
                path: '_id',
                model: 'courses',
                populate: {
                    path: 'instructor',
                    model: 'users'
                },
            }
        });
        let apiData = users.map(user => {
            let includeRegisteredCourses = true;
            return {
                // ...user._doc,
                user: funtions_1.filterOutUserProperties(user, includeRegisteredCourses)
            };
        });
        return res.json({ message: apiData, code: 200 });
        // user
    }
    catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error.', code: 500 });
    }
}));
// UserModel.find({})
// .populate({ 
//     path: 'registered_courses',
//     populate: {
//       path: '_id',
//         model: 'courses',
//         populate: {
//             path: 'instructor',
//             model: 'users'
//           }
//     } 
// })
//     .then((res: any) => console.log(res[0].registered_courses[0]._id.instructor))
exports.default = Router;
