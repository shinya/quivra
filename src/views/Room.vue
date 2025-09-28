<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- ヘッダー -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-800 mb-2">ルーム: {{ actualRoomId || roomId }}</h1>
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

        <!-- 管理者機能 -->
        <div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 class="text-lg font-semibold text-red-800 mb-3">管理者機能</h3>
          <div class="flex flex-wrap gap-2">
            <button
              @click="startGame"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              ゲーム開始
            </button>
            <button
              @click="resetQueue"
              class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              キューリセット
            </button>
            <button
              @click="endGame"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              ゲーム終了
            </button>
          </div>
        </div>

        <!-- デバッグ情報 -->
        <div class="mt-6">
          <button
            @click="showDebug = !showDebug"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {{ showDebug ? 'デバッグ情報を隠す' : 'デバッグ情報を表示' }}
          </button>

          <div v-if="showDebug" class="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">デバッグ情報</h3>
            <div class="max-h-64 overflow-y-auto">
              <div
                v-for="(message, index) in debugMessages"
                :key="index"
                class="text-sm text-gray-700 mb-1 font-mono"
              >
                {{ message }}
              </div>
            </div>
            <button
              @click="debugMessages = []"
              class="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              ログをクリア
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

// デバッグ情報
const debugMessages = ref<string[]>([])
const showDebug = ref(false)

// 実際のルームID（作成されたルームのID）
const actualRoomId = ref<string>('')

onMounted(() => {
  // プレイヤー名を入力
  const name = prompt('プレイヤー名を入力してください:')
  if (name) {
    // 重複回避のため、ランダムな文字列を追加
    const randomString = Math.random().toString(36).substring(2, 8)
    const timestamp = Date.now().toString().slice(-4)
    playerName.value = `${name}_${randomString}_${timestamp}`
    addDebugMessage(`プレイヤー名: ${playerName.value}`)

    // 新しいルームを作成
    connectToRoom()
  }
})


const addDebugMessage = (message: string) => {
  debugMessages.value.push(`[${new Date().toLocaleTimeString()}] ${message}`)
  if (debugMessages.value.length > 50) {
    debugMessages.value.shift()
  }
}

