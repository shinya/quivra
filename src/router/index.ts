import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: () => import('@/views/Login.vue'), meta: { guest: true } },
    { path: '/signup', name: 'signup', component: () => import('@/views/Signup.vue'), meta: { guest: true } },
    { path: '/', name: 'home', component: () => import('@/views/Home.vue') },
    { path: '/rooms/new', name: 'create-room', component: () => import('@/views/CreateRoom.vue') },
    { path: '/rooms/:id', name: 'room', component: () => import('@/views/Room.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.restore()

  if (to.meta.guest) {
    if (auth.isLoggedIn()) return { name: 'home' }
    return true
  }
  if (!auth.isLoggedIn()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
