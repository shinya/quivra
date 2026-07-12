import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { RoomState, Role, ServerEvent } from '@/types'
import { WS_URL, getToken } from '@/utils/api'

export interface Toast {
  id: number
  kind: 'info' | 'success' | 'error'
  message: string
}

let toastSeq = 0

// ルームへの WebSocket 接続とゲーム状態を管理する
export const useRoomStore = defineStore('room', () => {
  const state = ref<RoomState | null>(null)
  const connected = ref(false)
  const closedByServer = ref(false)
  const toasts = ref<Toast[]>([])

  let ws: WebSocket | null = null
  let currentRoomId: string | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectAttempts = 0
  let intentionalClose = false

  const you = computed(() => state.value?.you ?? null)
  const isHost = computed(() => you.value?.role === 'host')

  function memberName(userId: string): string {
    return state.value?.members.find((m) => m.user_id === userId)?.display_name ?? '???'
  }

  function addToast(kind: Toast['kind'], message: string) {
    const id = ++toastSeq
    toasts.value.push({ id, kind, message })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 4000)
  }

  function handleEvent(ev: ServerEvent) {
    const data = (ev.data ?? {}) as Record<string, unknown>
    switch (ev.kind) {
      case 'buzz': {
        const pos = Number(data.position)
        if (pos === 1) addToast('info', `${memberName(String(data.user_id))} が早押し！`)
        break
      }
      case 'judge': {
        const name = memberName(String(data.user_id))
        if (data.correct) addToast('success', `${name} 正解！ +${data.delta}`)
        else addToast('error', `${name} 不正解${Number(data.delta) < 0 ? ` (${data.delta})` : ''}`)
        break
      }
      case 'quiz_start':
        addToast('info', 'クイズが始まりました！')
        break
      case 'quiz_end':
        addToast('info', 'クイズ終了！結果発表')
        break
      case 'room_closed':
        closedByServer.value = true
        intentionalClose = true
        ws?.close()
        break
      case 'role_change':
        addToast('info', `${memberName(String(data.user_id))} が${data.role === 'player' ? '回答者' : '閲覧者'}になりました`)
        break
    }
  }

  function connect(roomId: string) {
    disconnect()
    currentRoomId = roomId
    intentionalClose = false
    closedByServer.value = false
    reconnectAttempts = 0
    open()
  }

  function open() {
    if (!currentRoomId) return
    const token = getToken()
    if (!token) return

    const socket = new WebSocket(`${WS_URL}?room_id=${currentRoomId}&token=${encodeURIComponent(token)}`)
    ws = socket

    socket.onopen = () => {
      connected.value = true
      reconnectAttempts = 0
    }
    socket.onmessage = (e: MessageEvent) => {
      try {
        const msg = JSON.parse(e.data as string) as { type: string; payload?: unknown }
        if (msg.type === 'room_state') {
          state.value = msg.payload as RoomState
        } else if (msg.type === 'event') {
          handleEvent(msg.payload as ServerEvent)
        } else if (msg.type === 'error') {
          const p = msg.payload as { message?: string }
          addToast('error', p.message ?? 'エラーが発生しました')
        }
      } catch {
        // 不正なメッセージは無視
      }
    }
    socket.onclose = () => {
      connected.value = false
      if (ws === socket) ws = null
      // 意図しない切断は自動再接続（解散・退出時は除く）
      if (!intentionalClose && !closedByServer.value && currentRoomId && reconnectAttempts < 10) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts, 10000)
        reconnectAttempts++
        reconnectTimer = setTimeout(open, delay)
      }
    }
  }

  function disconnect() {
    intentionalClose = true
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      ws.close()
      ws = null
    }
    connected.value = false
    state.value = null
    currentRoomId = null
  }

  function send(type: string, payload?: unknown) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }))
    }
  }

  // --- 操作 ---
  const buzz = () => send('buzz')
  const startQuiz = () => send('start_quiz')
  const startQuestion = () => send('start_question')
  const judge = (correct: boolean) => send('judge', { correct })
  const skipQuestion = () => send('skip_question')
  const endQuiz = () => send('end_quiz')
  const disband = () => send('disband')
  const changeRole = (role: Role) => send('change_role', { role })
  const leave = () => {
    send('leave')
    disconnect()
  }
  const restart = (opts: { immediate: boolean; question_set_id?: number; clear_set?: boolean }) =>
    send('restart', opts)

  return {
    state,
    connected,
    closedByServer,
    toasts,
    you,
    isHost,
    memberName,
    connect,
    disconnect,
    buzz,
    startQuiz,
    startQuestion,
    judge,
    skipQuestion,
    endQuiz,
    disband,
    changeRole,
    leave,
    restart,
  }
})
