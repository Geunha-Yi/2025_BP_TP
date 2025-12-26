# 스마트 냉장고 웹 애플리케이션

Vue.js와 Firebase를 활용한 냉장고 식품 관리 웹 애플리케이션입니다.

## 주요 기능

- ✅ 사용자 인증 (로그인/회원가입/로그아웃)
- ✅ 식품 등록 및 관리
- ✅ 냉장고 내 식품 확인
- ✅ 유통기한 임박 알림 (3일 이내)
- ✅ 카테고리별 필터링
- ✅ 저장위치별 구분 (냉장고/냉동고/실온)
- ✅ 사용자별 데이터 분리 저장

## 기술 스택

- **Frontend**: Vue.js 3, Vue Router
- **Backend**: Firebase (Firestore)
- **빌드 도구**: Vite
- **스타일링**: CSS3

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트를 생성합니다.
2. **Authentication**을 활성화하고 **Google** 로그인 방법을 사용 설정합니다.
3. **Firestore Database**를 활성화합니다.
4. `src/firebase/config.js` 파일에서 Firebase 설정 정보를 입력합니다:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### 3. Firestore 보안 규칙 설정

**중요**: 이 단계를 반드시 완료해야 합니다!

Firebase Console에서 Firestore 보안 규칙을 다음과 같이 설정합니다:

1. [Firebase Console](https://console.firebase.google.com/) → 프로젝트 선택
2. **Firestore Database** → **규칙** 탭 클릭
3. 다음 규칙을 복사하여 붙여넣기:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /foodItems/{document=**} {
      // 읽기: 로그인한 사용자가 자신의 데이터만 읽을 수 있음
      allow read: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      
      // 쓰기(생성, 수정, 삭제): 로그인한 사용자가 자신의 데이터만 수정할 수 있음
      allow write: if request.auth != null && 
        (request.resource == null || request.resource.data.userId == request.auth.uid);
    }
  }
}
```

4. **게시** 버튼을 클릭하여 규칙을 저장합니다.

**주의사항:**
- 규칙을 게시하지 않으면 "Missing or insufficient permissions" 오류가 발생합니다
- 규칙 변경 후 몇 초 정도 걸릴 수 있습니다
- 프로젝트 루트에 `firestore.rules` 파일도 참고하세요

이 규칙은 사용자가 자신의 데이터만 접근할 수 있도록 보장합니다.

**중요**: 복합 쿼리(여러 `where` 조건 + `orderBy`)를 사용하는 경우 Firestore 인덱스가 필요할 수 있습니다. 
오류 메시지에 인덱스 생성 링크가 포함되어 있으면 해당 링크를 클릭하여 인덱스를 생성하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

### 5. 빌드

```bash
npm run build
```

## 프로젝트 구조

```
src/
├── firebase/
│   ├── config.js          # Firebase 설정
│   ├── authService.js     # Firebase Auth 서비스
│   └── foodService.js     # Firestore CRUD 서비스
├── router/
│   └── index.js           # Vue Router 설정 (인증 가드 포함)
├── views/
│   ├── Home.vue           # 홈 페이지
│   ├── Login.vue          # 로그인/회원가입 페이지
│   ├── AddFood.vue        # 식품 등록 페이지
│   └── FoodList.vue       # 식품 목록 페이지
├── App.vue                # 메인 앱 컴포넌트
├── main.js                # 앱 진입점
└── style.css              # 전역 스타일
```

## 사용 방법

1. **로그인**: Google 계정으로 간편하게 로그인합니다.
2. **식품 등록**: 상단 메뉴에서 "식품 등록"을 클릭하여 냉장고에 넣은 식품을 등록합니다.
3. **냉장고 보기**: "냉장고 보기"에서 등록된 모든 식품을 확인할 수 있습니다.
4. **필터링**: 카테고리, 저장위치별로 필터링하여 원하는 식품을 찾을 수 있습니다.
5. **유통기한 알림**: 유통기한이 3일 이내인 식품은 자동으로 알림이 표시됩니다.
6. **로그아웃**: 상단 네비게이션 바에서 로그아웃할 수 있습니다.

## 보안

- 모든 식품 데이터는 사용자별로 분리되어 저장됩니다.
- 인증되지 않은 사용자는 식품 등록/조회 기능에 접근할 수 없습니다.
- Firestore 보안 규칙을 통해 사용자는 자신의 데이터만 접근할 수 있습니다.

## 라이선스

MIT

