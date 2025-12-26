<template>
  <div class="home">
    <div class="hero">
      <h1>스마트 냉장고에 오신 것을 환영합니다!</h1>
      <p>냉장고 속 식품을 효율적으로 관리하고 유통기한을 놓치지 마세요</p>
      <div v-if="!user" class="login-prompt">
        <p>서비스를 이용하시려면 로그인이 필요합니다.</p>
        <router-link to="/login" class="btn btn-primary">로그인하기</router-link>
      </div>
      <div v-else class="hero-buttons">
        <router-link to="/add" class="btn btn-primary">식품 등록하기</router-link>
        <router-link to="/list" class="btn btn-secondary">냉장고 보기</router-link>
      </div>
    </div>

    <div class="features">
      <div class="feature-card">
        <div class="feature-icon">📝</div>
        <h3>식품 등록</h3>
        <p>냉장고에 넣은 식품을 쉽게 등록하고 관리하세요</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⏰</div>
        <h3>유통기한 알림</h3>
        <p>유통기한이 임박한 식품을 자동으로 알려드립니다</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔍</div>
        <h3>카테고리 필터</h3>
        <p>카테고리별로 식품을 쉽게 찾아보세요</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📍</div>
        <h3>저장위치 관리</h3>
        <p>냉장고, 냉동고 등 저장위치별로 구분하세요</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentUser, onAuthChange } from '../firebase/authService'

export default {
  name: 'Home',
  data() {
    return {
      user: null
    }
  },
  mounted() {
    this.user = getCurrentUser()
    onAuthChange((user) => {
      this.user = user
    })
  }
}
</script>

<style scoped>
.home {
  padding: 2rem 0;
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  box-shadow: 0 4px 20px 0 rgba(31, 38, 135, 0.2);
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.hero p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.login-prompt p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.btn {
  padding: 0.75rem 2rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}


.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: rgba(102, 126, 234, 0.8);
  color: white;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px 0 rgba(31, 38, 135, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px 0 rgba(31, 38, 135, 0.3);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.2));
}

.feature-card h3 {
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.feature-card p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }
  
  .hero p {
    font-size: 1rem;
  }
}
</style>

