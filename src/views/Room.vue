<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- ヘッダー -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-800 mb-2">ルーム: {{ roomId }}</h1>
              <div class="flex items-center gap-4 text-sm text-gray-600">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span>参加者: {{ players.length }}人</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{{ gameState }}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-blue-600">{{ players.length }}</div>
              <div class="text-sm text-gray-500">プレイヤー</div>
            </div>
          </div>
        </div>

        <!-- メインコンテンツ -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <!-- 参加者一覧 -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center mb-4">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800">参加者一覧</h3>
            </div>
            <div class="space-y-3">
              <div
                v-for="(player, index) in players"
                :key="player.id"
                class="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {{ index + 1 }}
                  </div>
                  <span class="font-medium text-gray-800">{{ player.name }}</span>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-blue-600">{{ player.score }}</div>
                  <div class="text-xs text-gray-500">点</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ゲーム状態 -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center mb-4">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800">ゲーム状態</h3>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600 mb-4">
                {{ gameState }}
              </div>
              <div v-if="currentQuestion" class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600 mb-2">現在の問題</div>
                <div class="text-lg font-medium text-gray-800">{{ currentQuestion.question }}</div>
              </div>
            </div>
          </div>

          <!-- 早押しボタン -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center mb-4">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800">早押しボタン</h3>
            </div>
            <div class="text-center">
              <button
                @click="buzzIn"
                :disabled="!canBuzz"
                class="w-full h-24 text-2xl font-bold rounded-xl transition-all duration-200 transform"
                :class="canBuzz
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
              >
                {{ canBuzz ? '早押しボタン' : '待機中...' }}
              </button>
            </div>
          </div>
        </div>
        <!-- 回答エリア -->
        <div v-if="showAnswerInput" class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800">回答を入力してください</h3>
          </div>
          <div class="flex gap-4">
            <input
              v-model="answer"
              @keyup.enter="submitAnswer"
              type="text"
              placeholder="回答を入力してください"
              class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            <button
              @click="submitAnswer"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
            >
              回答する
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
// Socket.ioではなく、ネイティブWebSocketを使用

const route = useRoute()
const roomId = route.params.id as string

// WebSocket接続
let socket: WebSocket | null = null

// 状態管理
const players = ref<Array<{ id: string; name: string; score: number }>>([])
const gameState = ref('待機中')
const currentQuestion = ref<{ question: string; answer: string } | null>(null)
const canBuzz = ref(false)
const showAnswerInput = ref(false)
const answer = ref('')
const playerName = ref('')

onMounted(() => {
  // プレイヤー名を入力
  const name = prompt('プレイヤー名を入力してください:')
  if (name) {
    playerName.value = name
    connectToRoom()
  }
})

const connectToRoom = () => {
  socket = new WebSocket('ws://localhost:8080/ws')

  socket.onopen = () => {
    // ルーム参加メッセージを送信
    const joinMessage = {
      event: 'join-room',
      data: {
        roomId,
        playerName: playerName.value
      }
    }
    socket!.send(JSON.stringify(joinMessage))
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)

      switch (data.event) {
        case 'room-updated':
          players.value = data.data.players
          gameState.value = data.data.gameState
          currentQuestion.value = data.data.currentQuestion
          canBuzz.value = data.data.canBuzz
          break

        case 'buzz-result':
          if (data.data.success) {
            showAnswerInput.value = true
            canBuzz.value = false
          } else {
            alert('他のプレイヤーが先に押しました！')
          }
          break

        case 'question-result':
          showAnswerInput.value = false
          answer.value = ''
          if (data.data.correct) {
            alert('正解！')
          } else {
            alert(`不正解。正解は: ${data.data.correctAnswer}`)
          }
          break
      }
    } catch (error) {
      console.error('メッセージ解析エラー:', error)
    }
  }

  socket.onerror = (error) => {
    console.error('WebSocket接続エラー:', error)
  }

  socket.onclose = (event) => {
    console.log('WebSocket接続切断:', event.code, event.reason)
  }
}

const buzzIn = () => {
  if (socket && canBuzz.value) {
    const message = {
      event: 'buzz-in',
      data: { roomId }
    }
    socket.send(JSON.stringify(message))
  }
}

const submitAnswer = () => {
  if (socket && answer.value.trim()) {
    const message = {
      event: 'submit-answer',
      data: {
        roomId,
        answer: answer.value.trim()
      }
    }
    socket.send(JSON.stringify(message))
  }
}

onUnmounted(() => {
  if (socket) {
    socket.close()
  }
})
</script>
