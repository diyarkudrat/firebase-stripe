const STRIPE_PUBLISHABLE_KEY = 'pk_test_51HIj0bDOv9oC34s9dxojV4Ess5dWowYFn4PMGwNSBO00lXjHJ1QLXVQAu4HkiHzamG8YT0dfszGaU0TeliLkWPhF00MWLKRoBE';
let currentUser = {};
let customerData = {};


const firebaseUI = new firebaseui.auth.authUI(firebase.auth());
const firebaseUiConfig = {
    callback: {
        signInSuccess: function (authResult, redirectUrl) {
            // User successfully signed in.
            return true;
        },
        showUI: () => {
            document.getElementById('loader').style.display = 'none';
        },
    },
    signInFlow: 'popup',
    successURL: '/',
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
};