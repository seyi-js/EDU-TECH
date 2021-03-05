
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