const createRoom = async () => {
  try {
    addDebugMessage('ルーム作成API呼び出し開始')
    const response = await fetch('http://localhost:8080/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Room ${roomId}`,
        is_public: true,
        creator_name: playerName.value
      })
    })

    addDebugMessage(`ルーム作成APIレスポンス: ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      addDebugMessage(`ルーム作成成功: ${JSON.stringify(data)}`)
      console.log('ルーム作成成功:', data)
      return data.roomId
    } else {
      addDebugMessage(`ルーム作成失敗: ${response.status} ${response.statusText}`)
      throw new Error(`ルーム作成失敗: ${response.status}`)
    }
  } catch (error) {
    addDebugMessage(`ルーム作成エラー: ${error}`)
    console.error('ルーム作成エラー:', error)
    throw error
  }
}

const connectToRoom = async () => {
  try {
    // まずルーム作成を試行
    addDebugMessage('ルーム作成を試行中...')
    const createdRoomId = await createRoom()

    // 作成されたroomIdを使用
    actualRoomId.value = createdRoomId || roomId
    addDebugMessage(`使用するroomId: ${actualRoomId.value}`)

    // ルーム情報を確認
    try {
      addDebugMessage('ルーム情報を確認中...')
      console.log('ルーム情報確認開始:', actualRoomId.value)
      const roomInfoResponse = await fetch(`http://localhost:8080/api/rooms/${actualRoomId.value}`)
      console.log('ルーム情報確認レスポンス:', roomInfoResponse.status)
      if (roomInfoResponse.ok) {
        const roomInfo = await roomInfoResponse.json()
        addDebugMessage(`ルーム情報確認成功: ${JSON.stringify(roomInfo)}`)
        console.log('ルーム情報確認成功:', roomInfo)
      } else {
        addDebugMessage(`ルーム情報確認失敗: ${roomInfoResponse.status}`)
        console.log('ルーム情報確認失敗:', roomInfoResponse.status)
      }
    } catch (error) {
      addDebugMessage(`ルーム情報確認エラー: ${error}`)
      console.log('ルーム情報確認エラー:', error)
    }

    // ルーム作成の完了を待ってからWebSocket接続
    setTimeout(async () => {
      // WebSocket接続前にルーム情報を再確認
      try {
        addDebugMessage('WebSocket接続前のルーム情報確認...')
        const finalCheckResponse = await fetch(`http://localhost:8080/api/rooms/${actualRoomId.value}`)
        if (finalCheckResponse.ok) {
          const finalRoomInfo = await finalCheckResponse.json()
          addDebugMessage(`最終ルーム情報確認成功: ${JSON.stringify(finalRoomInfo)}`)
          console.log('最終ルーム情報確認成功:', finalRoomInfo)
        } else {
          addDebugMessage(`最終ルーム情報確認失敗: ${finalCheckResponse.status}`)
          console.log('最終ルーム情報確認失敗:', finalCheckResponse.status)
        }
      } catch (error) {
        addDebugMessage(`最終ルーム情報確認エラー: ${error}`)
        console.log('最終ルーム情報確認エラー:', error)
      }

      addDebugMessage('WebSocket接続開始: ws://localhost:8080/ws')
      console.log('WebSocket接続開始:', 'ws://localhost:8080/ws')
      socket = new WebSocket('ws://localhost:8080/ws')

      socket.onopen = () => {
        addDebugMessage('WebSocket接続成功')
        console.log('WebSocket接続成功')

        // ルーム参加メッセージを送信
        const joinMessage = {
          event: 'join-room',
          data: {
            roomId: actualRoomId.value,
            playerName: playerName.value
          }
        }
        addDebugMessage(`join-room メッセージ: ${JSON.stringify(joinMessage)}`)
        console.log('ルーム参加メッセージ送信:', joinMessage)
        socket!.send(JSON.stringify(joinMessage))
      }

      // WebSocketメッセージ処理を追加
      socket.onmessage = (event) => {
        addDebugMessage(`メッセージ受信: ${event.data}`)
        console.log('WebSocketメッセージ受信:', event.data)

        // 生のメッセージを詳細にログ出力
        addDebugMessage(`生メッセージ長: ${event.data.length}文字`)
        addDebugMessage(`生メッセージ型: ${typeof event.data}`)

        try {
          const data = JSON.parse(event.data)
          addDebugMessage(`解析されたメッセージ: ${JSON.stringify(data)}`)
          console.log('解析されたメッセージ:', data)

          // イベントタイプを詳細にログ出力
          addDebugMessage(`イベントタイプ: ${data.event}`)
          addDebugMessage(`データキー: ${Object.keys(data.data || {})}`)

          switch (data.event) {
            case 'room-updated':
              addDebugMessage(`ルーム更新: プレイヤー数=${data.data.players?.length || 0}`)
              console.log('ルーム更新:', data.data)
              players.value = data.data.players
              gameState.value = data.data.gameState
              currentQuestion.value = data.data.currentQuestion
              canBuzz.value = data.data.canBuzz
              break

            case 'queue-updated':
              addDebugMessage(`キュー更新: ${JSON.stringify(data.data)}`)
              console.log('キュー更新:', data.data)
              break

            case 'judge-result':
              addDebugMessage(`判定結果: ${JSON.stringify(data.data)}`)
              console.log('判定結果:', data.data)
              if (data.data.correct) {
                alert('正解！')
              } else {
                alert('不正解')
              }
              showAnswerInput.value = false
              answer.value = ''
              break

            case 'queue-reset':
              addDebugMessage(`キューリセット: ${data.data.message}`)
              console.log('キューリセット:', data.data)
              alert('キューがリセットされました')
              break

            case 'game-ended':
              addDebugMessage(`ゲーム終了: ${JSON.stringify(data.data)}`)
              console.log('ゲーム終了:', data.data)
              alert('ゲームが終了しました')
              break

            case 'success':
              addDebugMessage(`成功: ${data.data.message}`)
              console.log('成功:', data.data)
              alert(data.data.message)
              break

            case 'buzz-result':
              addDebugMessage(`早押し結果: ${JSON.stringify(data.data)}`)
              console.log('早押し結果:', data.data)
              if (data.data.success) {
                showAnswerInput.value = true
                canBuzz.value = false
              } else {
                alert('他のプレイヤーが先に押しました！')
              }
              break

            case 'question-result':
              addDebugMessage(`回答結果: ${JSON.stringify(data.data)}`)
              console.log('回答結果:', data.data)
              showAnswerInput.value = false
              answer.value = ''
              if (data.data.correct) {
                alert('正解！')
              } else {
                alert(`不正解。正解は: ${data.data.correctAnswer}`)
              }
              break

            case 'error':
              addDebugMessage(`エラー: ${data.data.message}`)
              console.error('バックエンドエラー:', data.data.message)

              // ルーム参加エラーの場合、詳細情報を表示
              if (data.data.message.includes('Room not found or player name already exists')) {
                alert(`ルーム参加エラー: ${data.data.message}\n\nルームID: ${actualRoomId.value}\nプレイヤー名: ${playerName.value}\n\nバックエンドチームに連絡が必要です。`)
              } else {
                alert(`エラー: ${data.data.message}`)
              }
              break

            default:
              addDebugMessage(`未処理のイベント: ${data.event}`)
              console.log('未処理のイベント:', data.event, data)
          }
        } catch (error) {
          addDebugMessage(`メッセージ解析エラー: ${error}`)
          console.error('メッセージ解析エラー:', error)
        }
      }

      socket.onerror = (error) => {
        addDebugMessage(`WebSocket接続エラー: ${error}`)
        console.error('WebSocket接続エラー:', error)
        alert('WebSocket接続エラーが発生しました。バックエンドサーバーが起動しているか確認してください。')
      }

      socket.onclose = (event) => {
        addDebugMessage(`WebSocket接続切断: ${event.code} - ${event.reason}`)
        console.log('WebSocket接続切断:', event.code, event.reason)
        if (event.code !== 1000) {
          alert(`WebSocket接続が予期せず切断されました: ${event.code} - ${event.reason}`)
        }
      }
    }, 2000) // 2秒待機
  } catch (error) {
    addDebugMessage(`ルーム作成に失敗しました: ${error}`)
    alert(`ルーム作成に失敗しました: ${error}`)
  }
}

