import express, { Application, Request, Response, NextFunction } from 'express';
const Router: any = express.Router();
import { UserModel,CourseModel } from '../../../models/index'
import { filterOutUserProperties } from '../../../helper/funtions'
import {verifyToken,verifyIfInstructorIsAlignWithCourse} from '../../../helper/middleware'
//@route PUT api/instructor/edit_course
//@desc  Edit a course
//@access  Private<instructor>

Router.put('/edit_course', verifyToken,verifyIfInstructorIsAlignWithCourse, async (req: Request, res: Response) => {
    const {course_id,course_title,course_description,module,content_type,title,acutal_content} = req.body;
});

//@route PUT api/instructor/edit_questions
//@desc  Edit a course
//@access  Private<instructor>

Router.put('/edit_questions',verifyToken,verifyIfInstructorIsAlignWithCourse, async (req: Request, res: Response) => {
    const { question_id, course_id } = req.body;
    
    //Verify if course_id === question.course_id to checkmate foul play.
});


//@route POST api/instructor/upload_course_content
//@desc  Upload Course Content
//@access  Private<instructor>
Router.put('/upload_course_content',verifyToken,verifyIfInstructorIsAlignWithCourse, async (req: Request, res: Response) => {
    const {course_id,course_title,course_description,module,content_type,title,acutal_content} = req.body;
});

export default Router;