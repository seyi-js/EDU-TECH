import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { privateKey,email_password,GOOGLE_CLIENT_ID } from '../config';
import {Token,UserModel} from '../models/index'
import crypto from 'crypto'
import Mailer from 'nodemailer'
import Axios from 'axios'
import {OAuth2Client} from 'google-auth-library'

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
        throw err
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
        throw err
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
        throw err
    }
};

interface FACEBOOKVERIFY{
    token: string,
}
export const verifyFacebookAccessToken = async (data:FACEBOOKVERIFY) => {
    try {
        let response = await Axios.get(`https://z-m-graph.facebook.com/v10.0/me?access_token=${data.token}&method=get&pretty=0&sdk=joey&suppress_http_code=1`);
       
        return response.data;
    
    } catch (err) {
        console.log(err)
        throw err
        
    }
};

interface FACEBOOKDATA{
    token:string,
    userId:string
}
export const getUserDataFromFacebook = async (data:FACEBOOKDATA) => {
    try {
        let response = await Axios.get(`https://z-m-graph.facebook.com/v10.0/${data.userId}?fields=first_name,last_name,email&access_token=${data.token}`);
        return response.data;
    // console.log(response.data)
    } catch (err) {
        console.log(err)
        throw err
    }
};

interface GOOGLEVERIFY{
    token: string,
};

export const verifyGoogleToken = async (data:GOOGLEVERIFY) => {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
async function verify() {
  try {
    const ticket = await client.verifyIdToken({
        idToken: data.token,
        audience: GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload:any = ticket.getPayload();
   
      const userid = payload['sub'];
      return payload;
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
  } catch (err) {
      throw err;
  }
    }

    try {
        let response = await verify()
        return response
    } catch (err) {
        throw err;
    }

};


export const filterOutUserProperties = (user, includeRegisteredCourses?: Boolean) => {
   
    interface UserFormat {
        registered_courses?: any,
        isStudent: Boolean,
        isInstructor: any,
        isAdmin: Boolean,
        isVerified: Boolean,
        isLocked: Boolean,
        isSuspended: Boolean,
        time_of_creation: String,
        _id: String,
        first_name: String,
        last_name: String,
    }

    let data: UserFormat = {
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
       
    }

    //If Registered Courses should be included in the user object
    if (includeRegisteredCourses) {
        let course = filterOutCourseProperties(user.registered_courses)
        data.registered_courses = course;
    };

    return data;

   
};

export const filterOutCourseProperties = (courses,includeCourseContent?:Boolean) => {
    interface CourseFormat{
        status: String,
        grade: String,
        course: {
            time_of_creation: String,
            _id: String,
            course_title: String,
            course_description: String,
            instructor: Object,
            course_content?:Array<any>
        },
        
    }
  let course =   courses.map(course => {
          
    
      let data: CourseFormat = {
          status: course.status,
          grade: course.grade,
          course: {
              time_of_creation: course._id.time_of_creation,
              _id: course._id._id,
              course_title: course._id.course_title,
              course_description: course._id.course_description,
              instructor: filterOutUserProperties(course._id.instructor)
          }
      };
       if(includeCourseContent) {
        data.course.course_content= course._id.course_content
    }
        // course["course_content"]:null
     
      return data;
    
  });
    
    return course;
}