import { collection, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from 'firebase/firestore';
import app from './firebase';

const db = getFirestore(app);
const COLLECTION = 'users';


export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  createdAt: Date;
}

// 회원가입 시 Firestore에 유저 정보 저장
// 경로 : DB/users/[파일명]
export const createUserProfile = async (uid: string, email: string, name: string) => {
  console.log("userService 진입");
  console.log("uid : "+uid+ "email : "+email+ "name : "+name);
  await setDoc(doc(db, COLLECTION, uid), {
    uid,
    email,
    name,
    createdAt: new Date(),
  });
};

// 특정 유저 1명 조회 (uid로)
export const getUser = async (uid: string): Promise<UserProfile | null> => {
  const snapshot = await getDoc(doc(db, COLLECTION, uid));
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
};

// 전체 유저 목록 조회
export const getUsers = async (): Promise<UserProfile[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(doc => doc.data() as UserProfile);
};

// 이름으로 유저 검색
export const searchUsersByName = async (name: string): Promise<UserProfile[]> => {
  const q = query(collection(db, COLLECTION), where('name', '==', name));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as UserProfile);
};

// 이메일로 유저 조회
export const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
  const q = query(collection(db, COLLECTION), where('email', '==', email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as UserProfile;
};