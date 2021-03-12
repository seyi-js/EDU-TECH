import jwt from 'jsonwebtoken';
import { privateKey } from '../config';
import {UserModel,CourseModel} from '../models/index'
import express, { Application, Request, Response, NextFunction } from 'express';
//@desc Verify Json Web Tokens
interface AuthRequest extends Request {
    user?: any
}
export const verifyToken =  ( req:AuthRequest, res:Response, next:NextFunction ) => {
    const token = req.header( 'x-auth-token' );
    if ( !token ) {
        
        return res.json({message:'No token, authorization denied', code:401}  )
    } else {
        if ( token ) {
            try {
                const decoded:any = jwt.verify( token, privateKey );
                req.user = decoded.data;
                // decoded;
                // console.log( decoded )
                next();
            } catch ( e ) {
                // req.JWTerrorMessage = e.message;
               console.log(e)
        return res.json({message:'Invalid Token', code:403}  )

                
            }
        }
    }
};

//@desc verfiyAdmin
export const verifyAdmin = async ( req:AuthRequest, res:Response, next:NextFunction ) => {

    try {
        let user: any = await UserModel.findById(req.user.id);
        // console.log(req.user)
        if ( user.isAdmin ) {
            next();

            } else {
                return res.json({message:'You are not authorized to access this endpoint.', code:401}  )

        };
    } catch (err) {
        console.log( err )
        return res.json({message:'Internal server error', code:500}  )
    };
 
};

export const verifyIfInstructorIsAlignWithCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { course_id } = req.body;
    if (!course_id) {
        return res.json({message:"Invalid payload suplied, course_id required.", code:400})
    };

    try {
        let user: any = await UserModel.findById(req.user.id);
        let course: any = await CourseModel.findById(course_id);
        if (user.isInstructor && course && course_id === course.instructor) {
            next(); //An Instructor for this course
        } else {
            
            return res.json({ message: 'You are not authorized to access this endpoint.', code: 401 });
        }
    } catch (err) {
        console.log( err )
        return res.json({message:'Internal server error', code:500}  )
    }
};