const buzzIn = () => {
  if (socket && canBuzz.value) {
    const message = {
      event: 'buzz-in',
      data: { roomId: actualRoomId.value || roomId }
    }
    socket.send(JSON.stringify(message))
  }
}

const submitAnswer = () => {
  if (socket && answer.value.trim()) {
    const message = {
      event: 'submit-answer',
      data: {
        roomId: actualRoomId.value || roomId,
        answer: answer.value.trim()
      }
    }
    socket.send(JSON.stringify(message))
  }
}

// 管理者機能
const startGame = () => {
  if (socket) {
    const message = {
      event: 'start-game',
      data: { roomId: actualRoomId.value || roomId }
    }
    socket.send(JSON.stringify(message))
    addDebugMessage(`ゲーム開始メッセージ送信: ${JSON.stringify(message)}`)
  }
}

const judgeAnswer = (playerId: string, correct: boolean) => {
  if (socket) {
    const message = {
      event: 'judge-answer',
      data: {
        roomId: actualRoomId.value || roomId,
        playerId,
        correct
      }
    }
    socket.send(JSON.stringify(message))
    addDebugMessage(`判定メッセージ送信: ${JSON.stringify(message)}`)
  }
}

const resetQueue = () => {
  if (socket) {
    const message = {
      event: 'reset-queue',
      data: { roomId: actualRoomId.value || roomId }
    }
    socket.send(JSON.stringify(message))
    addDebugMessage(`キューリセットメッセージ送信: ${JSON.stringify(message)}`)
  }
}

const endGame = () => {
  if (socket) {
    const message = {
      event: 'end-game',
      data: { roomId: actualRoomId.value || roomId }
    }
    socket.send(JSON.stringify(message))
    addDebugMessage(`ゲーム終了メッセージ送信: ${JSON.stringify(message)}`)
  }
}

onUnmounted(() => {
  if (socket) {
    socket.close()
  }
})
</script>
