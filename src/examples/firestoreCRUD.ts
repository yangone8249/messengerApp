// =============================================
// Firestore CRUD 예제 파일
// 앱과 연동 없이 독립적으로 동작하는 예제
// 실제 사용 시 각 함수를 필요한 곳에서 가져다 쓰면 됨
// =============================================

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';

import app from '@/src/services/firebase';

// 각 파일에서 이렇게 직접 호출
const db = getFirestore(app);

// =============================================
// CREATE - 문서 추가
// =============================================

/** 자동 ID로 문서 생성 */
export async function createMessage(chatId: string, text: string, senderId: string) {
  const ref = await addDoc(collection(db, 'chats', chatId, 'messages'), {
    text,
    senderId,
    createdAt: Date.now(),
  });
  return ref.id; // 생성된 문서 ID 반환
}

/** ID를 직접 지정해서 문서 생성 (유저 정보 저장 등) */
// import { setDoc } from 'firebase/firestore';
// export async function createUser(userId: string, name: string, email: string) {
//   await setDoc(doc(db, 'users', userId), { name, email });
// }

// =============================================
// READ - 문서 읽기
// =============================================

/** 단건 조회 */
export async function getMessage(chatId: string, messageId: string) {
  const snap = await getDoc(doc(db, 'chats', chatId, 'messages', messageId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/** 목록 조회 (1회성) */
export async function getMessages(chatId: string) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc'),
  );
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** 실시간 구독 - 새 메시지 올 때마다 자동 호출 */
export function subscribeMessages(
  chatId: string,
  onChange: (messages: any[]) => void,
) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc'),
  );

  // onSnapshot이 반환하는 unsubscribe 함수를 그대로 반환
  // 사용하는 쪽에서 useEffect cleanup에 넣어줘야 함
  // ex) useEffect(() => subscribeMessages(id, setMsgs), [id]);
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    onChange(messages);
  });
}

// =============================================
// UPDATE - 문서 수정
// =============================================

/** 특정 필드만 업데이트 (나머지 필드는 유지) */
export async function updateMessage(chatId: string, messageId: string, text: string) {
  await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
    text,
    updatedAt: Date.now(),
  });
}

// =============================================
// DELETE - 문서 삭제
// =============================================

export async function deleteMessage(chatId: string, messageId: string) {
  await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));
}
