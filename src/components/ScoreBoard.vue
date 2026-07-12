<template>
  <div class="rounded-xl bg-white p-5 shadow-sm">
    <h3 class="mb-3 text-sm font-bold text-slate-500">スコア</h3>
    <ul class="space-y-2">
      <li
        v-for="member in players"
        :key="member.user_id"
        class="flex items-center justify-between rounded-lg px-3 py-2"
        :class="member.user_id === answering ? 'bg-amber-100 ring-2 ring-amber-400' : 'bg-slate-50'"
      >
        <div class="flex min-w-0 items-center gap-2">
          <span class="h-2 w-2 shrink-0 rounded-full" :class="member.connected ? 'bg-emerald-500' : 'bg-slate-300'" />
          <span class="truncate font-medium">{{ member.display_name }}</span>
          <span v-if="member.user_id === you?.user_id" class="shrink-0 text-xs text-indigo-500">(自分)</span>
          <span v-if="lockedOut.includes(member.user_id)" class="shrink-0 text-xs text-red-400">誤答</span>
        </div>
        <span class="text-lg font-bold tabular-nums">{{ member.score }}</span>
      </li>
      <li v-if="players.length === 0" class="text-sm text-slate-400">回答者はまだいません</li>
    </ul>

    <div v-if="spectators.length > 0" class="mt-4 border-t pt-3">
      <h4 class="mb-1 text-xs font-bold text-slate-400">閲覧者</h4>
      <p class="text-sm text-slate-500">{{ spectators.map((s) => s.display_name).join('、') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StateMember } from '@/types'

const props = defineProps<{
  members: StateMember[]
  you: StateMember | null
  answering?: string
  lockedOut?: string[]
}>()

const lockedOut = computed(() => props.lockedOut ?? [])
const players = computed(() =>
  props.members.filter((m) => m.role === 'player').slice().sort((a, b) => b.score - a.score),
)
const spectators = computed(() => props.members.filter((m) => m.role === 'spectator'))
</script>
