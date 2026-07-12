import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError, getToken, setToken } from './api'

describe('token storage', () => {
  afterEach(() => setToken(null))

  it('保存と削除ができる', () => {
    expect(getToken()).toBeNull()
    setToken('abc')
    expect(getToken()).toBe('abc')
    setToken(null)
    expect(getToken()).toBeNull()
  })
})

describe('api', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    setToken(null)
  })

  it('成功時は JSON を返す', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    ))
    await expect(api<{ ok: boolean }>('/test')).resolves.toEqual({ ok: true })
  })

  it('トークンがあれば Authorization ヘッダを付ける', async () => {
    setToken('tok123')
    const mock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', mock)
    await api('/test')
    const headers = mock.mock.calls[0][1].headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer tok123')
  })

  it('エラー時は ApiError を投げ、サーバーの error メッセージを使う', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: '出題者のみ操作できます' }), { status: 400 }),
    ))
    await expect(api('/test')).rejects.toThrowError(
      expect.objectContaining({ message: '出題者のみ操作できます', status: 400 }) as ApiError,
    )
  })
})
