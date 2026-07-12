<template>
  <p class="min-h-[6rem] whitespace-pre-wrap text-2xl font-bold leading-relaxed tracking-wide">
    <span>{{ visibleText }}</span><span v-if="!isComplete" class="animate-pulse text-indigo-400">▍</span>
  </p>
</template>

<script setup lang="ts">
// サーバーの reveal 状態（表示済み文字数 + 進行中フラグ）を元に1文字ずつ表示する
import { computed, onUnmounted, ref, watch } from 'vue'
import type { StateReveal } from '@/types'

const props = defineProps<{
  text: string
  reveal: StateReveal | null
}>()

const displayed = ref(0)
let timer: ReturnType<typeof setInterval> | null = null
let base = 0
let baseAt = 0

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

watch(
  () => props.reveal,
  (reveal) => {
    stopTimer()
    if (!reveal) {
      displayed.value = 0
      return
    }
    base = reveal.revealed
    baseAt = performance.now()
    displayed.value = Math.min(base, reveal.total_chars)
    if (reveal.running && reveal.interval_ms > 0) {
      timer = setInterval(() => {
        const elapsed = performance.now() - baseAt
        displayed.value = Math.min(base + elapsed / reveal.interval_ms, reveal.total_chars)
        if (displayed.value >= reveal.total_chars) stopTimer()
      }, 33)
    }
  },
  { immediate: true, deep: true },
)

const chars = computed(() => Array.from(props.text))
const visibleText = computed(() => chars.value.slice(0, Math.floor(displayed.value)).join(''))
const isComplete = computed(() => Math.floor(displayed.value) >= chars.value.length)

onUnmounted(stopTimer)
</script>
