<template>
  <div class="mx-auto mt-12 max-w-sm rounded-xl bg-white p-8 shadow">
    <h1 class="mb-6 text-center text-2xl font-bold">ログイン</h1>
    <form class="space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="mb-1 block text-sm font-medium">ユーザー名</label>
        <input v-model="username" type="text" required autocomplete="username" class="w-full rounded border-slate-300" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium">パスワード</label>
        <input v-model="password" type="password" required autocomplete="current-password" class="w-full rounded border-slate-300" />
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {{ loading ? 'ログイン中...' : 'ログイン' }}
      </button>
    </form>
    <p class="mt-4 text-center text-sm text-slate-600">
      アカウントがない場合は
      <RouterLink :to="{ name: 'signup' }" class="text-indigo-600 hover:underline">新規登録</RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'ログインに失敗しました'
  } finally {
    loading.value = false
  }
}
</script>
