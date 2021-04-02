import express, { Application, Request, Response, NextFunction } from 'express';
const Router: any = express.Router();
import { UserModel,CourseModel } from '../../models/index'
import {filterOutUserProperties,filterOutSomeCourseContentProperties} from '../../helper/funtions'
//@route GET api/course/all
//@desc  get all Courses
//@access  Public
Router.get('/all', async (req: Request, res: Response) => {
    try {
        var courses:any = await CourseModel.find({})
            .populate('instructor')
            .populate({ 
                path: 'course_content',
                populate: {
                  path: 'sections',
                    populate: {
                        path: 'section_questions',
                        model: 'questions',
                        // populate: {
                        //     path: 'course_id',
                        //     model: 'couses',
                        // }
                    },
                    
                } 
            })
            
        
       let apiData = courses.map(course => {
        filterOutSomeCourseContentProperties(course.course_content)
            return {
                ...course._doc,
                instructor:filterOutUserProperties(course.instructor),
                
            }    
       });

        
        
        
        
            return res.json({message:apiData, code:200})
    } catch (err) {
        console.log(err);
        return res.json({message:'Internal server error.', code:500})
    }
});



export default Router;