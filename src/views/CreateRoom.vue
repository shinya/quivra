<template>
  <div class="mx-auto max-w-xl rounded-xl bg-white p-8 shadow">
    <h1 class="mb-6 text-2xl font-bold">ルームを作る</h1>
    <form class="space-y-5" @submit.prevent="onSubmit">
      <div>
        <label class="mb-1 block text-sm font-medium">ルーム名</label>
        <input v-model="name" type="text" required maxlength="100" class="w-full rounded border-slate-300" />
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium">問い読み方式</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2">
            <input v-model="readingMode" type="radio" value="text" />
            <span>画面に文字表示<span class="block text-xs text-slate-500">1文字ずつ表示される</span></span>
          </label>
          <label class="flex items-center gap-2">
            <input v-model="readingMode" type="radio" value="oral" />
            <span>自分で読み上げる<span class="block text-xs text-slate-500">回答者に問題文は出ない</span></span>
          </label>
        </div>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium">出題リスト</label>
        <select v-model="questionSetId" class="w-full rounded border-slate-300">
          <option v-if="readingMode === 'oral'" :value="null">リストなし（自分で問題を用意）</option>
          <option v-for="set in sets" :key="set.id" :value="set.id">
            {{ set.name }}（{{ set.question_count }}問）
          </option>
        </select>
        <p v-if="readingMode === 'text'" class="mt-1 text-xs text-slate-500">文字表示方式では出題リストが必要です</p>
      </div>

      <div v-if="questionSetId !== null">
        <label class="mb-1 block text-sm font-medium">出題順</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2">
            <input v-model="questionOrder" type="radio" value="sequential" />
            <span>順番どおり<span class="block text-xs text-slate-500">リストの並び順に出題</span></span>
          </label>
          <label class="flex items-center gap-2">
            <input v-model="questionOrder" type="radio" value="random" />
            <span>ランダム<span class="block text-xs text-slate-500">毎回シャッフルして出題</span></span>
          </label>
        </div>
      </div>

      <div v-if="readingMode === 'text'">
        <label class="mb-1 block text-sm font-medium">文字送り速度: {{ charIntervalMs }}ms/文字</label>
        <input v-model.number="charIntervalMs" type="range" min="50" max="500" step="10" class="w-full" />
        <div class="flex justify-between text-xs text-slate-500"><span>速い (50ms)</span><span>遅い (500ms)</span></div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium">正解ポイント</label>
          <input v-model.number="pointsCorrect" type="number" min="1" max="1000" class="w-full rounded border-slate-300" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">誤答ペナルティ（0 = なし）</label>
          <input v-model.number="pointsWrong" type="number" min="0" max="1000" class="w-full rounded border-slate-300" />
        </div>
      </div>

      <label class="flex items-center gap-2">
        <input v-model="allowDropIn" type="checkbox" class="rounded" />
        <span>飛び入り参加OK<span class="block text-xs text-slate-500">クイズ開始後でも回答者として参加できる</span></span>
      </label>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {{ loading ? '作成中...' : 'ルームを作成' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { QuestionSet, Room } from '@/types'
import { api } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const sets = ref<QuestionSet[]>([])
const name = ref(auth.user ? `${auth.user.display_name}のルーム` : '')
const readingMode = ref<'text' | 'oral'>('text')
const questionOrder = ref<'sequential' | 'random'>('sequential')
const questionSetId = ref<number | null>(null)
const charIntervalMs = ref(150)
const pointsCorrect = ref(10)
const pointsWrong = ref(0)
const allowDropIn = ref(false)
const error = ref('')
const loading = ref(false)

watch(readingMode, (mode) => {
  // text モードはリスト必須なので先頭を選択
  if (mode === 'text' && questionSetId.value === null && sets.value.length > 0) {
    questionSetId.value = sets.value[0].id
  }
})

onMounted(async () => {
  try {
    const res = await api<{ sets: QuestionSet[] }>('/api/question-sets')
    sets.value = res.sets
    if (readingMode.value === 'text' && sets.value.length > 0) {
      questionSetId.value = sets.value[0].id
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '出題リストの取得に失敗しました'
  }
})

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const res = await api<{ room: Room }>('/api/rooms', {
      method: 'POST',
      body: {
        name: name.value,
        question_set_id: questionSetId.value,
        reading_mode: readingMode.value,
        question_order: questionOrder.value,
        char_interval_ms: charIntervalMs.value,
        points_correct: pointsCorrect.value,
        points_wrong: pointsWrong.value,
        allow_drop_in: allowDropIn.value,
      },
    })
    router.push({ name: 'room', params: { id: res.room.id } })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'ルーム作成に失敗しました'
  } finally {
    loading.value = false
  }
}
</script>
