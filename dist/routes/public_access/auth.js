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
const crypto_1 = __importDefault(require("crypto"));
const sendmail_1 = require("../../helper/sendmail");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../../config");
//@route POST api/auth/register
//@desc  Register Users
//@access  Public
Router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, first_name, last_name, password, redirection_url } = req.body;
    if (!email || !first_name || !last_name || !password || !redirection_url) {
        return res.json({ message: 'Please enter all fields, email, first_name, last_name, password, redirection_url.', code: 400 });
    }
    ;
    const passwordlength = password.match(/[A-Z0-9a-z]{8,}/g);
    const checkEmail = email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    if (!passwordlength) {
        return res.json({ message: 'Password too short.', code: 400 });
    }
    ;
    if (!checkEmail) {
        return res.json({ message: 'Invalid email', code: 400 });
    }
    ;
    try {
        let user = yield index_1.UserModel.findOne({ email: email.toLocaleLowerCase() });
        if (user) {
            return res.json({ message: 'Choose a different email', code: 400 });
        }
        else {
            let passwordHash = funtions_1.genHash(password);
            const newUser = new index_1.UserModel({
                email: email.toLowerCase(),
                first_name,
                last_name,
                password: passwordHash,
                signup_type: 'normal_signup'
            });
            let user = yield newUser.save();
            const token = crypto_1.default.randomBytes(60).toString('hex');
            user.verification_token = token;
            user.verification_token_expires = Date.now() + 60 * 60 * 1000 * 24; // 24 Hours
            // user.signup_type= 'normal_signup'
            yield user.save();
            const link = `${redirection_url}/${token}`;
            let data = {
                to: user.email,
                link,
                subject: 'Verify Email',
                token
            };
            yield sendmail_1.sendSignUpEmail(data);
            return res.json({ message: 'Email sent', code: 200 });
            console.log(data);
        }
    }
    catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error.', code: 500 });
    }
}));
//@route POST api/auth/login
//@desc  Login Users
//@access  Public
Router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.json({ message: 'Please enter all fields.', code: 400 });
    }
    ;
    try {
        let user = yield index_1.UserModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.json({ message: 'Invalid credentials.', code: 400 });
        }
        if (user.isLocked) {
            return res.json({ message: 'Your account has been restricted due to multiple password trials,please reset your password.', code: 423 });
        }
        if (user.isSuspended) {
            return res.json({ message: 'Your account has been suspended please contact IT support for enquiries.', code: 423 });
        }
        else {
            let isMatch = bcryptjs_1.default.compareSync(password, user.password);
            if (!isMatch) {
                funtions_1.triggerLock(user._id);
                return res.json({ message: 'Invalid credentials', code: 400 });
            }
            if (!user.isVerified) {
                return res.json({ message: 'Your account is yet to be activated please check your email.', code: 423 });
            }
            else {
                //Generate Tokens
                let data = {
                    auth_type: 'normal_login',
                    id: user._id
                };
                const JWTtoken = funtions_1.generateJwtToken(data);
                const RToken = yield funtions_1.generateRefreshToken(data);
                //Set Last Login
                user.last_login = Date.now();
                user.login_failed_attempt_count = 0;
                user.resetPasswordToken = null,
                    user.resetPasswordExpires = null;
                yield user.save();
                return res.json({ JWTtoken, refresh_token: RToken.toString('base64'), code: 200 });
            }
        }
        ;
    }
    catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error.', code: 500 });
    }
}));
//@route POST api/auth/facebook
//@desc  Register or Login Users using social media(Facebook)
//@access  Public
Router.post('/facebook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Facebook Auth Token
    let { facebookAccessToken, facebookUserId } = req.body;
    if (!facebookAccessToken || !facebookUserId) {
        res.json({ message: 'Invalid payload, facebookAccesstoken and facebookUserId required.', code: 400 });
    }
    ;
    // console.log(req.body)
    if (process.env.NODE_ENV !== 'production') {
        facebookAccessToken = config_1.MY_FACEBOOK_ACCESS_TOKEN;
        facebookUserId = config_1.MY_FACEBOOK_USERID;
    }
    //Verify Facebook Access Token
    let data = {
        token: facebookAccessToken,
    };
    try {
        let response = yield funtions_1.verifyFacebookAccessToken(data);
        // console.log(response)
        //If theres an error
        //response.error.code 190 ==== Expired accessToken or Invalid token
        if (response.error) {
            return res.json({ message: 'Invalid facebookAccessToken.', code: 400 });
        }
        ;
        if (response.id && response.id === facebookUserId) {
            //A valid User
            //Check if user exist in the DB if so, send a login response
            let user = yield index_1.UserModel.findOne({ 'facebook_data.userId': facebookUserId });
            // console.log('User',user)
            if (user) {
                //User Exist =>   => Login
                if (user.isSuspended) {
                    return res.json({ message: 'Your account has been suspended please contact IT support for enquiries.', code: 423 });
                }
                else {
                    user.facebook_data.access_token = facebookAccessToken;
                    //Generate Tokens
                    let data2 = {
                        auth_type: 'facebook_login',
                        id: user._id
                    };
                    const JWTtoken = funtions_1.generateJwtToken(data2);
                    const RToken = yield funtions_1.generateRefreshToken(data2);
                    //Set Last Login
                    user.last_login = Date.now();
                    yield user.save();
                    return res.json({ JWTtoken, refresh_token: RToken.toString('base64'), code: 200 });
                }
            }
            else {
                //Register User => Login
                //Get User Data From Facebook
                let data = {
                    token: facebookAccessToken,
                    userId: facebookUserId
                };
                let userData = yield funtions_1.getUserDataFromFacebook(data);
                // console.log('UserData', userData);
                const newUser = new index_1.UserModel({
                    email: userData.email,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    password: null,
                    signup_type: 'facebook_signup'
                });
                let user = yield newUser.save();
                // user.signup_type = 'facebook_signup';
                user.facebook_data.access_token = facebookAccessToken;
                user.facebook_data.userId = facebookUserId;
                user.isVerified = true;
                //Generate Tokens
                let data2 = {
                    auth_type: 'facebook_login',
                    id: user._id
                };
                const JWTtoken = funtions_1.generateJwtToken(data2);
                const RToken = yield funtions_1.generateRefreshToken(data2);
                //Set Last Login
                user.last_login = Date.now();
                yield user.save();
                return res.json({ JWTtoken, refresh_token: RToken.toString('base64'), code: 200 });
            }
        }
        else {
            //Invalid User
            return res.json({ message: 'Unauthorised user.', code: 401 });
        }
    }
    catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error.', code: 500 });
    }
}));
//@route POST api/auth/google
//@desc  Register or Login Users using social media(Google)
//@access  Public
Router.post('/google', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id_token, googleUserId } = req.body;
    if (!id_token || !googleUserId) {
        res.json({ message: 'Invalid payload, id_token,googleUserId  required.', code: 400 });
    }
    ;
    // console.log(req.body)
    if (process.env.NODE_ENV !== 'production') {
        id_token = config_1.GOOGLE_TOKEN;
        googleUserId = config_1.GOOGLE_USER_ID;
    }
    ;
    try {
        //Verify Token
        let data = {
            token: config_1.GOOGLE_TOKEN
        };
        let response = yield funtions_1.verifyGoogleToken(data);
        // console.log(response)
        if (response && response.aud === config_1.GOOGLE_CLIENT_ID && response.sub === googleUserId && response.email_verified) {
            //Valid User
            //Check if user exist in DB => Login 
            //else Register => login
            let user = yield index_1.UserModel.findOne({ 'google_data.userId': googleUserId });
            if (user) {
                if (user.isSuspended) {
                    return res.json({ message: 'Your account has been suspended please contact IT support for enquiries.', code: 423 });
                }
                else {
                    user.google_data.id_token = id_token;
                    //Generate Tokens
                    let data2 = {
                        auth_type: 'google_login',
                        id: user._id
                    };
                    const JWTtoken = funtions_1.generateJwtToken(data2);
                    const RToken = yield funtions_1.generateRefreshToken(data2);
                    //Set Last Login
                    user.last_login = Date.now();
                    yield user.save();
                    return res.json({ JWTtoken, refresh_token: RToken.toString('base64'), code: 200 });
                }
            }
            else {
                let data = {
                    token: config_1.GOOGLE_TOKEN
                };
                let userData = yield funtions_1.verifyGoogleToken(data);
                // console.log('UserData', userData);
                const newUser = new index_1.UserModel({
                    email: userData.email,
                    first_name: userData.given_name,
                    last_name: userData.family_name,
                    password: null,
                    signup_type: 'google_signup'
                });
                let user = yield newUser.save();
                // user.signup_type = 'facebook_signup';
                user.google_data.id_token = id_token;
                user.google_data.userId = googleUserId;
                user.isVerified = true;
                //Generate Tokens
                let data2 = {
                    auth_type: 'google_login',
                    id: user._id
                };
                const JWTtoken = funtions_1.generateJwtToken(data2);
                const RToken = yield funtions_1.generateRefreshToken(data2);
                //Set Last Login
                user.last_login = Date.now();
                yield user.save();
                return res.json({ JWTtoken, refresh_token: RToken.toString('base64'), code: 200 });
            }
        }
        else {
            //Invalid User
            return res.json({ message: 'Unauthorised user.', code: 401 });
        }
    }
    catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error.', code: 500 });
    }
}));
exports.default = Router;
