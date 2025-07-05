// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBguvlc63szwx30BbvaVzbKWz-cGdv0Dt0",
  authDomain: "wordly-c4f9f.firebaseapp.com",
  projectId: "wordly-c4f9f",
  storageBucket: "wordly-c4f9f.firebasestorage.app",
  messagingSenderId: "145149004858",
  appId: "1:145149004858:web:f92307d97f853fe7f07903",
  measurementId: "G-4CS28EVZF7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics }; 