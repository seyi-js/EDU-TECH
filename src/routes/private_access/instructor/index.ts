import express, { Application, Request, Response, NextFunction, request } from 'express';
const Router: any = express.Router();
import Crypto from 'crypto';
import { UserModel,CourseModel } from '../../../models/index'
import { filterOutUserProperties } from '../../../helper/funtions'
import {verifyToken,verifyIfInstructorIsAlignWithCourse} from '../../../helper/middleware'
const {upload,gfs} = require('../../../dbConnection')
//@route PUT api/instructor/edit_course
//@desc  Edit a course
//@access  Private<instructor>

Router.put('/edit_course', verifyToken,verifyIfInstructorIsAlignWithCourse, async (req: Request, res: Response) => {
    const {course_id,course_title,course_description,module,content_type,title,acutal_content} = req.body;
});

//@route PUT api/instructor/edit_questions
//@desc  Edit questions
//@access  Private<instructor>

Router.put('/edit_questions',verifyToken,verifyIfInstructorIsAlignWithCourse, async (req: Request, res: Response) => {
    const { question_id, course_id } = req.body;
    
    //Verify if course_id === question.course_id to checkmate foul play.
});

//@route PUT api/instructor/upload_questions
//@desc  Upload Questions
//@access  Private<instructor>
Router.post('/upload_questions',verifyToken,verifyIfInstructorIsAlignWithCourse, async (req: Request, res: Response) => {
    const {course_id,section_id } = req.body;
    
    
});


//@route POST api/instructor/upload_course_content
//@desc  Upload Course Content
//@access  Private<instructor>
interface ImageRequest extends Request {
    file?: any
    // files?: Array<any>
}
Router.post('/upload_course_content',verifyToken,upload.single('file'), verifyIfInstructorIsAlignWithCourse,async (req: ImageRequest, res: Response) => {
    const { course_id, module_number, content_type, title, actual_content, section_number } = req.body;
    // console.log(req.files)
    // res.json(req.file)

    

    if (!course_id || !module_number || !content_type ||!title ||!actual_content || !section_number) {
        return res.json({ message: "Invalid payload suplied, course_id,module_number,content_type,title,actual_content, section_number required.", code: 400 });
    };

    let acceptedContentType = ['IMG', 'VIDEO', 'TEXT', 'FILES'];
    let type = acceptedContentType.find(t=> t === content_type)
    
    if (!type) {
        return res.json({ message: "Content type can contain any of the following strings IMG VIDEO TEXT FILES<.pdf,.txt,.ppx etc> required.", code: 400 });
    };
    try {
        if (req.file) {
            if (content_type === 'IMG') {

                //Verify if the file is really an image
                if (req.file.mimetype == 'image/jpeg' || req.file.mimetype == 'image/png') {
                    //Proceed with saving the file details
                    const image = {
                        image_id:req.file.id,
                        filename:req.file.filename,
                    }
                    let response = await handleSavingCourseContent(course_id, module_number, content_type, title, actual_content, section_number, image);
                    return res.json(response)

                } else {
                    return res.json({message:'This is not an image.', code:400})
                }
            }
    
            if (content_type === 'VIDEO') {
                
            }
    
            
    
            if (content_type === 'FILES') {
                
            }
        } else {
            //Process Text
            let response = await handleSavingCourseContent(course_id, module_number, content_type, title, actual_content, section_number);

            return res.json(response)
        }


        


        
    } catch (err) {
        console.log(err);
        return res.json({message:'Internal server error.', code:500})
    }
});

// interface CourseContent{
//     course_id: any,
//     module_number: any,
//     content_type: String,
//     title: String,
//     actual_content: String,
//     // section_
// }

const handleSavingCourseContent = async (course_id,module_number,content_type,title,actual_content, section_number,image?)=> {
   try {
    let course: any = await CourseModel.findById(course_id);
    if (!course) {
        return { message: "Invalid course id supplied or the course has been deleted.", code: 400 };
    };
// console.log(course)
    //Check if section number already exist
    let section = course.course_content.sections.find(n => n.section_number === Number(section_number));
    if (section) {
        //Go Further into the modules section
        // console.log(section.modules)
        let module = section.modules.find(n => n.module_number === Number(module_number));

        //Check if module number already exist
        if (module) {
            return { message: "Module already exist, choose a different number.", code: 400 };
        } else {
            let newModule = {
                module_id: Crypto.pseudoRandomBytes(10).toString('hex'),
                module_number:Number(module_number),
                content_type,
                title,
                actual_content,
                image

            };

            //Update number of modules
            section.number_of_modules = section.modules.length + 1
            //Update Modules
            section.modules.push(newModule);

            await course.save()

            return { message: `Module number ${module_number} has been added to section number ${section_number} successfully.`, code: 200 };
            
        };
    } else {
        //Create a new section
        let newSection = {
            section_id: Crypto.pseudoRandomBytes(10).toString('hex'),
            section_number:Number(section_number),
            number_of_modules:'1',
            modules: [
                {
                    module_id: Crypto.pseudoRandomBytes(10).toString('hex'),
                    module_number:Number(module_number),
                    content_type,
                    title,
                    actual_content,
                    image
                    
                }
            ]
        };

         //Update number of modules
         course.number_of_sections = course.course_content.sections.length + 1
         //Update Modules
         course.course_content.sections.push(newSection);

        await course.save();

        return { message: 'New section created successfully.', code: 200 };
    };
   } catch (err) {
    console.log(err)
    throw err
   }
}

export default Router;