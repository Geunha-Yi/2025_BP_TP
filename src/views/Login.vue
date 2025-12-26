<template>
  <div class="login">
    <div class="login-card">
      <h2>스마트 냉장고 로그인</h2>
      <p class="subtitle">Google 계정으로 간편하게 로그인하세요</p>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button 
        @click="handleGoogleLogin" 
        class="btn btn-google" 
        :disabled="loading"
      >
        <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {{ loading ? '로그인 중...' : 'Google로 로그인' }}
      </button>
    </div>
  </div>
</template>

<script>
import { signInWithGoogle } from '../firebase/authService'

export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      error: ''
    }
  },
  methods: {
    async handleGoogleLogin() {
      this.loading = true
      this.error = ''

      try {
        const result = await signInWithGoogle()

        if (result.error) {
          // Firebase 오류 메시지를 한국어로 변환
          this.error = this.translateError(result.error)
        } else {
          // 로그인 성공 시 홈으로 이동
          this.$router.push('/')
        }
      } catch (error) {
        this.error = '로그인 중 오류가 발생했습니다. 다시 시도해주세요.'
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    translateError(errorMessage) {
      const errorMap = {
        'auth/popup-closed-by-user': '로그인 창이 닫혔습니다.',
        'auth/cancelled-popup-request': '로그인이 취소되었습니다.',
        'auth/popup-blocked': '팝업이 차단되었습니다. 브라우저 설정을 확인해주세요.',
        'auth/network-request-failed': '네트워크 오류가 발생했습니다.',
        'auth/too-many-requests': '너무 많은 시도가 있었습니다. 나중에 다시 시도해주세요.'
      }

      for (const [key, value] of Object.entries(errorMap)) {
        if (errorMessage.includes(key)) {
          return value
        }
      }

      return '로그인 중 오류가 발생했습니다. 다시 시도해주세요.'
    }
  }
}
</script>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
}

.login-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 3rem;
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px 0 rgba(31, 38, 135, 0.2);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-card h2 {
  color: white;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.error-message {
  padding: 1rem;
  background: rgba(244, 67, 54, 0.3);
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 15px;
  border: 1px solid rgba(244, 67, 54, 0.5);
  text-align: center;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.btn-google {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: white;
  color: #333;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-google:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  background: #f8f9fa;
}

.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-icon {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .login-card {
    padding: 2rem 1.5rem;
  }
  
  .login-card h2 {
    font-size: 1.5rem;
  }
}
</style>
