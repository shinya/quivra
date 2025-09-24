import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/room/:id',
      name: 'room',
      component: () => import('../views/Room.vue'),
    },
    {
      path: '/create-question',
      name: 'create-question',
      component: () => import('../views/CreateQuestion.vue'),
    },
    {
      path: '/test-connection',
      name: 'test-connection',
      component: () => import('../views/TestConnection.vue'),
    },
  ],
})

export default router
