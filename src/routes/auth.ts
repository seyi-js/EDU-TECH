import express, { Application, Request, Response, NextFunction } from 'express';
const Router:any = express.Router();
import {UserModel} from '../models/index'
import {genHash} from '../helper/funtions'
import Crypto from 'crypto'
import {sendSignUpEmail} from '../helper/sendmail'
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
    }
});


export default Router;