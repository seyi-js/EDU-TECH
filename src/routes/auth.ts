import express, { Application, Request, Response, NextFunction } from 'express';
const Router:any = express.Router();
import {UserModel} from '../models/index'
import {genHash,generateJwtToken,generateRefreshToken,triggerLock} from '../helper/funtions'
import Crypto, { BinaryLike } from 'crypto'
import {sendSignUpEmail} from '../helper/sendmail'
import bcrypt from 'bcryptjs'


//@route POST api/auth/register
//@desc  Register Users
//@access  Public
Router.post('/register', async (req: Request, res: Response):Promise<any> => {
    const { email, first_name, last_name, password }: any = req.body;
    if (!email || !first_name || !last_name || !password) {
        return res.json({message:'Please enter all fields.', code:400}  )
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
            });

            let user:any = await newUser.save();

            const token = Crypto.randomBytes(60).toString('hex');
            user.verification_token = token;
            
            user.verification_token_expires = Date.now() + 60 * 60 * 1000 * 24// 24 Hours
            
            await user.save();
            const link = `http://localhost:3000/email/verify/${ token }`
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
                user.save();
                return res.status( 200 ).json( {JWTtoken,refresh_token:RToken.toString( 'base64' )} )
            }
        };
    } catch (err) {
        console.log(err)
        return res.json({message:'Internal server error.', code:500})
        
    }
});

export default Router;