<template>
  <div>
    <!-- トースト -->
    <div class="pointer-events-none fixed right-4 top-16 z-50 space-y-2">
      <div
        v-for="toast in store.toasts"
        :key="toast.id"
        class="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg"
        :class="{
          'bg-slate-700': toast.kind === 'info',
          'bg-emerald-600': toast.kind === 'success',
          'bg-red-500': toast.kind === 'error',
        }"
      >
        {{ toast.message }}
      </div>
    </div>

    <!-- 解散済み -->
    <div v-if="store.closedByServer || roomClosed" class="mx-auto mt-12 max-w-md rounded-xl bg-white p-8 text-center shadow">
      <p class="mb-4 text-lg font-bold">このルームは解散されました</p>
      <RouterLink :to="{ name: 'home' }" class="text-indigo-600 hover:underline">ルーム一覧に戻る</RouterLink>
    </div>

    <!-- ロード中 -->
    <div v-else-if="loading" class="py-20 text-center text-slate-500">読み込み中…</div>

    <!-- エラー -->
    <div v-else-if="loadError" class="mx-auto mt-12 max-w-md rounded-xl bg-white p-8 text-center shadow">
      <p class="mb-4 text-red-600">{{ loadError }}</p>
      <RouterLink :to="{ name: 'home' }" class="text-indigo-600 hover:underline">ルーム一覧に戻る</RouterLink>
    </div>

    <!-- 参加ロール選択 -->
    <div v-else-if="needsJoin && roomInfo" class="mx-auto mt-12 max-w-md rounded-xl bg-white p-8 shadow">
      <h1 class="mb-1 text-center text-xl font-bold">{{ roomInfo.room.name }}</h1>
      <p class="mb-6 text-center text-sm text-slate-500">
        出題者: {{ hostName }} ・ {{ roomInfo.question_set_name || '出題リストなし' }}
      </p>
      <p v-if="joinError" class="mb-3 text-center text-sm text-red-600">{{ joinError }}</p>
      <div class="space-y-3">
        <button
          class="w-full rounded-lg bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!canJoinAsPlayer"
          @click="join('player')"
        >
          回答者として参加
          <span v-if="!canJoinAsPlayer" class="block text-xs font-normal">（出題開始後は参加できません）</span>
        </button>
        <button
          class="w-full rounded-lg bg-slate-200 py-3 font-bold text-slate-700 hover:bg-slate-300"
          @click="join('spectator')"
        >
          閲覧者として参加
        </button>
      </div>
    </div>

    <!-- ルーム本体 -->
    <div v-else-if="store.state" class="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div>
        <div class="mb-4 flex items-center justify-between">
          <h1 class="text-2xl font-bold">{{ store.state.room.name }}</h1>
          <span v-if="!store.connected" class="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
            再接続中…
          </span>
        </div>

        <RoomWaiting v-if="store.state.room.status === 'waiting'" :state="store.state" />
        <RoomPlaying v-else-if="store.state.room.status === 'playing'" :state="store.state" />
        <RoomResults v-else-if="store.state.room.status === 'results'" :state="store.state" />
      </div>

      <aside>
        <ScoreBoard
          :members="store.state.members"
          :you="store.you"
          :answering="store.state.game.answering"
          :locked-out="store.state.game.locked_out"
        />
      </aside>
    </div>

    <!-- WS 接続待ち -->
    <div v-else class="py-20 text-center text-slate-500">ルームに接続中…</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Room, RoomMember } from '@/types'
import { api } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import { useRoomStore } from '@/stores/room'
import RoomWaiting from '@/components/RoomWaiting.vue'
import RoomPlaying from '@/components/RoomPlaying.vue'
import RoomResults from '@/components/RoomResults.vue'
import ScoreBoard from '@/components/ScoreBoard.vue'

interface RoomDetail {
  room: Room
  members: RoomMember[]
  question_set_name: string
}

const route = useRoute()
const auth = useAuthStore()
const store = useRoomStore()

const roomId = computed(() => String(route.params.id))
const loading = ref(true)
const loadError = ref('')
const joinError = ref('')
const roomInfo = ref<RoomDetail | null>(null)
const needsJoin = ref(false)

const roomClosed = computed(() => roomInfo.value?.room.status === 'closed' && needsJoin.value)
const hostName = computed(
  () => roomInfo.value?.members.find((m) => m.role === 'host')?.display_name ?? '',
)
const canJoinAsPlayer = computed(() => {
  const room = roomInfo.value?.room
  if (!room) return false
  return room.status === 'waiting' || room.allow_drop_in
})

async function load() {
  loading.value = true
  try {
    const detail = await api<RoomDetail>(`/api/rooms/${roomId.value}`)
    roomInfo.value = detail
    const isMember = detail.members.some((m) => m.user_id === auth.user?.id)
    if (isMember) {
      store.connect(roomId.value)
      needsJoin.value = false
    } else {
      needsJoin.value = true
    }
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'ルームが見つかりません'
  } finally {
    loading.value = false
  }
}

async function join(role: 'player' | 'spectator') {
  joinError.value = ''
  try {
    await api(`/api/rooms/${roomId.value}/join`, { method: 'POST', body: { role } })
    needsJoin.value = false
    store.connect(roomId.value)
  } catch (e) {
    joinError.value = e instanceof Error ? e.message : '参加に失敗しました'
  }
}

onMounted(load)
onUnmounted(() => store.disconnect())
</script>
