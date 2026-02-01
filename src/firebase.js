// src/firebase.js
// using global firebase object from compat CDN

const firebaseConfig = {
    apiKey: "AIzaSyBNP9QIFPaZtIrpmLIw26MUP5z5gMfTKHo",
    authDomain: "keep-more.firebaseapp.com",
    projectId: "keep-more",
    storageBucket: "keep-more.firebasestorage.app",
    messagingSenderId: "572233684534",
    appId: "1:572233684534:web:3d8e7bfbf7831adc6f8bef"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Make globally available
window.auth = firebase.auth();
window.db = firebase.firestore();

console.log('Firebase initialized (Compat Mode)');
