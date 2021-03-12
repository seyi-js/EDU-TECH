import express, { Application, Request, Response, NextFunction } from 'express';
const Router:any = express.Router();
import {UserModel} from '../../models/index'
import {genHash,generateJwtToken,generateRefreshToken,triggerLock,verifyFacebookAccessToken,getUserDataFromFacebook,verifyGoogleToken} from '../../helper/funtions'
import Crypto, { BinaryLike } from 'crypto'
import {sendSignUpEmail} from '../../helper/sendmail'
import bcrypt from 'bcryptjs'
import {MY_FACEBOOK_ACCESS_TOKEN,MY_FACEBOOK_USERID,GOOGLE_TOKEN,GOOGLE_CLIENT_ID,GOOGLE_USER_ID} from '../../config'


//@route POST api/auth/register
//@desc  Register Users
//@access  Public
Router.post('/register', async (req: Request, res: Response):Promise<any> => {
    const { email, first_name, last_name, password, redirection_url }: any = req.body;
    if (!email || !first_name || !last_name || !password || !redirection_url) {
        return res.json({message:'Please enter all fields, email, first_name, last_name, password, redirection_url.', code:400}  )
    };
    const passwordlength:Boolean = password.match( /[A-Z0-9a-z]{8,}/g )
    const checkEmail: Boolean = email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    
    
    if ( !passwordlength ) {
        
        return res.json({message:'Password too short.', code:400}  )
    };
    if ( !checkEmail ) {
        
        return res.json({message:'Invalid email', code:400}  )
    };

    try {
        let user = await UserModel.findOne({ email: email.toLocaleLowerCase() });

        if (user) {
            return res.json({ message: 'Choose a different email', code: 400 });
        } else {
            let passwordHash: string = genHash(password);
            const newUser = new UserModel({
                email: email.toLowerCase(),
                first_name,
                last_name,
                password: passwordHash,
                signup_type:'normal_signup'
            });

            let user:any = await newUser.save();

            const token = Crypto.randomBytes(60).toString('hex');
            user.verification_token = token;
            
            user.verification_token_expires = Date.now() + 60 * 60 * 1000 * 24// 24 Hours
            // user.signup_type= 'normal_signup'
            await user.save();
            const link = `${redirection_url}/${ token }`
            let data = {
                to: user.email,
                link,
                subject: 'Verify Email',
                token
               
            };
            await sendSignUpEmail( data )
            return res.json({message:'Email sent',code:200})
            console.log(data);

        }
    } catch (err) {
        
        console.log(err)
        return res.json({message:'Internal server error.', code:500})
    }
});


//@route POST api/auth/login
//@desc  Login Users
//@access  Public
Router.post('/login', async (req: Request, res: Response):Promise<any> => {
    const { email, password } = req.body;

    if ( !email || !password ) {
        
        res.json({message:'Please enter all fields.', code:400}  )
    };

    try {
        let user:any = await UserModel.findOne({ email: email.toLowerCase() });
        if (!user) {
           return res.json({message:'Invalid credentials.', code:400}  )
        }
        if ( user.isLocked ) {
            return  res.json({message:'Your account has been restricted due to multiple password trials,please reset your password.', code:423}  )
        }

        if (user.isSuspended) {
            return  res.json({message:'Your account has been suspended please contact IT support for enquiries.', code:423}  )
        } 
        else {
            let isMatch = bcrypt.compareSync(password, user.password);
            if ( !isMatch ) {
                
                triggerLock(user._id);
               return res.json({message:'Invalid credentials', code:400}  )
            }


            if ( !user.isVerified ) {
                return  res.json({message:'Your account is yet to be activated please check your email.', code:423}  )
                
            }else {
                //Generate Tokens
                let data = {
                    auth_type: 'normal_login',
                    id:user._id
                }
                const JWTtoken = generateJwtToken(data);
                const RToken:any = await generateRefreshToken(data);

                //Set Last Login
                user.last_login = Date.now();
                user.login_failed_attempt_count = 0;
                user.resetPasswordToken= null,
                user.resetPasswordExpires= null
                await user.save();
                return res.json( {JWTtoken,refresh_token:RToken.toString( 'base64' ),code:200} )
            }
        };
    } catch (err) {
        console.log(err)
        return res.json({message:'Internal server error.', code:500})
        
    }
});


//@route POST api/auth/facebook
//@desc  Register or Login Users using social media(Facebook)
//@access  Public

