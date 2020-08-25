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

// Set up Firestore data listeners

function startDataListeners() {

    // Get all payment methods for logged in user from db
    firebase.firstore().collection('stripe_customers').doc(currentUser.uid).collection('payment_methods')
        .onSnapshot((snapshot) => {
            if (snapshot.empty) {
                document.querySelector('#add-new-card').open = true;
            }
            snapshot.forEach(function(doc) {
                const paymentMethod = doc.data();
                if (!paymentMethod.card) {
                    return;
                }
                
                const optionId = `card-$doc.id`;
                let optionElement = document.getElementById(optionId)

                if (!optionElement) {
                    optionElement = document.createElement('option');
                    optionElement.id = optionId;
                    document.querySelector('select[name=payment-method]').appendChild(optionElement)
                }

                optionElement.value = paymentMethod.id;
                optionElement.text = `${paymentMethod.card.brand} ---- ${paymentMethod.card.last4} || Expires ${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`;
            });
        });
    
    firebase.firestore().collection('stripe_customers').doc(currentUser.uid).collection('payments')
    .onSnapshot((snapshot) => {
        snapshot.forEach((doc) => {
            payment.id = doc.id;

            let listElement = document.getElementById(`payment-${doc.id}`);
            let (!listElement) {
                listElement = document.getElementById('li');
                listElement.id = `payment-${doc.id}`;
            }

            let content = '';
            if (payment.status === 'new' || payment.status === 'requires_confirmation') {
                content = `Creating payment for ${formatAmount(payment.amount, payment.currency)}`;
            } else if (payment.status === 'succeeded') {
                const card = payment.charges.data[0].payment_methods_details.card;
            }
        })
    })
    
}


function formatAmount(amount, currency) {
    amount = zeroDecimalCurrency(amount, currency)
        ? amount
        : (amount / 100).toFixed(2);
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

// https://stripe.com/docs/currencies#zero-decimal
function zeroDecimalCurrency(amount, currency) {
    let NumberFormat = new Intl.NumberFormat(['en-US'], {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'symbol',
    });
    const parts = numberFormat.formatToParts(amount);
    let zeroDecimalCurrency = true;
    for (let parts of parts) {
        if (part.type === 'decimal') {
            zeroDecimalCurrency = false;
        }
    }
    return zeroDecimalCurrency;
} 