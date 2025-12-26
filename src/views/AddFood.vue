<template>
  <div class="add-food">
    <div class="card">
      <h2>식품 등록</h2>
      <form @submit.prevent="handleSubmit" class="food-form">
        <div class="form-group">
          <label for="name">식품명 *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            placeholder="예: 우유, 계란, 사과"
          />
        </div>

        <div class="form-group">
          <label for="category">카테고리 *</label>
          <select id="category" v-model="form.category" required>
            <option value="">선택하세요</option>
            <option value="과일">과일</option>
            <option value="채소">채소</option>
            <option value="육류">육류</option>
            <option value="해산물">해산물</option>
            <option value="유제품">유제품</option>
            <option value="냉동식품">냉동식품</option>
            <option value="조미료">조미료</option>
            <option value="음료">음료</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div class="form-group">
          <label for="location">저장위치 *</label>
          <select id="location" v-model="form.location" required>
            <option value="">선택하세요</option>
            <option value="냉장고">냉장고</option>
            <option value="냉동고">냉동고</option>
            <option value="실온">실온</option>
          </select>
        </div>

        <div class="form-group">
          <label for="expiryDate">유통기한 *</label>
          <input
            id="expiryDate"
            v-model="form.expiryDate"
            type="date"
            required
          />
        </div>

        <div class="form-group">
          <label for="quantity">수량</label>
          <input
            id="quantity"
            v-model.number="form.quantity"
            type="number"
            min="1"
            placeholder="예: 1"
          />
        </div>

        <div class="form-group">
          <label for="memo">메모</label>
          <textarea
            id="memo"
            v-model="form.memo"
            rows="3"
            placeholder="추가 정보를 입력하세요"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '등록 중...' : '등록하기' }}
          </button>
          <router-link to="/list" class="btn btn-secondary">취소</router-link>
        </div>
      </form>

      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
import { addFood } from '../firebase/foodService'
import { getCurrentUser, onAuthChange } from '../firebase/authService'

export default {
  name: 'AddFood',
  data() {
    return {
      form: {
        name: '',
        category: '',
        location: '',
        expiryDate: '',
        quantity: 1,
        memo: ''
      },
      loading: false,
      message: '',
      messageType: '',
      user: null
    }
  },
  mounted() {
    // 사용자 인증 상태 확인
    this.user = getCurrentUser()
    
    if (!this.user) {
      this.showMessage('로그인이 필요합니다. 로그인 페이지로 이동합니다.', 'error')
      setTimeout(() => {
        this.$router.push('/login')
      }, 2000)
      return
    }
    
    // 인증 상태 변경 감지
    onAuthChange((user) => {
      this.user = user
      if (!user) {
        this.showMessage('로그인 세션이 만료되었습니다. 다시 로그인해주세요.', 'error')
        setTimeout(() => {
          this.$router.push('/login')
        }, 2000)
      }
    })
  },
  methods: {
    async handleSubmit() {
      // 사용자 인증 재확인
      const currentUser = getCurrentUser()
      if (!currentUser) {
        this.showMessage('로그인이 필요합니다. 다시 로그인해주세요.', 'error')
        setTimeout(() => {
          this.$router.push('/login')
        }, 2000)
        return
      }
      
      this.loading = true
      this.message = ''

      try {
        await addFood(this.form)
        this.showMessage('식품이 성공적으로 등록되었습니다!', 'success')
        this.resetForm()
        
        // 2초 후 목록 페이지로 이동
        setTimeout(() => {
          this.$router.push('/list')
        }, 2000)
      } catch (error) {
        console.error('식품 등록 오류:', error)
        let errorMessage = '등록 중 오류가 발생했습니다.'
        
        if (error.message) {
          if (error.message.includes('로그인이 필요합니다')) {
            errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.'
          } else if (error.message.includes('permission-denied') || error.message.includes('Missing or insufficient permissions')) {
            errorMessage = '권한 오류: Firestore 보안 규칙을 확인해주세요. Firebase Console → Firestore → 규칙에서 규칙을 확인하고 게시하세요.'
          } else if (error.message.includes('network')) {
            errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.'
          } else {
            errorMessage = `오류: ${error.message}`
          }
        } else if (error.code === 'permission-denied') {
          errorMessage = '권한 오류: Firestore 보안 규칙을 확인해주세요. Firebase Console → Firestore → 규칙에서 규칙을 확인하고 게시하세요.'
        }
        
        this.showMessage(errorMessage, 'error')
      } finally {
        this.loading = false
      }
    },
    resetForm() {
      this.form = {
        name: '',
        category: '',
        location: '',
        expiryDate: '',
        quantity: 1,
        memo: ''
      }
    },
    showMessage(text, type) {
      this.message = text
      this.messageType = type
      setTimeout(() => {
        this.message = ''
      }, 3000)
    }
  }
}
</script>

<style scoped>
.add-food {
  padding: 2rem 0;
}

.card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px 0 rgba(31, 38, 135, 0.2);
  max-width: 600px;
  margin: 0 auto;
}

.card h2 {
  color: white;
  margin-bottom: 2rem;
  text-align: center;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.food-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  position: relative;
  z-index: 1;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  font-size: 1rem;
  color: white;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-group select option {
  background: #667eea;
  color: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  outline: none;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 1;
}


.btn-primary {
  background: rgba(102, 126, 234, 0.8);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 15px;
  text-align: center;
  font-weight: 500;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
  animation: fadeIn 0.5s ease-out;
}

.message.success {
  background: rgba(40, 167, 69, 0.3);
  color: white;
  border: 1px solid rgba(40, 167, 69, 0.5);
}

.message.error {
  background: rgba(244, 67, 54, 0.3);
  color: white;
  border: 1px solid rgba(244, 67, 54, 0.5);
}
</style>