Router.post('/facebook', async (req: Request, res: Response) => {
    //Facebook Auth Token
    let { facebookAccessToken, facebookUserId } = req.body;

    if ( !facebookAccessToken || !facebookUserId  ) {
        
        res.json({message:'Invalid payload, facebookAccesstoken and facebookUserId required.', code:400}  )
    };


    // console.log(req.body)

    if (process.env.NODE_ENV !== 'production') {
        facebookAccessToken =MY_FACEBOOK_ACCESS_TOKEN
        facebookUserId=MY_FACEBOOK_USERID
    }
    //Verify Facebook Access Token
    let data = {
        token: facebookAccessToken,
    }
    try {
        let response = await verifyFacebookAccessToken(data);
        
        // console.log(response)
        //If theres an error
          //response.error.code 190 ==== Expired accessToken or Invalid token
        if (response.error) {
            
            
            return res.json({ message: 'Invalid facebookAccessToken.', code: 400 });
        };

        if (response.id && response.id === facebookUserId ) {
            //A valid User
            //Check if user exist in the DB if so, send a login response

            let user:any = await UserModel.findOne({ 'facebook_data.userId': facebookUserId });
            // console.log('User',user)
            if (user) {
                //User Exist =>   => Login
                if (user.isSuspended) {
                    return  res.json({message:'Your account has been suspended please contact IT support for enquiries.', code:423}  )
                } else {
                    user.facebook_data.access_token = facebookAccessToken;

                 //Generate Tokens
                 let data2 = {
                    auth_type: 'facebook_login',
                    id:user._id
                }
                const JWTtoken = generateJwtToken(data2);
                const RToken:any = await generateRefreshToken(data2);

                //Set Last Login
                user.last_login = Date.now();
                await user.save();
                return res.json( {JWTtoken,refresh_token:RToken.toString( 'base64' ),code:200} )
                }

                
            } else {


                //Register User => Login
                 //Get User Data From Facebook
                 let data = {
                     token: facebookAccessToken,
                     userId:facebookUserId
                }
                let userData = await getUserDataFromFacebook(data);
                // console.log('UserData', userData);


                const newUser = new UserModel({
                    email: userData.email,
                    first_name:userData.first_name,
                    last_name:userData.last_name,
                    password: null,
                    signup_type:'facebook_signup'
                });
    
                let user: any = await newUser.save();
                // user.signup_type = 'facebook_signup';
                user.facebook_data.access_token = facebookAccessToken;
                user.facebook_data.userId = facebookUserId;
                user.isVerified= true
                


                //Generate Tokens
                let data2 = {
                    auth_type: 'facebook_login',
                    id:user._id
                }
                const JWTtoken = generateJwtToken(data2);
                const RToken:any = await generateRefreshToken(data2);

                //Set Last Login
                user.last_login = Date.now();
                await user.save();
                return res.json( {JWTtoken,refresh_token:RToken.toString( 'base64' ),code:200} )
            }

        } else {
            //Invalid User
            return res.json({ message: 'Unauthorised user.', code: 401 });
        }

        
        
    } catch (err) {
        console.log(err)
        return res.json({ message: 'Internal server error.', code: 500 });
    }
});

//@route POST api/auth/google
//@desc  Register or Login Users using social media(Google)
//@access  Public
Router.post('/google', async (req: Request, res: Response) => {
    let { id_token,googleUserId } = req.body;
    if ( !id_token || !googleUserId   ) {
        
        res.json({ message: 'Invalid payload, id_token,googleUserId  required.', code: 400 });
    };


    // console.log(req.body)

    if (process.env.NODE_ENV !== 'production') {
        id_token  = GOOGLE_TOKEN
        googleUserId= GOOGLE_USER_ID
    };

    try {
        //Verify Token
        let data = {
            token:GOOGLE_TOKEN
        }
        let response = await verifyGoogleToken(data);
        // console.log(response)
        if (response && response.aud === GOOGLE_CLIENT_ID && response.sub === googleUserId && response.email_verified) {
            //Valid User
            //Check if user exist in DB => Login 
                    //else Register => login
            
            let user:any = await UserModel.findOne({ 'google_data.userId': googleUserId });
            if (user) {

                if (user.isSuspended) {
                    return  res.json({message:'Your account has been suspended please contact IT support for enquiries.', code:423}  )
                } else {
                    user.google_data.id_token = id_token;

                 //Generate Tokens
                 let data2 = {
                    auth_type: 'google_login',
                    id:user._id
                }
                const JWTtoken = generateJwtToken(data2);
                const RToken:any = await generateRefreshToken(data2);

                //Set Last Login
                user.last_login = Date.now();
                await user.save();
                return res.json( {JWTtoken,refresh_token:RToken.toString( 'base64' ),code:200} )
                }
                
            } else {
                let data = {
                    token:GOOGLE_TOKEN
                }
                let userData = await verifyGoogleToken(data);
               
               // console.log('UserData', userData);
    
    
               const newUser = new UserModel({
                   email: userData.email,
                   first_name:userData.given_name,
                   last_name:userData.family_name,
                   password: null,
                   signup_type:'google_signup'
               });
    
               let user: any = await newUser.save();
               // user.signup_type = 'facebook_signup';
               user.google_data.id_token = id_token;
               user.google_data.userId = googleUserId;
               user.isVerified= true
               
    
    
               //Generate Tokens
               let data2 = {
                   auth_type: 'google_login',
                   id:user._id
               }
               const JWTtoken = generateJwtToken(data2);
               const RToken:any = await generateRefreshToken(data2);
    
               //Set Last Login
               user.last_login = Date.now();
               await user.save();
                return res.json({ JWTtoken, refresh_token: RToken.toString('base64'), code: 200 });
               
            }
        } else {
             //Invalid User
             return res.json({ message: 'Unauthorised user.', code: 401 });
        }
    } catch (err) {
        console.log(err)
        return res.json({ message: 'Internal server error.', code: 500 });
    }
});
export default Router;