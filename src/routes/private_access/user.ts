import express, { Application, Request, Response, NextFunction } from 'express';
const Router:any = express.Router();
import { verifyToken } from '../../helper/middleware';
import { UserModel, CourseModel } from '../../models/index'
import {filterOutUserProperties} from '../../helper/funtions'

//@route GET api/user
//@desc  Get user details
//@access  Private
interface UserRequest extends Request {
    user?: any
}
Router.get('/', verifyToken, async(req:UserRequest, res) => {

    try{
        let user: any = await UserModel.findById(req.user.id)
        .populate({ 
            path: 'registered_courses',
            populate: {
              path: '_id',
              model: 'couses',
                populate: {
                    path: 'instructor',
                    model: 'users'
                },
            } 
        })
        let includeRegisteredCourses = true
        let apiData = {
            user:filterOutUserProperties(user,includeRegisteredCourses)
        }
                
         return res.json({ message: apiData, code: 200 });

    }catch(err){
        console.log(err);
        return res.json({message:'Internal server error.', code:500})
    }

});



export default Router;