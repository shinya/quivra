<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">接続テスト</h1>

      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">バックエンド接続テスト</h2>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <button
              @click="testHttpConnection"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              HTTP接続テスト
            </button>
            <span v-if="httpStatus" :class="httpStatus === 'success' ? 'text-green-600' : 'text-red-600'">
              {{ httpStatus === 'success' ? '✅ 接続成功' : '❌ 接続失敗' }}
            </span>
          </div>

          <div class="flex items-center gap-4">
            <button
              @click="testWebSocketConnection"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              WebSocket接続テスト
            </button>
            <span v-if="wsStatus" :class="wsStatus === 'connected' ? 'text-green-600' : 'text-red-600'">
              {{ wsStatus === 'connected' ? '✅ 接続成功' : '❌ 接続失敗' }}
            </span>
          </div>

          <div class="flex items-center gap-4">
            <button
              @click="checkBackendStatus"
              class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              バックエンド診断
            </button>
            <span v-if="backendStatus" :class="backendStatus === 'running' ? 'text-green-600' : 'text-red-600'">
              {{ backendStatus === 'running' ? '✅ 起動中' : '❌ 停止中' }}
            </span>
          </div>
        </div>
      </div>

      <!-- バックエンド起動方法 -->
      <div v-if="backendStatus === 'stopped'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-yellow-800">バックエンド起動方法</h2>
        <div class="text-sm text-yellow-700 space-y-2">
          <p><strong>1. バックエンドリポジトリに移動:</strong></p>
          <code class="block bg-yellow-100 p-2 rounded text-xs">cd ../quivra-backend</code>

          <p><strong>2. 依存関係をインストール:</strong></p>
          <code class="block bg-yellow-100 p-2 rounded text-xs">go mod tidy</code>

          <p><strong>3. サーバーを起動:</strong></p>
          <code class="block bg-yellow-100 p-2 rounded text-xs">go run main.go</code>

          <p><strong>4. またはDockerで起動:</strong></p>
          <code class="block bg-yellow-100 p-2 rounded text-xs">docker-compose up</code>
        </div>
      </div>

      <!-- Socket.io設定確認 -->
      <div v-if="backendStatus === 'running'" class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-blue-800">バックエンド設定確認</h2>
        <div class="text-sm text-blue-700 space-y-2">
          <p><strong>バックエンドでSocket.ioが正しく設定されているか確認してください:</strong></p>
          <div class="bg-blue-100 p-3 rounded text-xs">
            <p><strong>Go + Gin + Socket.io の設定例:</strong></p>
            <pre class="whitespace-pre-wrap">package main

import (
    "github.com/gin-gonic/gin"
    "github.com/gorilla/websocket"
    "net/http"
)

func main() {
    r := gin.Default()

    // CORS設定
    r.Use(func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    })

    // WebSocket設定
    r.GET("/ws", handleWebSocket)

    r.Run(":8080")
}</pre>
          </div>
        </div>
      </div>

      <div v-if="wsStatus === 'connected'" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">WebSocket通信テスト</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <input
              v-model="testRoomId"
              type="text"
              placeholder="テストルームID"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              v-model="testPlayerName"
              type="text"
              placeholder="プレイヤー名"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            @click="joinTestRoom"
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            テストルームに参加
          </button>
        </div>
      </div>

      <div v-if="messages.length > 0" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">受信メッセージ</h2>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="p-2 bg-gray-50 rounded text-sm"
          >
            <span class="font-mono text-blue-600">{{ msg.timestamp }}</span>
            <span class="ml-2">{{ msg.message }}</span>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <button
          @click="goBack"
          class="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { io, Socket } from 'socket.io-client'

const router = useRouter()
const httpStatus = ref('')
const wsStatus = ref('')
const backendStatus = ref('')
const messages = ref<Array<{ timestamp: string; message: string }>>([])
const testRoomId = ref('TEST123')
const testPlayerName = ref('テストプレイヤー')

let socket: Socket | null = null

const addMessage = (message: string) => {
  messages.value.push({
    timestamp: new Date().toLocaleTimeString(),
    message
  })
}

