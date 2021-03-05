
let loginWithFacebook = () => {
    FB.login( response => {
        const {authResponse:{accessToken,userID}} = response
        console.log( response )
        FB.api('')
        
        FB.api( '/me', ( response ) => {
            console.log(JSON.stringify(response))
        })
    }, { scope: 'public_profile,email'  })
}
document.getElementById( 'loginbtn' ).addEventListener( 'click', loginWithFacebook, false );

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    // console.log( profile, googleUser )
    console.log(googleUser.getAuthResponse().id_token)
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  }