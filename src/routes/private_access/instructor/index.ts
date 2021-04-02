import express, { Application, Request, Response, NextFunction, request } from 'express';
const Router: any = express.Router();
import Crypto from 'crypto';
import { UserModel,CourseModel,QuestionModel } from '../../../models/index'
import { filterOutUserProperties, handleSavingCourseContent } from '../../../helper/funtions'
import {verifyToken,verifyIfInstructorIsAlignWithCourse} from '../../../helper/middleware'
import { resourceUsage } from 'process';
const {upload} = require('../../../dbConnection');




//@route PUT api/instructor/edit_course
//@desc  Edit a course
//@access  Private<instructor>
Router.put('/edit_course', verifyToken,verifyIfInstructorIsAlignWithCourse, async (req: Request, res: Response) => {
    const {course_id,course_title,course_description} = req.body;
    if(!course_id || !course_title || !course_description){
        return res.json({ message: 'Invalid payload supplied, module_id,course_id,section_id required.', code: 400 });
    };
    let updatedData = {
        $set: {
            course_title,
            course_description
        }
    };


    try {
              await CourseModel.findByIdAndUpdate(course_id,updatedData);
            res.json({ message: `Course with id ${course_id} successfully updated.`, code: 200 });
    } catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error.', code: 500 });
    }

});

//TODO
//@route PUT api/instructor/edit_module
//@desc  Edit a module
//@access  Private<instructor>

Router.put('/edit_module', verifyToken,verifyIfInstructorIsAlignWithCourse, async (req: Request, res: Response) => {
    const {course_id,module_id,section_id,content_type,module_number,title} = req.body;


    if(!course_id || !module_id || !section_id){
        return res.json({ message: 'Invalid payload supplied, module_id,course_id,section_id required.', code: 400 });
    };

    try {
        
    } catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error.', code: 500 });
    }

});

//@route PUT api/instructor/edit_questions
//@desc  Edit questions
//@access  Private<instructor>

Router.put('/edit_questions',verifyToken,verifyIfInstructorIsAlignWithCourse, async (req: Request, res: Response) => {
    const { question_id, course_id,question,answer,options } = req.body;
    if (!question_id || !answer || !question || !options) {
        return res.json({ message: 'Invalid payload supplied, course_id,question_id,question<Text>, options<Array>,answer required.', code: 400 });
    };
    try {

        let Q:any = await QuestionModel.findById(question_id);

        let updatedData = {
            $set: {
                question,
                answer,
                options
            }
        };


        if (Q.course_id !== course_id) {
        
            await QuestionModel.findByIdAndUpdate(question_id,updatedData);
            res.json({ message: `Question with id ${question_id} successfully updated.`, code: 200 });
        } else{
            return res.json({ message: 'You are not authorised to edit this content.', code: 401 })
 
    }
    } catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error.', code: 500 });
    };
    
   
});

//@route POST api/instructor/upload_questions
//@desc  Upload Questions
//@access  Private<instructor>
Router.post('upload_questions/',verifyToken,verifyIfInstructorIsAlignWithCourse, async (req: Request, res: Response) => {
    const { course_id, section_id, question, options,answer } = req.body;

    if(!course_id || !section_id || !question || !options || options.length === 0 || !answer){
        return res.json({ message: 'Invalid payload supplied, course_id,section_id,question<Text>, options<Array>,answer required.', code: 400 });
    };
    
    try {
        const course:any = await CourseModel.findById(course_id);
        if (course) {
            let section = course.course_content.sections.find(section => section.section_id === section_id);
            if (section) {

                //Save Question To section
                const newQuestion = new QuestionModel({
                    question,
                    answer,
                    course_id,
                    options
                });

                let savedQuestion = await newQuestion.save();
                section.section_questions.push(savedQuestion._id);
                course.save();

                res.json({ message: `Question successfully saved to section with the id ${section_id}.`, code: 200 });

            } else {
                return res.json({ message: 'Invalid section_id supplied or section has been deleted.', code: 400 });
            }

        } else {
            return res.json({ message: 'Invalid course_id supplied or course has been deleted.', code: 400 });
        }
    } catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error.', code: 500 });
    }
    
});


//@route POST api/instructor/upload_course_content
//@desc  Upload Course Content
//@access  Private<instructor>

Router.post('/upload_course_content',verifyToken,upload.single('file'), verifyIfInstructorIsAlignWithCourse,async (req: Request, res: Response) => {
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
                        url:`http://localhost:8080/api/course/media/${req.file.filename}`
                    }
                    let data = {
                        course_id, module_number, content_type, title, actual_content, section_number, image
                    }
                    let response = await handleSavingCourseContent(data);
                    return res.json(response)

                } else {
                    return res.json({message:'This image format is not supported.', code:400})
                }
            }
    
            if (content_type === 'VIDEO') {
               //Verify if the file is really a video
               if (req.file.mimetype == 'video/mp4' || req.file.mimetype == 'video/mp3') {
                //Proceed with saving the file details
              
                const video = {
                    video_id:req.file.id,
                    filename:req.file.filename,
                    url:`http://localhost:8080/api/course/media/${req.file.filename}`
                   }
                    let data = {
                        course_id, module_number, content_type, title, actual_content, section_number, video
                    }
                let response = await handleSavingCourseContent(data);
                return res.json(response)

            } else {
                return res.json({message:'This video format is not supported.', code:400})
            }
            }
    
            
    
            if (content_type === 'FILES') {
                //Verify this is really a file
                if (req.file.mimetype == 'application/pdf'//For PDF
                    || req.file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'//For .docx
                ) {
                      //Proceed with saving the file details
                      const file = {
                        file_id:req.file.id,
                          filename: req.file.filename,
                        content_type:req.file.contentType,
                        url:`http://localhost:8080/api/course/media/${req.file.filename}`
                    }

                    let data = {
                        course_id, module_number, content_type, title, actual_content, section_number, file
                    }
                    let response = await handleSavingCourseContent(data);
                    return res.json(response)
                } else {
                    return res.json({message:'This file format is not supported.', code:400})
                }
            };
        } else {
            //Process Text
            let data = {
                course_id, module_number, content_type, title, actual_content, section_number
            }
            let response = await handleSavingCourseContent(data);

            return res.json(response)
        }


        


        
    } catch (err) {
        console.log(err);
        return res.json({message:'Internal server error.', code:500})
    }
});





export default Router;