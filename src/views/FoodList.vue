<template>
  <div class="food-list">
    <div class="header">
      <h2>냉장고 보기</h2>
      <router-link to="/add" class="btn btn-primary">+ 식품 추가</router-link>
    </div>

    <!-- 필터 섹션 -->
    <div class="filters">
      <div class="filter-group">
        <label>카테고리</label>
        <select v-model="selectedCategory" @change="applyFilters">
          <option value="">전체</option>
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

      <div class="filter-group">
        <label>저장위치</label>
        <select v-model="selectedLocation" @change="applyFilters">
          <option value="">전체</option>
          <option value="냉장고">냉장고</option>
          <option value="냉동고">냉동고</option>
          <option value="실온">실온</option>
        </select>
      </div>

      <div class="filter-group">
        <label>정렬</label>
        <select v-model="sortBy" @change="applyFilters">
          <option value="expiryDate">유통기한순</option>
          <option value="name">이름순</option>
          <option value="category">카테고리순</option>
        </select>
      </div>
    </div>

    <!-- 알림 섹션 -->
    <div v-if="expiringSoon.length > 0" class="alert-section">
      <div class="alert alert-warning">
        <h3>⚠️ 유통기한 임박 알림</h3>
        <p>{{ expiringSoon.length }}개의 식품이 곧 유통기한이 만료됩니다!</p>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading">
      데이터를 불러오는 중...
    </div>

    <!-- 식품 목록 -->
    <div v-else-if="filteredFoods.length > 0" class="food-grid">
      <div
        v-for="food in filteredFoods"
        :key="food.id"
        :class="['food-card', getExpiryStatus(food.expiryDate)]"
      >
        <div class="food-header">
          <h3>{{ food.name }}</h3>
          <button @click="deleteFoodItem(food.id)" class="delete-btn">×</button>
        </div>
        <div class="food-info">
          <div class="info-item">
            <span class="label">카테고리:</span>
            <span class="value">{{ food.category }}</span>
          </div>
          <div class="info-item">
            <span class="label">저장위치:</span>
            <span class="value">{{ food.location }}</span>
          </div>
          <div class="info-item">
            <span class="label">유통기한:</span>
            <span :class="['value', getExpiryStatus(food.expiryDate)]">
              {{ formatDate(food.expiryDate) }}
              <span class="days-left">({{ getDaysLeft(food.expiryDate) }})</span>
            </span>
          </div>
          <div v-if="food.quantity" class="info-item">
            <span class="label">수량:</span>
            <span class="value">{{ food.quantity }}</span>
          </div>
          <div v-if="food.memo" class="info-item memo">
            <span class="label">메모:</span>
            <span class="value">{{ food.memo }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state">
      <p>등록된 식품이 없습니다.</p>
      <router-link to="/add" class="btn btn-primary">식품 등록하기</router-link>
    </div>
  </div>
</template>

<script>
import { getAllFoods, deleteFood } from '../firebase/foodService'
import { format, differenceInDays } from 'date-fns'
import { ko } from 'date-fns/locale'

export default {
  name: 'FoodList',
  data() {
    return {
      foods: [],
      filteredFoods: [],
      selectedCategory: '',
      selectedLocation: '',
      sortBy: 'expiryDate',
      loading: true
    }
  },
  computed: {
    expiringSoon() {
      return this.foods.filter(food => {
        const daysLeft = this.getDaysLeft(food.expiryDate)
        return daysLeft >= 0 && daysLeft <= 3
      })
    }
  },
  async mounted() {
    await this.loadFoods()
  },
  methods: {
    async loadFoods() {
      this.loading = true
      try {
        this.foods = await getAllFoods()
        this.applyFilters()
      } catch (error) {
        console.error('식품 목록 로드 오류:', error)
        let errorMessage = '식품 목록을 불러오는 중 오류가 발생했습니다.'
        
        if (error.message) {
          if (error.message.includes('로그인이 필요합니다')) {
            errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.'
            setTimeout(() => {
              this.$router.push('/login')
            }, 2000)
          } else if (error.message.includes('permission-denied')) {
            errorMessage = '권한이 없습니다. Firebase 설정을 확인해주세요.'
          } else {
            errorMessage = `오류: ${error.message}`
          }
        }
        
        alert(errorMessage)
      } finally {
        this.loading = false
      }
    },
    applyFilters() {
      let filtered = [...this.foods]

      // 카테고리 필터
      if (this.selectedCategory) {
        filtered = filtered.filter(food => food.category === this.selectedCategory)
      }

      // 저장위치 필터
      if (this.selectedLocation) {
        filtered = filtered.filter(food => food.location === this.selectedLocation)
      }

      // 정렬
      filtered.sort((a, b) => {
        if (this.sortBy === 'expiryDate') {
          return new Date(a.expiryDate) - new Date(b.expiryDate)
        } else if (this.sortBy === 'name') {
          return a.name.localeCompare(b.name)
        } else if (this.sortBy === 'category') {
          return a.category.localeCompare(b.category)
        }
        return 0
      })

      this.filteredFoods = filtered
    },
    async deleteFoodItem(foodId) {
      if (confirm('정말 삭제하시겠습니까?')) {
        try {
          await deleteFood(foodId)
          await this.loadFoods()
        } catch (error) {
          console.error('삭제 오류:', error)
          alert('삭제 중 오류가 발생했습니다.')
        }
      }
    },
    formatDate(date) {
      if (!date) return ''
      return format(new Date(date), 'yyyy년 MM월 dd일', { locale: ko })
    },
    getDaysLeft(expiryDate) {
      if (!expiryDate) return ''
      const days = differenceInDays(new Date(expiryDate), new Date())
      return days
    },
    getExpiryStatus(expiryDate) {
      if (!expiryDate) return ''
      const days = this.getDaysLeft(expiryDate)
      if (days < 0) return 'expired'
      if (days <= 3) return 'expiring-soon'
      if (days <= 7) return 'expiring-week'
      return 'normal'
    }
  }
}
</script>

<style scoped>
.food-list {
  padding: 2rem 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px 0 rgba(31, 38, 135, 0.2);
}

.header h2 {
  color: white;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px 0 rgba(31, 38, 135, 0.2);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 150px;
}

.filter-group label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9rem;
}

