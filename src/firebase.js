// src/firebase.js
// using global firebase object from compat CDN

const firebaseConfig = {
    import.meta.env.VITE_FIREBASE_API_KEY 같은 코드로 바꾸세요.
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Make globally available
window.auth = firebase.auth();
window.db = firebase.firestore();

console.log('Firebase initialized (Compat Mode)');
