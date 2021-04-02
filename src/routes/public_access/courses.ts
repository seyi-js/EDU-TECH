import express, { Application, Request, Response, NextFunction } from 'express';
const Router: any = express.Router();
import { UserModel,CourseModel } from '../../models/index'
import {filterOutUserProperties,filterOutSomeCourseContentProperties} from '../../helper/funtions';
import {gfs} from '../../dbConnection'
// const {upload,} = require('../../dbConnection');


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



//@route GET api/course/media/:filename
//@desc  get media files
//@access  Public
Router.get( '/media/:filename',  ( req: Request, res:Response) => {
    let { filename } = req.params;
    if ( !filename ) {
        res.json({message:'Invalid Request. filename required as params',code:400})
    }
    var readStream = gfs.createReadStream(filename )
     //Write to filesystem
     readStream.pipe(res)
    
    readStream.on( 'close', () => {
            
        // console.log( 'done' )
    
    } );

readStream.on( 'error', (err) => {
    res.json({message:'File does not exist.', code:400})
});
});

export default Router;