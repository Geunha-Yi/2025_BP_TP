import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Firebase 설정
// 실제 프로젝트에서는 환경 변수로 관리하세요
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
}

// Firebase 초기화
const app = initializeApp(firebaseConfig)

// Firestore 및 Auth 인스턴스
export const db = getFirestore(app)
export const auth = getAuth(app)
export default app