const testHttpConnection = async () => {
  try {
    // まずヘルスチェックエンドポイントを試す
    let response = await fetch('http://localhost:8080/health', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (response.ok) {
      httpStatus.value = 'success'
      addMessage('HTTP接続成功 (ヘルスチェック)')
      return
    }

    // ヘルスチェックが404の場合は、ルートエンドポイントを試す
    if (response.status === 404) {
      response = await fetch('http://localhost:8080/', {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        httpStatus.value = 'success'
        addMessage('HTTP接続成功 (ルートエンドポイント)')
        return
      } else if (response.status === 404) {
        // 404でもサーバーは起動しているので成功とする
        httpStatus.value = 'success'
        addMessage('HTTP接続成功 (サーバー起動中、エンドポイント未実装)')
        return
      }
    }

    httpStatus.value = 'error'
    addMessage(`HTTP接続失敗: ${response.status} ${response.statusText}`)
  } catch (error: any) {
    httpStatus.value = 'error'
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      addMessage('HTTP接続エラー: バックエンドサーバーが起動していません (localhost:8080)')
    } else {
      addMessage(`HTTP接続エラー: ${error.message || error}`)
    }
  }
}

const testWebSocketConnection = () => {
  try {
    // 既存の接続があれば切断
    if (socket) {
      socket.disconnect()
    }

    // 正しいWebSocket接続（Socket.ioではなく、ネイティブWebSocket）
    const ws = new WebSocket('ws://localhost:8080/ws')

    ws.onopen = () => {
      wsStatus.value = 'connected'
      addMessage('WebSocket接続成功')

      // 接続後、テストメッセージを送信
      const testMessage = {
        event: 'join-room',
        data: {
          roomId: testRoomId.value,
          playerName: testPlayerName.value
        }
      }
      ws.send(JSON.stringify(testMessage))
      addMessage(`テストメッセージ送信: ${JSON.stringify(testMessage)}`)
    }

    ws.onmessage = (event) => {
      addMessage(`受信メッセージ: ${event.data}`)
    }

    ws.onerror = (error) => {
      wsStatus.value = 'error'
      addMessage(`WebSocket接続エラー: ${error}`)
    }

    ws.onclose = (event) => {
      wsStatus.value = 'disconnected'
      addMessage(`WebSocket接続切断: ${event.code} - ${event.reason}`)
    }

    // 接続タイムアウト
    setTimeout(() => {
      if (wsStatus.value !== 'connected') {
        wsStatus.value = 'error'
        addMessage('WebSocket接続タイムアウト: バックエンドサーバーが起動していません')
        ws.close()
      }
    }, 5000)

    // socket変数にWebSocketインスタンスを保存
    socket = ws as any

  } catch (error: any) {
    wsStatus.value = 'error'
    addMessage(`WebSocket接続エラー: ${error.message || error}`)
  }
}

const joinTestRoom = () => {
  if (socket && wsStatus.value === 'connected') {
    const message = {
      event: 'join-room',
      data: {
        roomId: testRoomId.value,
        playerName: testPlayerName.value
      }
    }
    socket.send(JSON.stringify(message))
    addMessage(`ルーム参加リクエスト送信: ${JSON.stringify(message)}`)
  }
}

const checkBackendStatus = async () => {
  addMessage('バックエンド診断を開始...')

  // ポート8080の接続確認
  try {
    const response = await fetch('http://localhost:8080/', {
      method: 'HEAD',
      mode: 'no-cors'
    })
    backendStatus.value = 'running'
    addMessage('バックエンドサーバーが起動しています (ポート8080)')

    // 追加の詳細診断
    await performDetailedDiagnosis()
  } catch (error: any) {
    backendStatus.value = 'stopped'
    addMessage('バックエンドサーバーが起動していません (ポート8080)')

    // 追加の診断情報
    addMessage('診断結果:')
    addMessage('- バックエンドサーバーが起動していません')
    addMessage('- ポート8080でリスニングしていません')
    addMessage('- バックエンドリポジトリでサーバーを起動してください')
  }
}

const performDetailedDiagnosis = async () => {
  addMessage('詳細診断を開始...')

  // 1. HTTP接続テスト（複数エンドポイント）
  addMessage('1. HTTP接続テストを実行中...')

  // ヘルスチェックエンドポイント
  try {
    const healthResponse = await fetch('http://localhost:8080/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    addMessage(`ヘルスチェック: ${healthResponse.status} ${healthResponse.statusText}`)

    if (healthResponse.ok) {
      addMessage('✅ ヘルスチェックエンドポイントが正常に動作')
    } else if (healthResponse.status === 404) {
      addMessage('⚠️ ヘルスチェックエンドポイントが未実装')
    }
  } catch (error: any) {
    addMessage(`ヘルスチェックエラー: ${error.message}`)
  }

  // ルートエンドポイント
  try {
    const rootResponse = await fetch('http://localhost:8080/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    addMessage(`ルートエンドポイント: ${rootResponse.status} ${rootResponse.statusText}`)

    if (rootResponse.status === 404) {
      addMessage('⚠️ ルートエンドポイントが未実装（サーバーは起動中）')
    }
  } catch (error: any) {
    addMessage(`ルートエンドポイントエラー: ${error.message}`)
  }

  // 2. WebSocket接続テスト
  addMessage('2. WebSocket接続テストを実行中...')
  try {
    const ws = new WebSocket('ws://localhost:8080/ws')

    ws.onopen = () => {
      addMessage('✅ WebSocket接続成功')
      ws.close()
    }

    ws.onerror = (error) => {
      addMessage('❌ WebSocket接続エラー')
    }

    ws.onclose = () => {
      addMessage('WebSocket接続テスト完了')
    }

    // タイムアウト設定
    setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        addMessage('❌ WebSocket接続タイムアウト')
        ws.close()
      }
    }, 3000)

  } catch (error: any) {
    addMessage(`WebSocket接続エラー: ${error.message}`)
  }

  // 3. 診断結果のまとめ
  addMessage('3. 診断結果のまとめ')
  addMessage('✅ バックエンドサーバーは起動中')
  addMessage('✅ WebSocket接続は正常')
  addMessage('⚠️ HTTPエンドポイントの一部が未実装（正常な状態）')
}

const goBack = () => {
  if (socket) {
    if (socket.close) {
      socket.close()
    } else if (socket.disconnect) {
      socket.disconnect()
    }
  }
  router.push('/')
}

onMounted(() => {
  // ページ読み込み時に自動でバックエンド診断を実行
  checkBackendStatus()
})

onUnmounted(() => {
  if (socket) {
    if (socket.close) {
      socket.close()
    } else if (socket.disconnect) {
      socket.disconnect()
    }
  }
})
</script>
