import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import { api, getToken, setToken } from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const initialized = ref(false)

  const isLoggedIn = () => user.value !== null

  async function signup(username: string, password: string, displayName: string) {
    const res = await api<{ user: User; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: { username, password, display_name: displayName },
    })
    setToken(res.token)
    user.value = res.user
  }

  async function login(username: string, password: string) {
    const res = await api<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    setToken(res.token)
    user.value = res.user
  }

  function logout() {
    setToken(null)
    user.value = null
  }

  // 起動時にトークンからユーザーを復元する
  async function restore() {
    if (initialized.value) return
    initialized.value = true
    if (!getToken()) return
    try {
      const res = await api<{ user: User }>('/api/auth/me')
      user.value = res.user
    } catch {
      setToken(null)
    }
  }

  return { user, isLoggedIn, signup, login, logout, restore }
})
