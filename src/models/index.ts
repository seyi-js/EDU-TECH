import mongoose from 'mongoose';
var ObjectId = mongoose.Schema.Types.ObjectId;
/* User Schema */
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique:true,
        uniqueCaseInsensitive: true
    },

    password: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    isStudent: {
        type: Boolean,
        default:true
    },
    isInstructor: {
        type: Boolean,
        default:false
    },
    isAdmin: {
        type: Boolean,
        default:false
    },
    registered_courses: [
        {
            type: ObjectId,
            ref: 'courses'
        }
    ]
});

/* Courses Schema */
const courseSchema = new mongoose.Schema({
    course_title: {
        type: String,
        required: true,
        unique:true
    },
    course_description: {
        type: String,
        required: true
    },
    instructor: {
        type: ObjectId,
        ref:'users'
    },
    number_of_modules: {
        type: Number,
        required:true
    },
    course_content: [
        {
            module: {
                type: Number,
                required:true
            },
            content_type: {
                type: String,
                required:true
            },
            title: {
                type: String,
                required:true
            },
            acutal_content: {
                required:true //This could be an audio file, video file, text
            },
            module_questions: [
                {
                    type: ObjectId,
                    ref: 'questions'
                }
            ]
        }
    ],
});

/* Question Schema */

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required:true
    },
    options: [
        {
            type: String,
            required:true
        }
    ],
    answer: {
        type: String,
        required:true
    }
});

export const UserModel = mongoose.model('users', userSchema);
export const CourseModel = mongoose.model('courses', courseSchema);
export const QuestionModel = mongoose.model('questions', questionSchema);
// module.exports = {UserModel,CourseModel,QuestionModel}
// export default UserModel;