<template>
  <div class="mx-auto mt-12 max-w-sm rounded-xl bg-white p-8 shadow">
    <h1 class="mb-6 text-center text-2xl font-bold">新規登録</h1>
    <form class="space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="mb-1 block text-sm font-medium">ユーザー名（ログイン用・3文字以上）</label>
        <input v-model="username" type="text" required autocomplete="username" class="w-full rounded border-slate-300" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium">表示名（ルームで表示される名前）</label>
        <input v-model="displayName" type="text" :placeholder="username" class="w-full rounded border-slate-300" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium">パスワード（6文字以上）</label>
        <input v-model="password" type="password" required autocomplete="new-password" class="w-full rounded border-slate-300" />
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {{ loading ? '登録中...' : '登録する' }}
      </button>
    </form>
    <p class="mt-4 text-center text-sm text-slate-600">
      アカウントがある場合は
      <RouterLink :to="{ name: 'login' }" class="text-indigo-600 hover:underline">ログイン</RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const displayName = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.signup(username.value, password.value, displayName.value || username.value)
    router.push('/')
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登録に失敗しました'
  } finally {
    loading.value = false
  }
}
</script>
