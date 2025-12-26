<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <h1 class="logo">스마트 냉장고</h1>
        <ul class="nav-menu">
          <li><router-link to="/" class="nav-link">홈</router-link></li>
          <li v-if="user">
            <router-link to="/add" class="nav-link">식품 등록</router-link>
          </li>
          <li v-if="user">
            <router-link to="/list" class="nav-link">냉장고 보기</router-link>
          </li>
        </ul>
        <div class="auth-section">
          <span v-if="user" class="user-email">{{ user.email }}</span>
          <button v-if="user" @click="handleLogout" class="btn-logout">로그아웃</button>
          <router-link v-else to="/login" class="btn-login">로그인</router-link>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="router-view" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script>
import { onAuthChange, logout, getCurrentUser } from './firebase/authService'

export default {
  name: 'App',
  data() {
    return {
      user: null
    }
  },
  mounted() {
    // 인증 상태 변경 감지
    onAuthChange((user) => {
      this.user = user
    })
    
    // 초기 사용자 상태 설정
    this.user = getCurrentUser()
  },
  methods: {
    async handleLogout() {
      if (confirm('로그아웃 하시겠습니까?')) {
        const result = await logout()
        if (!result.error) {
          this.$router.push('/login')
        } else {
          alert('로그아웃 중 오류가 발생했습니다.')
        }
      }
    }
  }
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe);
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
  position: relative;
  overflow-x: hidden;
  will-change: background-position;
}

.navbar {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px 0 rgba(31, 38, 135, 0.2);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.nav-link {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 10px;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-link:hover::before,
.nav-link.router-link-active::before {
  opacity: 1;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: white;
  transform: translateY(-2px);
}

.auth-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-email {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.btn-logout,
.btn-login {
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-logout {
  background: rgba(244, 67, 54, 0.8);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-logout:hover {
  background: rgba(211, 47, 47, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

.btn-login {
  background: rgba(102, 126, 234, 0.8);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-login:hover {
  background: rgba(102, 126, 234, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

/* 라우터 뷰 전환 애니메이션 */
.router-view-enter-active,
.router-view-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.router-view-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.router-view-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}

.router-view-enter-to,
.router-view-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-menu {
    gap: 1rem;
  }
}
</style>

