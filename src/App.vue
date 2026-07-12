<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <header class="bg-indigo-700 text-white shadow">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <RouterLink to="/" class="text-xl font-bold tracking-wide">⚡ Quivra</RouterLink>
        <div v-if="auth.user" class="flex items-center gap-3 text-sm">
          <span class="opacity-90">{{ auth.user.display_name }}</span>
          <button class="rounded bg-indigo-600 px-3 py-1 hover:bg-indigo-500" @click="onLogout">
            ログアウト
          </button>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function onLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>
