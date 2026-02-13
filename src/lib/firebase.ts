import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your actual Firebase project configuration
// You can get this from the Firebase Console -> Project Settings -> General -> "Your apps" section
const firebaseConfig = {
    apiKey: "AIzaSyCc9_JemCPMsiFHarlL4yvJBbCjsV2Nl5c",
    authDomain: "itc-tax-manager.firebaseapp.com",
    projectId: "itc-tax-manager",
    storageBucket: "itc-tax-manager.firebasestorage.app",
    messagingSenderId: "3063402504",
    appId: "1:3063402504:web:bbb8b48eff9da9b7bb81bd",
    measurementId: "G-XVBRK11GQ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Authentication and Firestore services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
