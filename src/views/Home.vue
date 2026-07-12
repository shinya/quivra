<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">ルーム一覧</h1>
      <RouterLink
        :to="{ name: 'create-room' }"
        class="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
      >
        ＋ ルームを作る
      </RouterLink>
    </div>

    <div class="mb-4 flex gap-2">
      <button
        v-for="f in filters"
        :key="f.value"
        class="rounded-full px-4 py-1 text-sm font-medium"
        :class="filter === f.value ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'"
        @click="setFilter(f.value)"
      >
        {{ f.label }}
      </button>
      <button class="ml-auto rounded-full bg-white px-4 py-1 text-sm text-slate-600 hover:bg-slate-50" @click="load">
        ↻ 更新
      </button>
    </div>

    <p v-if="error" class="mb-4 text-sm text-red-600">{{ error }}</p>

    <div v-if="rooms.length === 0" class="rounded-xl bg-white p-10 text-center text-slate-500 shadow-sm">
      表示できるルームがありません。ルームを作って友達を招待しましょう！
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <RouterLink
        v-for="room in rooms"
        :key="room.id"
        :to="{ name: 'room', params: { id: room.id } }"
        class="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <div class="mb-2 flex items-center justify-between">
          <h2 class="truncate text-lg font-bold">{{ room.name }}</h2>
          <span class="shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold" :class="statusBadge(room).class">
            {{ statusBadge(room).label }}
          </span>
        </div>
        <p class="text-sm text-slate-600">出題者: {{ room.host_name }}</p>
        <p class="text-sm text-slate-600">
          {{ room.question_set_name || '出題リストなし（口頭出題）' }}
          <span v-if="room.question_count > 0">（{{ room.question_count }}問）</span>
        </p>
        <div class="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <span>回答者 {{ room.player_count }}人</span>
          <span>閲覧者 {{ room.spectator_count }}人</span>
          <span v-if="room.allow_drop_in" class="rounded bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
            途中参加OK
          </span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { RoomSummary } from '@/types'
import { api } from '@/utils/api'

const filters = [
  { value: 'waiting', label: '待機中' },
  { value: 'joinable', label: '参加できる' },
  { value: '', label: 'すべて' },
] as const

const filter = ref<string>('waiting')
const rooms = ref<RoomSummary[]>([])
const error = ref('')
let timer: ReturnType<typeof setInterval> | null = null

async function load() {
  try {
    const res = await api<{ rooms: RoomSummary[] }>(`/api/rooms?filter=${filter.value}`)
    rooms.value = res.rooms
    error.value = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'ルーム一覧の取得に失敗しました'
  }
}

function setFilter(value: string) {
  filter.value = value
  load()
}

function statusBadge(room: RoomSummary) {
  switch (room.status) {
    case 'waiting':
      return { label: '募集中', class: 'bg-sky-100 text-sky-700' }
    case 'playing':
      return { label: '出題中', class: 'bg-amber-100 text-amber-700' }
    case 'results':
      return { label: '結果発表', class: 'bg-violet-100 text-violet-700' }
    default:
      return { label: room.status, class: 'bg-slate-100 text-slate-600' }
  }
}

onMounted(() => {
  load()
  timer = setInterval(load, 10000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
