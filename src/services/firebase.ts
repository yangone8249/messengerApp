// Firebase 앱 초기화만 담당
// auth, firestore 등은 각 파일에서 필요할 때 직접 호출
// ex) import app from './firebase'; const db = getFirestore(app);
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyC5HidxYG-LLrch3z42J1SKE-Uume5xJmU',
  authDomain: 'react-native-project-a3902.firebaseapp.com',
  projectId: 'react-native-project-a3902',
  storageBucket: 'react-native-project-a3902.firebasestorage.app',
  messagingSenderId: '124761425586',
  appId: '1:124761425586:web:3b90af0dbfd7939f74ebab',
};

const app = initializeApp(firebaseConfig);

export default app;
