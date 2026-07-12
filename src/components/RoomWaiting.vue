<template>
  <div class="space-y-4">
    <div class="rounded-xl bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center gap-2">
        <span class="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">参加者募集中</span>
        <span v-if="state.room.allow_drop_in" class="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
          途中参加OK
        </span>
      </div>

      <dl class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        <div>
          <dt class="text-slate-500">出題リスト</dt>
          <dd class="font-medium">
            {{ state.room.question_set?.name ?? 'なし（口頭出題）' }}
            <span v-if="state.room.total_questions">（{{ state.room.total_questions }}問）</span>
          </dd>
        </div>
        <div>
          <dt class="text-slate-500">問い読み</dt>
          <dd class="font-medium">{{ state.room.reading_mode === 'text' ? '画面に文字表示' : '出題者が読み上げ' }}</dd>
        </div>
        <div v-if="state.room.question_set">
          <dt class="text-slate-500">出題順</dt>
          <dd class="font-medium">{{ state.room.question_order === 'random' ? 'ランダム' : '順番どおり' }}</dd>
        </div>
        <div v-if="state.room.reading_mode === 'text'">
          <dt class="text-slate-500">文字送り</dt>
          <dd class="font-medium">{{ state.room.char_interval_ms }}ms/文字</dd>
        </div>
        <div>
          <dt class="text-slate-500">正解</dt>
          <dd class="font-medium">+{{ state.room.points_correct }}点</dd>
        </div>
        <div>
          <dt class="text-slate-500">誤答</dt>
          <dd class="font-medium">{{ state.room.points_wrong > 0 ? `-${state.room.points_wrong}点` : 'ペナルティなし' }}</dd>
        </div>
      </dl>

      <div class="mt-5 flex items-center gap-2 rounded-lg bg-slate-50 p-3">
        <input :value="shareUrl" readonly class="w-full rounded border-slate-200 bg-white text-sm text-slate-600" />
        <button class="shrink-0 rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500" @click="copyUrl">
          {{ copied ? 'コピーしました！' : 'URLをコピー' }}
        </button>
      </div>
      <p class="mt-2 text-xs text-slate-500">このURLを共有すると、回答者・閲覧者が参加できます</p>
    </div>

    <!-- 出題者操作 -->
    <div v-if="store.isHost" class="rounded-xl bg-white p-6 shadow-sm">
      <button
        class="w-full rounded-lg bg-emerald-600 py-3 text-lg font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
        :disabled="playerCount === 0"
        @click="store.startQuiz()"
      >
        出題を開始する
      </button>
      <p v-if="playerCount === 0" class="mt-2 text-center text-sm text-slate-500">回答者が集まるのを待っています…</p>
      <button class="mt-3 w-full rounded py-2 text-sm text-red-500 hover:bg-red-50" @click="onDisband">
        ルームを解散する
      </button>
    </div>

    <!-- 参加者操作 -->
    <div v-else class="rounded-xl bg-white p-6 shadow-sm">
      <p class="mb-3 text-center text-slate-600">
        あなたは<span class="font-bold">{{ roleLabel }}</span>として参加中。出題開始を待っています…
      </p>
      <div class="flex justify-center gap-3">
        <button
          v-if="store.you?.role === 'spectator'"
          class="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          @click="store.changeRole('player')"
        >
          回答者に切り替える
        </button>
        <button
          v-if="store.you?.role === 'player'"
          class="rounded bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
          @click="store.changeRole('spectator')"
        >
          閲覧者に切り替える
        </button>
        <button class="rounded px-4 py-2 text-sm text-red-500 hover:bg-red-50" @click="onLeave">退出する</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { RoomState } from '@/types'
import { useRoomStore } from '@/stores/room'

const props = defineProps<{ state: RoomState }>()
const store = useRoomStore()
const router = useRouter()

const copied = ref(false)
const shareUrl = computed(() => `${location.origin}/rooms/${props.state.room.id}`)
const playerCount = computed(() => props.state.members.filter((m) => m.role === 'player').length)
const roleLabel = computed(() => (store.you?.role === 'player' ? '回答者' : '閲覧者'))

async function copyUrl() {
  await navigator.clipboard.writeText(shareUrl.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

function onDisband() {
  if (confirm('ルームを解散しますか？参加者は全員退出します。')) store.disband()
}

function onLeave() {
  store.leave()
  router.push({ name: 'home' })
}
</script>
