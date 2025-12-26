# 문제 해결 가이드

## 식품 등록 중 오류 발생 시

### 1. Firebase 설정 확인

#### Google 로그인 활성화 확인
1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 선택
3. **Authentication** → **Sign-in method** 메뉴로 이동
4. **Google** 제공업체가 **사용 설정**되어 있는지 확인
5. 지원 이메일을 설정하고 저장

#### Firestore 보안 규칙 확인
1. Firebase Console → **Firestore Database** → **규칙** 탭
2. 다음 규칙이 설정되어 있는지 확인:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/foods/{foodId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. **게시** 버튼 클릭

### 2. 브라우저 콘솔 확인

브라우저 개발자 도구(F12)를 열고 **Console** 탭에서 다음을 확인:

- `현재 사용자:` 로그에 사용자 정보가 표시되는지 확인
- `사용자 컬렉션 경로:` 로그에 올바른 경로가 표시되는지 확인
- 에러 메시지의 `code`와 `message` 확인

### 3. 일반적인 오류 해결

#### "로그인이 필요합니다" 오류
- 페이지를 새로고침하고 다시 로그인 시도
- 브라우저 쿠키/캐시 삭제 후 재시도

#### "Missing or insufficient permissions" 또는 "permission-denied" 오류

이 오류는 Firestore 보안 규칙 문제입니다. 다음을 확인하세요:

1. **Firebase Console에서 보안 규칙 확인**
   - Firebase Console → Firestore Database → 규칙 탭
   - 다음 규칙이 정확히 입력되어 있는지 확인:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/foods/{foodId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

2. **규칙 게시 확인**
   - 규칙을 수정한 후 반드시 **게시** 버튼을 클릭해야 합니다
   - 게시하지 않으면 변경사항이 적용되지 않습니다

3. **사용자 인증 확인**
   - 브라우저 콘솔에서 `현재 사용자:` 로그 확인
   - 사용자 UID가 올바르게 표시되는지 확인
   - 네비게이션 바에 이메일이 표시되는지 확인

4. **임시 해결 방법 (개발용)**
   - 개발 단계에서만 사용: 규칙을 다음으로 변경
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/foods/{foodId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   - ⚠️ 프로덕션에서는 반드시 원래 규칙으로 되돌려야 합니다!

#### "network" 오류
- 인터넷 연결 확인
- Firebase 프로젝트가 활성화되어 있는지 확인

### 4. 디버깅 단계

1. **로그인 상태 확인**
   - 네비게이션 바에 이메일이 표시되는지 확인
   - 표시되지 않으면 다시 로그인

2. **콘솔 로그 확인**
   - 브라우저 콘솔에서 상세한 에러 메시지 확인
   - `식품 추가 오류 상세:` 로그 확인

3. **Firebase Console 확인**
   - Firestore Database에서 데이터가 생성되는지 확인
   - Authentication에서 사용자가 등록되어 있는지 확인

### 5. 여전히 해결되지 않는 경우

1. 브라우저 콘솔의 전체 에러 메시지를 복사
2. Firebase Console의 보안 규칙 스크린샷
3. 문제가 발생한 정확한 단계 설명

이 정보들을 함께 확인하면 문제를 더 빠르게 해결할 수 있습니다.

