import express, { Application, Request, Response, NextFunction } from 'express';
const Router:any = express.Router();
import { verifyToken } from '../../../helper/middleware';
import { UserModel, CourseModel } from '../../../models/index'

//@route POST api/student/register_course
//@desc  Register for courses
//@access  Private
interface StudentRequest extends Request {
    user?: any
}
Router.post('/register_course', verifyToken, async (req: StudentRequest, res: Response) => {
    const { course_id } = req.body;
    if (!course_id) {
        return res.json({message:'Invalid payload suplied, course_id<id> required.', code:400})
    };

    try {
        let user: any = await UserModel.findById(req.user.id);
        let course = await CourseModel.findById(course_id);
        if (!course) {
            return res.json({message:'Invalid payload suplied, course_id<id> required.', code:400})
        } else {
            user.registered_courses.push(course._id);
            await user.save();

            return res.json({ message: "Registration successful.", code: 200 });
        }
    } catch (err) {
        console.log(err);
        return res.json({message:'Internal server error.', code:500})
    }
});



export default Router;