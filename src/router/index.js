import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import AddFood from '../views/AddFood.vue'
import FoodList from '../views/FoodList.vue'
import Login from '../views/Login.vue'
import { onAuthChange } from '../firebase/authService'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/add',
    name: 'AddFood',
    component: AddFood,
    meta: { requiresAuth: true }
  },
  {
    path: '/list',
    name: 'FoodList',
    component: FoodList,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 라우터 가드 설정
let currentUser = null
let authReady = false

// 인증 상태 초기화
onAuthChange((user) => {
  currentUser = user
  authReady = true
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (!authReady) {
    // 인증 상태 확인 대기
    const unsubscribe = onAuthChange((user) => {
      currentUser = user
      authReady = true
      unsubscribe()
      
      if (requiresAuth && !currentUser) {
        next('/login')
      } else if (requiresGuest && currentUser) {
        next('/')
      } else {
        next()
      }
    })
  } else {
    if (requiresAuth && !currentUser) {
      next('/login')
    } else if (requiresGuest && currentUser) {
      next('/')
    } else {
      next()
    }
  }
})

export default router