.filter-group select {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  font-size: 0.9rem;
  color: white;
  transition: all 0.3s ease;
}

.filter-group select option {
  background: #667eea;
  color: white;
}

.filter-group select:focus {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  outline: none;
}

.alert-section {
  margin-bottom: 2rem;
}

.alert {
  padding: 1.5rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px 0 rgba(31, 38, 135, 0.2);
}

.alert-warning {
  background: rgba(255, 193, 7, 0.3);
  border: 1px solid rgba(255, 193, 7, 0.5);
  color: white;
}

.alert h3 {
  margin: 0 0 0.5rem 0;
}

.alert p {
  margin: 0;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.food-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px 0 rgba(31, 38, 135, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-left: 4px solid rgba(102, 126, 234, 0.8);
}

.food-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px 0 rgba(31, 38, 135, 0.3);
}

.food-card.expiring-soon {
  border-left-color: rgba(255, 152, 0, 0.8);
  background: rgba(255, 193, 7, 0.2);
}

.food-card.expired {
  border-left-color: rgba(244, 67, 54, 0.8);
  background: rgba(244, 67, 54, 0.2);
}

.food-card.expiring-week {
  border-left-color: rgba(255, 193, 7, 0.8);
}

.food-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.food-header h3 {
  margin: 0;
  color: white;
  font-size: 1.3rem;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.delete-btn {
  background: rgba(244, 67, 54, 0.8);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 1;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.delete-btn:hover {
  background: rgba(211, 47, 47, 0.9);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.food-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  gap: 0.5rem;
}

.info-item .label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  min-width: 80px;
}

.info-item .value {
  color: rgba(255, 255, 255, 0.95);
}

.info-item .value.expiring-soon {
  color: #ffc107;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
}

.info-item .value.expired {
  color: #ff5252;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(255, 82, 82, 0.5);
}

.days-left {
  font-size: 0.9rem;
  margin-left: 0.5rem;
}

.info-item.memo {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px 0 rgba(31, 38, 135, 0.2);
}

.empty-state p {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}


.btn-primary {
  background: rgba(102, 126, 234, 0.8);
  color: white;
}

.btn-primary:hover {
  background: rgba(102, 126, 234, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .food-grid {
    grid-template-columns: 1fr;
  }
}
</style>

