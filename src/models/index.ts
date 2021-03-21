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
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    facebook_data: {
        access_token: {
            type: String,
            
        },
        userId: {
            type: String,
           
        }
    },
    google_data: {
        id_token: {
            type: String,
            
        },
        userId: {
            type: String,
           
        }
    },
    signup_type: {
        type: String,
        required:true
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
            course:{
                type: ObjectId,
                ref: 'courses'
            },
            status: {
                type: String,
                default:'UNCOMPLETED'
            },
            grade: {
                type: String,
                default:'-'
            }
        }
    ],
    resetPasswordExpires: {
        type:String,
    },
    resetPasswordToken: {
        type:String,
    },
    verification_token: {
        type:String,
    },
    verification_token_expires: {
        type:String,
    },
    isVerified: {
      
        type:Boolean,
      default:false
    },
    last_login: {
        type: String,
    },
    isLocked: {
        type: Boolean,
        default:false
    },
    isSuspended: {
        type: Boolean,
        default:false
    },
    login_failed_attempt_count: {
        type:String,
        default:0
    },
    time_of_creation: {
        type: Date,
        default:Date.now()
    }
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
    number_of_sections: {
        type: Number,
        // required:true
    },
    course_content: {
            sections: [
                
            {
                    // type: Array,
                    // required:false,
                    section_id:{
                        type: String,
                        // required: true,
                       
                    },
                    section_number: {
                        type: Number,
                        // required: true,
                        
                    },
                    number_of_modules: {
                        type: String,
                    },
                    modules: [
                        {
                            module_id:{
                                type: String,
                                // required: true,
                               
                            },
                            module_number: {
                                type: Number,
                                // required: true,
                                
                            },
                            content_type: {
                                type: String,
                                //required:true
                            },
                            title: {
                                type: String,
                                //required:true
                            },
                            actual_content: {
                                type:String,
                                //required:true //This could be an audio file, video file, text
                            },
                            image: {
                                image_id: {
                                    type:String,
                                },
                                filename: {
                                    type:String,
                                },
                            },
                            video: {
                                video_id: {
                                    type:String,
                                },
                                filename: {
                                    type:String,
                                },
                            },
                            file: {
                                file_id: {
                                    type:String,
                                },
                                filename: {
                                    type:String,
                                },
                                content_type: {
                                    type:String,
                                }
                            },
                            time_of_creation: {
                                type: Date,
                                default:Date.now()
                            }
                        }
                    ],
                    section_questions: [
                        {
                            type: ObjectId,
                            ref: 'questions'
                        }
                    ],
                    isPublished:false,
                } 
            ]
        },
    time_of_creation: {
        type: Date,
        default:Date.now()
    }
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
    },
    course_id: {
        type: ObjectId,
        ref: 'courses'
    }
});



/* Token Schema */
const tokenSchema = new mongoose.Schema( {
    user_id: {
        type: String,
        
    },
    token: {
        type: String,
    },
    isValid: {
        type: Boolean,
        default: true,
    },
    auth_type: {
        type: String,
    },
    issued_at: {
        type: String,
        default: Date.now()
    }
} );

export const Token = mongoose.model('tokens', tokenSchema );
export const UserModel = mongoose.model('users', userSchema);
// export const CourseModel = mongoose.model('courses', courseSchema);
export const CourseModel = mongoose.model('couses', courseSchema);
export const QuestionModel = mongoose.model('questions', questionSchema);
// module.exports = {UserModel,CourseModel,QuestionModel}
// export default UserModel;