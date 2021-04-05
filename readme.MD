# Base URL
 - http://localhost:8080/

# Authentication/Authorisaton
 - Header : {
      x-auth-token : JWToken which will be sent as response when a user logs in successfull.
      Content-Type : 'Application/json'
 }
 
# Routes

###### @route POST api/auth/register
 - @desc  Register Users
 - @access  Public
 - Payload email, first_name, last_name, password,redirection_url
   - A token verification token will be attached to the redirection_url

###### @route PUT api/auth/verifyemail
- @desc  verify email
- @ccess  Public
- Payload token

###### @route POST api/auth/login
- @desc  Login Users
- @access  Public
- Payload email, password

###### @route POST api/auth/facebook
- @desc  Register or Login Users using social media(Facebook)
- @access  Public
- Payload facebookAccessToken, facebookUserId

###### @route POST api/auth/google
- @desc  Register or Login Users using social media(Google)
- @access  Public
- Payload id_token, googleUserId
- Google Client Id 351759604405-jl393fam832r7v932kokj7dt5fmil55p.apps.googleusercontent.com

###### @route POST api/admin/user
- @desc  Suspend || unsuspend || Downgrade || Upgrade a user
- @access  Private<Admin>
- Payload userId,action (one of ([SUSPEND, UNSUSPEND, DOWNGRADE, UPGRADE ADMIN])

###### @route POST api/admin/createcourse
- @desc  Create Courses
- @access  Private<Admin>
- Payload course_title, course_description, instructor<id> 

###### @route POST api/admin/user/all
- @desc  Get all Users
//@access  Private<Admin>


###### @route POST api/student/add_drop_course
- @desc  Register and Un-register courses
- @access  Private
- Payload course_id<id>,action<REGISTER,UN_REGISTER>

###### @route GET api/course/all
- @desc  get all Courses
- @access  Public



###### @route POST api/instructor/upload_course_content
- @desc  Upload Course Content
- @access  Private<instructor of that particular course>
- payload course_id,module_number,content_type,title,acutal_content, section_number
- content type can be in any of this format 'IMG<jpg,png>', 'VIDEO<mp4,mp3>', 'TEXT', 'FILES<docx,pdf>'

###### @route POST api/instructor/upload_questions
- @desc  Upload Questions
- @access  Private<instructor>
- payload Invalid payload supplied, course_id,section_id,question<Text>, options<Array>.

###### @route PUT api/instructor/edit_questions
- @desc  Edit questions
- @access  Private<instructor>
- payload course_id,question_id,question<Text>, options<Array>,answer

###### @route PUT api/instructor/edit_course
- @desc  Edit a course
- @access  Private<instructor>
- payload module_id,course_id,section_id


###### @route GET api/course/media/:filename
- @desc  get media files
- @access  Public

###### @route GET api/user
- @desc  Get user details
- @access  Private