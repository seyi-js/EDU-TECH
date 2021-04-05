import express, { Application, Request, Response, NextFunction } from 'express';
const Router:any = express.Router();
import { verifyToken } from '../../../helper/middleware';
import { UserModel, CourseModel } from '../../../models/index'

//@route POST api/student/add_drop_course
//@desc  Register for courses
//@access  Private
interface StudentRequest extends Request {
    user?: any
}
Router.post('/add_drop_course', verifyToken, async (req: StudentRequest, res: Response) => {
    const { course_id,action } = req.body;
    if (!course_id || !action) {
        return res.json({message:'Invalid payload suplied, course_id<id>, action<REGISTER,UN-REGISTER> required.', code:400})
    };

    try {
        let user: any = await UserModel.findById(req.user.id);
        let course = await CourseModel.findById(course_id);
        if (!course) {
            return res.json({message:'Invalid payload suplied, course_id<id>, action<REGISTER,UN-REGISTER> required.', code:400})
        } else {
           if(action === 'REGISTER'){
                const theCourse = user.registered_courses.find( c => c._id == course_id );
             
            if(theCourse){
               
                return res.json({ message: "This course is already registered.", code: 400 })
            };
            user.registered_courses.push(course._id);
            await user.save();

            return res.json({ message: "Course registration successful.", code: 200 });


           }else if(action === 'UN-REGISTER'){

               let filteredCourses = user.registered_courses.find( c => c._id != course_id );
               user.registered_courses = filteredCourses;
               await user.save();

            return res.json({ message: "Course un-registered successfully.", code: 200 });
               
           }else{
               return res.json({message:'Invalid action payload supplied.', code:400})
           }
        }
    } catch (err) {
        console.log(err);
        return res.json({message:'Internal server error.', code:500})
    }
});



export default Router;