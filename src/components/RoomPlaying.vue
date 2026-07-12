<template>
  <div class="space-y-4">
    <!-- 進行状況 -->
    <div class="flex items-center justify-between text-sm text-slate-600">
      <span class="font-bold">
        第{{ state.game.question_number }}問<template v-if="state.room.total_questions">
          / 全{{ state.room.total_questions }}問</template>
      </span>
      <span v-if="state.room.question_set">{{ state.room.question_set.name }}</span>
    </div>

    <!-- 問題表示エリア -->
    <div class="rounded-xl bg-white p-6 shadow-sm">
      <!-- 出題者ビュー -->
      <template v-if="store.isHost && game.host_view">
        <p class="mb-1 text-xs font-bold text-slate-400">問題文（あなただけに表示）</p>
        <p class="text-lg font-medium leading-relaxed">{{ game.host_view.text }}</p>
        <div class="mt-3 rounded-lg bg-emerald-50 p-3">
          <p class="text-sm font-bold text-emerald-700">答え: {{ game.host_view.answer }}</p>
          <p v-if="game.host_view.explanation" class="mt-1 text-xs text-emerald-600">{{ game.host_view.explanation }}</p>
        </div>
      </template>

      <!-- 口頭出題（リストなし）で出題中の出題者 -->
      <template v-else-if="store.isHost && isQuestionActive">
        <p class="text-lg text-slate-600">問題を読み上げてください（第{{ game.question_number }}問）</p>
      </template>

      <!-- 回答者・閲覧者: 文字表示モード -->
      <template v-else-if="!store.isHost && isQuestionActive && state.room.reading_mode === 'text' && game.question?.text">
        <RevealText :text="game.question.text" :reveal="game.reveal" />
      </template>

      <!-- 回答者・閲覧者: 口頭モード -->
      <template v-else-if="!store.isHost && isQuestionActive">
        <p class="py-6 text-center text-xl font-bold text-slate-500">🎙 出題者の声を聞いて答えよう！</p>
      </template>

      <!-- 出題間（前の問題の結果） -->
      <template v-else-if="game.q_state === 'idle'">
        <div v-if="game.last_result" class="space-y-2">
          <p class="text-sm font-bold" :class="game.last_result.reason === 'correct' ? 'text-emerald-600' : 'text-slate-500'">
            {{ resultHeading }}
          </p>
          <p v-if="game.last_result.text" class="text-slate-700">{{ game.last_result.text }}</p>
          <div v-if="game.last_result.answer" class="rounded-lg bg-indigo-50 p-3">
            <p class="font-bold text-indigo-700">答え: {{ game.last_result.answer }}</p>
            <p v-if="game.last_result.explanation" class="mt-1 text-sm text-indigo-600">{{ game.last_result.explanation }}</p>
          </div>
        </div>
        <p v-else class="py-4 text-center text-slate-500">次の問題を待っています…</p>
      </template>
    </div>

    <!-- 回答権表示 -->
    <div v-if="game.q_state === 'answering' && answeringMember" class="rounded-xl bg-amber-50 p-4 text-center ring-2 ring-amber-300">
      <p class="text-lg">
        <span class="font-bold text-amber-700">{{ answeringMember.display_name }}</span> に回答権！
        <span class="text-sm text-amber-600">口頭で答えてください</span>
      </p>
      <p v-if="waitingQueue.length > 0" class="mt-1 text-xs text-amber-600">
        待機中: {{ waitingQueue.map((id) => store.memberName(id)).join(' → ') }}
      </p>
    </div>

    <!-- 出題者コントロール -->
    <div v-if="store.isHost" class="rounded-xl bg-white p-5 shadow-sm">
      <div v-if="game.q_state === 'idle'" class="flex gap-3">
        <button class="flex-1 rounded-lg bg-emerald-600 py-3 text-lg font-bold text-white hover:bg-emerald-500" @click="store.startQuestion()">
          {{ game.last_result ? '次の問題へ' : '出題開始' }}
        </button>
      </div>
      <div v-else-if="game.q_state === 'answering'" class="flex gap-3">
        <button class="flex-1 rounded-lg bg-emerald-600 py-3 text-lg font-bold text-white hover:bg-emerald-500" @click="store.judge(true)">
          ⭕ 正解
        </button>
        <button class="flex-1 rounded-lg bg-red-500 py-3 text-lg font-bold text-white hover:bg-red-400" @click="store.judge(false)">
          ❌ 不正解
        </button>
      </div>
      <div v-else class="text-center text-sm text-slate-500">早押しを待っています…</div>

      <div class="mt-3 flex justify-between border-t pt-3">
        <button
          v-if="game.q_state !== 'idle'"
          class="rounded px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
          @click="store.skipQuestion()"
        >
          この問題をスキップ
        </button>
        <span v-else />
        <button class="rounded px-3 py-1.5 text-sm text-red-500 hover:bg-red-50" @click="onEndQuiz">
          これで終了（結果発表へ）
        </button>
      </div>
    </div>

    <!-- 回答者: 早押しボタン -->
    <div v-else-if="store.you?.role === 'player'" class="flex flex-col items-center gap-2 py-2">
      <button
        class="h-40 w-40 rounded-full text-xl font-black text-white shadow-lg transition active:scale-95 disabled:cursor-not-allowed"
        :class="buzzButtonClass"
        :disabled="!canBuzz"
        @click="store.buzz()"
      >
        {{ buzzLabel }}
      </button>
      <p class="text-sm text-slate-500">{{ buzzHint }}</p>
    </div>

    <!-- 閲覧者 -->
    <div v-else class="rounded-xl bg-white p-4 text-center text-sm text-slate-500 shadow-sm">
      閲覧者として観戦中
      <button
        v-if="state.room.allow_drop_in"
        class="ml-2 rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        @click="store.changeRole('player')"
      >
        回答者として参加する
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RoomState } from '@/types'
import { useRoomStore } from '@/stores/room'
import RevealText from '@/components/RevealText.vue'

