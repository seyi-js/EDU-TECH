#Routes

//@route POST api/auth/register
//@desc  Register Users
//@access  Public
//Payload email, first_name, last_name, password 

//@route POST api/auth/login
//@desc  Login Users
//@access  Public
//Payload email, password

//@route POST api/auth/facebook
//@desc  Register or Login Users using social media(Facebook)
//@access  Public
//Payload facebookAccessToken, facebookUserId

//@route POST api/auth/google
//@desc  Register or Login Users using social media(Google)
//@access  Public
//Payload id_token,googleUserId

//@route POST api/admin/user
//@desc  Suspend || unsuspend || Downgrade || Upgrade a user
//@access  Private<Admin>
//Payload userId,action (one of ([SUSPEND, UNSUSPEND, DOWNGRADE, UPGRADE])
