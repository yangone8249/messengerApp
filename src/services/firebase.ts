// firebase.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "messengerapp-4066d.firebaseapp.com",
  projectId: "messengerapp-4066d",
  storageBucket: "messengerapp-4066d.firebasestorage.app",
  messagingSenderId: "63977887961",
  appId: "1:63977887961:web:0e18b962bf4cf6ab1286c8",
};

const app = initializeApp(firebaseConfig);

export default app;