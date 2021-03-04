import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { privateKey,email_password } from '../config';
import {Token,UserModel} from '../models/index'
import crypto from 'crypto'
import Mailer from 'nodemailer'



//@desc Genarate Json Web Tokens
interface JWT {
    id: String,
    auth_type:String
}
export const generateJwtToken = ( data:JWT ) => {
    const token:string = jwt.sign(
        { data },
        `${ privateKey }`,
        { expiresIn: 60 * 1000 * 60 * 24 } )//Expires in 24hrs 
       
    return token;
};

//@desc GenerateRefereshToken
interface RJWT {
    id: String,
    auth_type:String
}
export const generateRefreshToken = async (data: RJWT) => {
    
    

    try {
        //Invalidate all other tokens
        const token:Array<any> = await Token.find({ user_id: data.id });
        
        
    token.map( t => {
        t.isValid= false;
        t.save();
        
    } );
    let key;
    const password:any = crypto.randomBytes(16).toString('hex');
    const salt:any = crypto.randomBytes(32).toString('hex')
    key = await crypto.pbkdf2Sync( password, salt, 10000, 128, 'sha256' );
    if ( key ) {
        const newToken = new Token( {
            user_id: data.id,
            token: key.toString('base64'),
            auth_type:data.auth_type
        } );


        const user = await newToken.save();
        
 
        return key;

        
        
    }
    
    } catch (err) {
        console.log(err)
    }
    
    
};

//@desc Gen Hash
export const genHash =  ( data:string ) => {
    let hash;
    var salt = bcrypt.genSaltSync(10);
     hash = bcrypt.hashSync(data, salt);
    
    return hash;
}

//@desc Send Mails
export const sendMail = async (data:any) => {

    try {
        // const input = require('../Templates/resetpassword').template
    const Transporter = Mailer.createTransport( {
        service: "box.creditsync.com.ng",
        host: "box.creditsync.com.ng",
        port:587,
        secure: false,
        auth: {
            user: 'support@creditsync.com.ng',
            pass: email_password
        },
        tls: {
            rejectUnauthorized: false
        }
        
    } );

    var mailOptions = {
        from: '"CreditSync Team" <support@creditsync.com.ng>',
        to: data.to,
        subject: data.subject,
        html: data.input,
        
    };

    const mail = await Transporter.sendMail( mailOptions );

    return mail;
    } catch (err) {
        console.log(err)
    }
};

//@desc lockAccount
export const triggerLock = async (id: String) => {
    try {
        let user:any = await UserModel.findOne( { _id: id } )
    
    if ( parseInt(user.login_failed_attempt_count) < 7 ) {
        user.login_failed_attempt_count = parseInt(user.login_failed_attempt_count) + 1;
        user.save();
    
       
    } else if ( parseInt(user.login_failed_attempt_count) === 7 ) {
        user.isLocked = true;
        user.save()
    }
    } catch (err) {
        console.log(err)
    }
};