// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBz-4RsPJ0xCp2WOiDICx4H77H7TXGUb-U",
  authDomain: "som-lms-methylation.firebaseapp.com",
  projectId: "som-lms-methylation",
  storageBucket: "som-lms-methylation.appspot.com",
  messagingSenderId: "707522706163",
  appId: "1:707522706163:web:6b8e16594919456db09586"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export default auth;