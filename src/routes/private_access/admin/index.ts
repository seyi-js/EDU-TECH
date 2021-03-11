import express, { Application, Request, Response, NextFunction } from 'express';
const Router:any = express.Router();
import { verifyAdmin, verifyToken } from '../../../helper/middleware';
import { UserModel,CourseModel } from '../../../models/index'
import {filterOutUserProperties} from '../../../helper/funtions'

//@route POST api/admin/user
//@desc  Suspend || unsuspend || Downgrade || Upgrade a user
//@access  Private<Admin>
Router.post('/user', verifyToken,verifyAdmin, async (req: Request, res: Response):Promise<any> => {
    const { userId,action } = req.body;

    // Actions like SUSPEND UNSUSPEND DOWNGRADE UPGRADE ADMIN are allowed
    if (!userId || !action) {
        return res.json({ message: "Invalid payload supplied, userId and action required.", code: 400 });
    };

    try {
        let user:any = await UserModel.findById(userId);
        if (user) {

            //Suspend a User
            if (action === 'SUSPEND') {
                user.isSuspended = true;
            await user.save();
            return res.json({ message: `User with id ${userId} has been suspended successfully.`, code: 200 });
            };

            //Unsuspend a User
            if (action === 'UNSUSPEND') {
            user.isSuspended = false;
            await user.save();
            return res.json({ message: `User with id ${userId} has been unsuspended successfully.`, code: 200 });
            };


            //Upgrade a user to instructor
            if (action === 'UPGRADE') {
            user.isStudent = false;
            user.isInstructor = true;
            await user.save();
            return res.json({ message: `User with id ${userId} has been upgraded successfully.`, code: 200 });
            };

            //Downgrade a User
            if (action === 'DOWNGRADE') {
            user.isStudent = true;
            user.isInstructor = false;
            await user.save();
            return res.json({ message: `User with id ${userId} has been downgraded successfully.`, code: 200 });
            };

            //Upgrade a user to instructor
            if (action === 'ADMIN') {
                user.isAdmin = true;
                await user.save();
                return res.json({ message: `User with id ${userId} has been upgraded successfully.`, code: 200 });
            };
            
        } else {
            return res.json({message:'Invalid user, user not found.', code:400})
        }
    } catch (err) {
        console.log(err)
        return res.json({message:'Internal server error.', code:500})
    }
});

//@route POST api/admin/createcourse
//@desc  Create Courses
//@access  Private<Admin>

Router.post('/createcourse', verifyToken, verifyAdmin, async (req: Request, res: Response): Promise<any> => {
    let { course_title, course_description, instructor } = req.body;
    if (!course_description || !course_title || !instructor) {
        return res.json({message:"Invalid payload suplied, course_title, course_description, instructor<id> required.", code:400})
    };

    try {
        let newCourse = new CourseModel({
            course_title: course_title.toUpperCase(),
            course_description,
            instructor
        });

        await newCourse.save();

        return res.json({message:"Course has been added successfully.",code:200})
    } catch (err) {
        console.log(err);
        return res.json({message:'Internal server error.', code:500})
    }

});

//@route POST api/admin/user/all
//@desc  Get all Users
//@access  Private<Admin>
Router.get('/user/all',verifyToken, verifyAdmin,  async (req: Request, res: Response) => {
    try {
        let users: any = await UserModel.find({})
        .populate({ 
            path: 'registered_courses',
            populate: {
              path: '_id',
              model: 'courses',
                populate: {
                    path: 'instructor',
                    model: 'users'
                },
            } 
        })
            
        let apiData = users.map(user => {
           let includeRegisteredCourses = true
                return {
                    // ...user._doc,
                    user:filterOutUserProperties(user,includeRegisteredCourses)
                }    
                });
        return res.json({ message: apiData, code: 200 });
        // user
    } catch (err) {
        console.log(err);
        return res.json({ message: 'Internal server error.', code: 500 });
    }
});

// UserModel.find({})
// .populate({ 
//     path: 'registered_courses',
//     populate: {
//       path: '_id',
//         model: 'courses',
//         populate: {
//             path: 'instructor',
//             model: 'users'
//           }
//     } 
// })

//     .then((res: any) => console.log(res[0].registered_courses[0]._id.instructor))

export default Router;