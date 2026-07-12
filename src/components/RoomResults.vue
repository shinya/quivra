<template>
  <div class="space-y-4">
    <div class="rounded-xl bg-white p-6 shadow-sm">
      <h2 class="mb-5 text-center text-2xl font-bold">🏆 結果発表</h2>
      <ul class="mx-auto max-w-md space-y-2">
        <li
          v-for="entry in ranking"
          :key="entry.user_id"
          class="flex items-center justify-between rounded-lg px-4 py-3"
          :class="rankClass(entry.rank)"
        >
          <div class="flex items-center gap-3">
            <span class="w-8 text-xl font-black">{{ rankIcon(entry.rank) }}</span>
            <span class="font-bold">{{ entry.display_name }}</span>
            <span v-if="entry.user_id === store.you?.user_id" class="text-xs text-indigo-500">(自分)</span>
          </div>
          <span class="text-xl font-black tabular-nums">{{ entry.score }}点</span>
        </li>
        <li v-if="ranking.length === 0" class="text-center text-slate-500">回答者がいませんでした</li>
      </ul>
    </div>

    <!-- 出題者: 再戦 or 解散 -->
    <div v-if="store.isHost" class="rounded-xl bg-white p-6 shadow-sm">
      <h3 class="mb-3 font-bold">次はどうする？</h3>
      <div class="mb-4">
        <label class="mb-1 block text-sm font-medium">出題リスト</label>
        <select v-model="nextSet" class="w-full rounded border-slate-300">
          <option :value="'keep'">同じリストでもう一度（{{ state.room.question_set?.name ?? 'リストなし' }}）</option>
          <option v-for="set in sets" :key="set.id" :value="set.id">{{ set.name }}（{{ set.question_count }}問）</option>
          <option v-if="state.room.reading_mode === 'oral'" :value="'none'">リストなし（口頭出題）</option>
        </select>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row">
        <button class="flex-1 rounded-lg bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-500" @click="onRestart(true)">
          同じメンバーですぐ開始
        </button>
        <button class="flex-1 rounded-lg bg-sky-600 py-2.5 font-bold text-white hover:bg-sky-500" @click="onRestart(false)">
          参加者を募集して再戦
        </button>
        <button class="flex-1 rounded-lg bg-red-500 py-2.5 font-bold text-white hover:bg-red-400" @click="onDisband">
          解散する
        </button>
      </div>
    </div>

    <!-- 参加者 -->
    <div v-else class="rounded-xl bg-white p-5 text-center text-slate-600 shadow-sm">
      <p>出題者が次のアクションを選んでいます…</p>
      <button class="mt-3 rounded px-4 py-2 text-sm text-red-500 hover:bg-red-50" @click="onLeave">退出する</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { QuestionSet, RankingEntry, RoomState } from '@/types'
import { api } from '@/utils/api'
import { useRoomStore } from '@/stores/room'

const props = defineProps<{ state: RoomState }>()
const store = useRoomStore()
const router = useRouter()

const sets = ref<QuestionSet[]>([])
const nextSet = ref<'keep' | 'none' | number>('keep')

// ランキングはサーバー計算値を優先し、なければスコアから組み立てる
const ranking = computed<RankingEntry[]>(() => {
  if (props.state.game.ranking?.length) return props.state.game.ranking
  const players = props.state.members
    .filter((m) => m.role === 'player')
    .slice()
    .sort((a, b) => b.score - a.score)
  return players.map((p, i) => ({
    user_id: p.user_id,
    display_name: p.display_name,
    score: p.score,
    rank: i > 0 && players[i - 1].score === p.score ? i : i + 1,
  }))
})

function rankIcon(rank: number) {
  return rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}位`
}

function rankClass(rank: number) {
  if (rank === 1) return 'bg-amber-50 ring-2 ring-amber-300'
  if (rank === 2) return 'bg-slate-100'
  if (rank === 3) return 'bg-orange-50'
  return 'bg-slate-50'
}

onMounted(async () => {
  if (!store.isHost) return
  try {
    sets.value = (await api<{ sets: QuestionSet[] }>('/api/question-sets')).sets
  } catch {
    // リスト取得失敗時は「同じリスト」のみ選択可能
  }
})

function onRestart(immediate: boolean) {
  const opts: { immediate: boolean; question_set_id?: number; clear_set?: boolean } = { immediate }
  if (nextSet.value === 'none') opts.clear_set = true
  else if (typeof nextSet.value === 'number') opts.question_set_id = nextSet.value
  store.restart(opts)
}

function onDisband() {
  if (confirm('ルームを解散しますか？参加者は全員退出します。')) store.disband()
}

function onLeave() {
  store.leave()
  router.push({ name: 'home' })
}
</script>
