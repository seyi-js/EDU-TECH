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
exports.filterOutSomeCourseContentProperties = exports.handleSavingCourseContent = exports.filterOutCourseProperties = exports.filterOutUserProperties = exports.verifyGoogleToken = exports.getUserDataFromFacebook = exports.verifyFacebookAccessToken = exports.triggerLock = exports.sendMail = exports.genHash = exports.generateRefreshToken = exports.generateJwtToken = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const index_1 = require("../models/index");
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const axios_1 = __importDefault(require("axios"));
const google_auth_library_1 = require("google-auth-library");
const generateJwtToken = (data) => {
    const token = jsonwebtoken_1.default.sign({ data }, `${config_1.privateKey}`, { expiresIn: 60 * 60 * 72 }); //Expires in 72hrs 
    return token;
};
exports.generateJwtToken = generateJwtToken;
const generateRefreshToken = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //Invalidate all other tokens
        const token = yield index_1.Token.find({ user_id: data.id });
        token.map(t => {
            t.isValid = false;
            t.save();
        });
        let key;
        const password = crypto_1.default.randomBytes(16).toString('hex');
        const salt = crypto_1.default.randomBytes(32).toString('hex');
        key = yield crypto_1.default.pbkdf2Sync(password, salt, 10000, 128, 'sha256');
        if (key) {
            const newToken = new index_1.Token({
                user_id: data.id,
                token: key.toString('base64'),
                auth_type: data.auth_type
            });
            const user = yield newToken.save();
            return key;
        }
    }
    catch (err) {
        console.log(err);
        throw err;
    }
});
exports.generateRefreshToken = generateRefreshToken;
//@desc Gen Hash
const genHash = (data) => {
    let hash;
    var salt = bcryptjs_1.default.genSaltSync(10);
    hash = bcryptjs_1.default.hashSync(data, salt);
    return hash;
};
exports.genHash = genHash;
//@desc Send Mails
const sendMail = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const input = require('../Templates/resetpassword').template
        const Transporter = nodemailer_1.default.createTransport({
            service: "box.creditsync.com.ng",
            host: "box.creditsync.com.ng",
            port: 587,
            secure: false,
            auth: {
                user: 'support@creditsync.com.ng',
                pass: config_1.email_password
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        var mailOptions = {
            from: '"CreditSync Team" <support@creditsync.com.ng>',
            to: data.to,
            subject: data.subject,
            html: data.input,
        };
        const mail = yield Transporter.sendMail(mailOptions);
        return mail;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
});
exports.sendMail = sendMail;
//@desc lockAccount
const triggerLock = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield index_1.UserModel.findOne({ _id: id });
        if (parseInt(user.login_failed_attempt_count) < 7) {
            user.login_failed_attempt_count = parseInt(user.login_failed_attempt_count) + 1;
            user.save();
        }
        else if (parseInt(user.login_failed_attempt_count) === 7) {
            user.isLocked = true;
            user.save();
        }
    }
    catch (err) {
        console.log(err);
        throw err;
    }
});
exports.triggerLock = triggerLock;
const verifyFacebookAccessToken = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield axios_1.default.get(`https://z-m-graph.facebook.com/v10.0/me?access_token=${data.token}&method=get&pretty=0&sdk=joey&suppress_http_code=1`);
        return response.data;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
});
exports.verifyFacebookAccessToken = verifyFacebookAccessToken;
const getUserDataFromFacebook = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield axios_1.default.get(`https://z-m-graph.facebook.com/v10.0/${data.userId}?fields=first_name,last_name,email&access_token=${data.token}`);
        return response.data;
        // console.log(response.data)
    }
    catch (err) {
        console.log(err);
        throw err;
    }
});
exports.getUserDataFromFacebook = getUserDataFromFacebook;
;
const verifyGoogleToken = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new google_auth_library_1.OAuth2Client(config_1.GOOGLE_CLIENT_ID);
    function verify() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ticket = yield client.verifyIdToken({
                    idToken: data.token,
                    audience: config_1.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
                    // Or, if multiple clients access the backend:
                    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
                });
                const payload = ticket.getPayload();
                const userid = payload['sub'];
                return payload;
                // If request specified a G Suite domain:
                // const domain = payload['hd'];
            }
            catch (err) {
                throw err;
            }
        });
    }
    try {
        let response = yield verify();
        return response;
    }
    catch (err) {
        throw err;
    }
});
exports.verifyGoogleToken = verifyGoogleToken;
const filterOutUserProperties = (user, includeRegisteredCourses) => {
    let data = {
        isStudent: user.isStudent,
        isInstructor: user.isInstructor,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        isLocked: user.isLocked,
        isSuspended: user.isSuspended,
        time_of_creation: user.time_of_creation,
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
    };
    //If Registered Courses should be included in the user object
    if (includeRegisteredCourses) {
        let course = exports.filterOutCourseProperties(user.registered_courses);
        data.registered_courses = course;
    }
    ;
    return data;
};
exports.filterOutUserProperties = filterOutUserProperties;
const filterOutCourseProperties = (courses, includeCourseContent) => {
    let course = courses.map(course => {
        let data = {
            status: course.status,
            grade: course.grade,
            course: {
                time_of_creation: course._id.time_of_creation,
                _id: course._id._id,
                course_title: course._id.course_title,
                course_description: course._id.course_description,
                instructor: exports.filterOutUserProperties(course._id.instructor)
            }
        };
        if (includeCourseContent) {
            data.course.course_content = course._id.course_content;
        }
        // course["course_content"]:null
        return data;
    });
    return course;
};
exports.filterOutCourseProperties = filterOutCourseProperties;
const handleSavingCourseContent = (data) => __awaiter(void 0, void 0, void 0, function* () {
    let { course_id, module_number, content_type, title, actual_content, section_number, image, video, file } = data;
    try {
        let course = yield index_1.CourseModel.findById(course_id);
        if (!course) {
            return { message: "Invalid course id supplied or the course has been deleted.", code: 400 };
        }
        ;
        // console.log(course)
        //Check if section number already exist
        let section = course.course_content.sections.find(n => n.section_number === Number(section_number));
        if (section) {
            //Go Further into the modules section
            // console.log(section.modules)
            let module = section.modules.find(n => n.module_number === Number(module_number));
            //Check if module number already exist
            if (module) {
                return { message: "Module already exist, choose a different number.", code: 400 };
            }
            else {
                let newModule = {
                    module_id: crypto_1.default.pseudoRandomBytes(10).toString('hex'),
                    module_number: Number(module_number),
                    content_type,
                    title,
                    actual_content,
                    image,
                    file,
                    video
                };
                //  console.log(newModule)
                //Update number of modules
                section.number_of_modules = section.modules.length + 1;
                //Update Modules
                section.modules.push(newModule);
                yield course.save();
                return { message: `Module number ${module_number} has been added to section number ${section_number} successfully.`, code: 200 };
            }
            ;
        }
        else {
            //Create a new section
            let newSection = {
                section_id: crypto_1.default.pseudoRandomBytes(10).toString('hex'),
                section_number: Number(section_number),
                number_of_modules: '1',
                modules: [
                    {
                        module_id: crypto_1.default.pseudoRandomBytes(10).toString('hex'),
                        module_number: Number(module_number),
                        content_type,
                        title,
                        actual_content,
                        image,
                        file,
                        video
                    }
                ]
            };
            //Update number of modules
            course.number_of_sections = course.course_content.sections.length + 1;
            //Update Modules
            course.course_content.sections.push(newSection);
            yield course.save();
            return { message: 'New section created successfully.', code: 200 };
        }
        ;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
});
exports.handleSavingCourseContent = handleSavingCourseContent;
const filterOutSomeCourseContentProperties = (content) => {
    content.sections.forEach(section => {
        section.section_questions.map(question => {
            question.answer = null;
        });
    });
};
exports.filterOutSomeCourseContentProperties = filterOutSomeCourseContentProperties;
