// バックエンド（quivra-backend）の API / WebSocket プロトコルに対応する型定義

export interface User {
  id: string
  username: string
  display_name: string
}

export interface QuestionSet {
  id: number
  slug: string
  name: string
  is_preset: boolean
  question_count: number
}

export type RoomStatus = 'waiting' | 'playing' | 'results' | 'closed'
export type ReadingMode = 'oral' | 'text'
export type QuestionOrder = 'sequential' | 'random'
export type Role = 'host' | 'player' | 'spectator'

export interface Room {
  id: string
  name: string
  host_id: string
  status: RoomStatus
  question_set_id: number | null
  reading_mode: ReadingMode
  question_order: QuestionOrder
  char_interval_ms: number
  points_correct: number
  points_wrong: number
  allow_drop_in: boolean
  current_index: number
  created_at: string
}

export interface RoomSummary extends Room {
  host_name: string
  player_count: number
  spectator_count: number
  question_set_name?: string
  question_count: number
}

export interface RoomMember {
  room_id: string
  user_id: string
  display_name: string
  role: Role
  score: number
  joined_at: string
}

// --- WebSocket: room_state ---

export type QState = 'idle' | 'reading' | 'answering'

export interface StateRoom {
  id: string
  name: string
  host_id: string
  status: RoomStatus
  reading_mode: ReadingMode
  question_order: QuestionOrder
  char_interval_ms: number
  points_correct: number
  points_wrong: number
  allow_drop_in: boolean
  question_set: { id: number; name: string } | null
  current_index: number
  total_questions: number | null
}

export interface StateMember {
  user_id: string
  display_name: string
  role: Role
  score: number
  connected: boolean
}

export interface StateReveal {
  revealed: number
  running: boolean
  interval_ms: number
  total_chars: number
}

export interface QuestionResult {
  reason: 'correct' | 'skip'
  correct_user_id?: string
  text?: string
  answer?: string
  explanation?: string
}

export interface RankingEntry {
  user_id: string
  display_name: string
  score: number
  rank: number
}

export interface StateGame {
  q_state: QState
  question_number: number
  queue: string[]
  answering?: string
  locked_out: string[]
  buzzed: string[]
  reveal: StateReveal | null
  question: { text?: string; difficulty?: string } | null
  host_view?: { text: string; answer: string; explanation: string } | null
  last_result: QuestionResult | null
  ranking?: RankingEntry[] | null
}

export interface RoomState {
  room: StateRoom
  members: StateMember[]
  you: StateMember
  game: StateGame
}

export interface ServerEvent {
  kind: string
  data?: Record<string, unknown>
}