const props = defineProps<{ state: RoomState }>()
const store = useRoomStore()

const game = computed(() => props.state.game)
const isQuestionActive = computed(() => game.value.q_state === 'reading' || game.value.q_state === 'answering')
const answeringMember = computed(() =>
  props.state.members.find((m) => m.user_id === game.value.answering),
)
const waitingQueue = computed(() => game.value.queue.slice(1))

const resultHeading = computed(() => {
  const r = game.value.last_result
  if (!r) return ''
  if (r.reason === 'correct' && r.correct_user_id) return `${store.memberName(r.correct_user_id)} が正解！`
  return 'スキップされました'
})

const youId = computed(() => store.you?.user_id ?? '')
const isLockedOut = computed(() => game.value.locked_out.includes(youId.value))
const hasBuzzed = computed(() => game.value.buzzed.includes(youId.value))
const isAnswering = computed(() => game.value.answering === youId.value)
const inQueue = computed(() => game.value.queue.includes(youId.value))

const canBuzz = computed(
  () => isQuestionActive.value && !hasBuzzed.value && !isLockedOut.value,
)

const buzzLabel = computed(() => {
  if (isAnswering.value) return '回答権あり！'
  if (inQueue.value) return '待機中…'
  if (isLockedOut.value) return '回答済み'
  if (isQuestionActive.value) return '早押し！'
  return '待機中'
})

const buzzButtonClass = computed(() => {
  if (isAnswering.value) return 'bg-amber-500 animate-pulse'
  if (canBuzz.value) return 'bg-red-500 hover:bg-red-400'
  return 'bg-slate-300'
})

const buzzHint = computed(() => {
  if (isAnswering.value) return '口頭で答えてください！'
  if (inQueue.value) return `${store.memberName(game.value.answering ?? '')} の回答を待っています`
  if (isLockedOut.value) return 'この問題ではもう回答できません'
  if (game.value.q_state === 'idle') return '出題を待っています'
  return 'わかったら押そう！'
})

function onEndQuiz() {
  if (confirm('クイズを終了して結果発表に進みますか？')) store.endQuiz()
}
</script>
