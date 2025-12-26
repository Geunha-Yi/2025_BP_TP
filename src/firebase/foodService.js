import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { db } from './config'
import { getCurrentUser } from './authService'

const FOOD_COLLECTION = 'foodItems'

// 식품 추가
export const addFood = async (foodData) => {
  try {
    const user = getCurrentUser()
    console.log('현재 사용자:', user)
    
    if (!user) {
      console.error('사용자가 로그인하지 않았습니다.')
      throw new Error('로그인이 필요합니다. 페이지를 새로고침하거나 다시 로그인해주세요.')
    }
    
    if (!user.uid) {
      console.error('사용자 UID가 없습니다.')
      throw new Error('사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.')
    }
    
    console.log('컬렉션 경로:', FOOD_COLLECTION)
    console.log('추가할 데이터:', foodData)
    
    const docRef = await addDoc(collection(db, FOOD_COLLECTION), {
      ...foodData,
      userId: user.uid, // 보안 규칙에서 사용하는 userId 필드
      expiryDate: Timestamp.fromDate(new Date(foodData.expiryDate)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
    
    console.log('식품 추가 성공:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('식품 추가 오류 상세:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    throw error
  }
}

// 식품 수정
export const updateFood = async (foodId, foodData) => {
  try {
    const user = getCurrentUser()
    console.log('식품 수정 - 현재 사용자:', user)
    
    if (!user) {
      throw new Error('로그인이 필요합니다.')
    }
    
    if (!user.uid) {
      throw new Error('사용자 정보를 가져올 수 없습니다.')
    }
    
    const foodRef = doc(db, FOOD_COLLECTION, foodId)
    console.log('식품 수정 - 문서 ID:', foodId)
    
    await updateDoc(foodRef, {
      ...foodData,
      userId: user.uid, // 업데이트 시에도 userId 유지 (보안 규칙에서 필요)
      expiryDate: Timestamp.fromDate(new Date(foodData.expiryDate)),
      updatedAt: Timestamp.now()
    })
    
    console.log('식품 수정 성공')
  } catch (error) {
    console.error('식품 수정 오류 상세:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    throw error
  }
}

// 식품 삭제
export const deleteFood = async (foodId) => {
  try {
    const user = getCurrentUser()
    console.log('식품 삭제 - 현재 사용자:', user)
    
    if (!user) {
      throw new Error('로그인이 필요합니다.')
    }
    
    console.log('식품 삭제 - 문서 ID:', foodId)
    await deleteDoc(doc(db, FOOD_COLLECTION, foodId))
    console.log('식품 삭제 성공')
  } catch (error) {
    console.error('식품 삭제 오류 상세:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    throw error
  }
}

// 모든 식품 조회
export const getAllFoods = async () => {
  try {
    const user = getCurrentUser()
    console.log('식품 조회 - 현재 사용자:', user)
    
    if (!user) {
      console.error('사용자가 로그인하지 않았습니다.')
      throw new Error('로그인이 필요합니다. 페이지를 새로고침하거나 다시 로그인해주세요.')
    }
    
    if (!user.uid) {
      console.error('사용자 UID가 없습니다.')
      throw new Error('사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.')
    }
    
    console.log('식품 조회 - 컬렉션 경로:', FOOD_COLLECTION)
    
    // 사용자별로 필터링하는 쿼리
    // 인덱스 필요: userId (오름차순) + expiryDate (오름차순)
    const q = query(
      collection(db, FOOD_COLLECTION),
      where('userId', '==', user.uid),
      orderBy('expiryDate', 'asc')
    )
    
    console.log('쿼리 실행 중...')
    const querySnapshot = await getDocs(q)
    
    console.log('식품 조회 성공 - 문서 수:', querySnapshot.docs.length)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiryDate: doc.data().expiryDate?.toDate()
    }))
  } catch (error) {
    console.error('식품 조회 오류 상세:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    throw error
  }
}

// 카테고리별 조회
export const getFoodsByCategory = async (category) => {
  try {
    const user = getCurrentUser()
    console.log('카테고리별 조회 - 현재 사용자:', user, '카테고리:', category)
    
    if (!user) {
      throw new Error('로그인이 필요합니다.')
    }
    
    if (!user.uid) {
      throw new Error('사용자 정보를 가져올 수 없습니다.')
    }
    
    // 사용자별로 필터링하고 카테고리로 필터링
    // 주의: Firestore에서 복합 쿼리를 사용하려면 인덱스가 필요할 수 있습니다
    const q = query(
      collection(db, FOOD_COLLECTION),
      where('userId', '==', user.uid),
      where('category', '==', category),
      orderBy('expiryDate', 'asc')
    )
    const querySnapshot = await getDocs(q)
    
    console.log('카테고리별 조회 성공 - 문서 수:', querySnapshot.docs.length)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiryDate: doc.data().expiryDate?.toDate()
    }))
  } catch (error) {
    console.error('카테고리별 조회 오류 상세:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    throw error
  }
}

// 저장위치별 조회
export const getFoodsByLocation = async (location) => {
  try {
    const user = getCurrentUser()
    console.log('저장위치별 조회 - 현재 사용자:', user, '저장위치:', location)
    
    if (!user) {
      throw new Error('로그인이 필요합니다.')
    }
    
    if (!user.uid) {
      throw new Error('사용자 정보를 가져올 수 없습니다.')
    }
    
    // 사용자별로 필터링하고 저장위치로 필터링
    // 주의: Firestore에서 복합 쿼리를 사용하려면 인덱스가 필요할 수 있습니다
    const q = query(
      collection(db, FOOD_COLLECTION),
      where('userId', '==', user.uid),
      where('location', '==', location),
      orderBy('expiryDate', 'asc')
    )
    const querySnapshot = await getDocs(q)
    
    console.log('저장위치별 조회 성공 - 문서 수:', querySnapshot.docs.length)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiryDate: doc.data().expiryDate?.toDate()
    }))
  } catch (error) {
    console.error('저장위치별 조회 오류 상세:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    throw error
  }
}

