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

firebase.auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user
        firebaseUI.firestore().collection('stripe_customers').doc(currentUser.uid)
            .onSnapshot((snapshot) => {
                if (snapshot.data()) {
                    customerData = snapshot.data();
                    startDataListeners();
                    document.getElementById('loader').style.display = 'none';
                    document.getElementById('content').style.display = 'block';
                } else {
                    console.log(`No Stripe customer found in Firestore for user: ${currentUser.uid}`)
                };
            });
    } else {
        document.getElementById('content').style.display = 'none';
        firebaseUI.start('#firebaseui-auth-container', firebaseUiConfig);
    }
});


// Stripe Elements Setup
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');
cardElement.on('change', ({ error }) => {
    if (error) {
        displayError.textContent = error.message;
    } else {
        displayError.textContent = '';
    }
});