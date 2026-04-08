export interface User {
  id: string
  email: string
  username: string
  hp: number
  maxHp: number
  xp: number
  xpToNextLevel: number
  level: number
  gold: number
  streakDays: number
  createdAt: string
}

export type TaskType = 'habit' | 'daily' | 'todo'
export type TaskDifficulty = 'trivial' | 'easy' | 'medium' | 'hard'

export interface Task {
  id: string
  title: string
  notes: string | null
  type: TaskType
  difficulty: TaskDifficulty
  completed: boolean
  completedAt: string | null
  lastCompletedAt: string | null
  streak: number
  habitPositive: boolean
  habitNegative: boolean
  habitScore: number
  dueDate: string | null
  isActive: boolean
  userId: string
  createdAt: string
}

export interface Item {
  id: string
  name: string
  description: string
  type: 'weapon' | 'armor' | 'helmet' | 'accessory' | 'potion'
  price: number
  strBonus: number
  conBonus: number
  intBonus: number
}

export interface InventoryItem {
  id: string
  itemId: string
  item: Item
  equipped: boolean
  acquiredAt: string
}

export interface Achievement {
  id: string
  key: string
  title: string
  description: string
  unlockedAt: string
}

export interface CompleteTaskResponse {
  task: Task
  reward: {
    xpGained: number
    goldGained: number
    levelUp: boolean
    newLevel: number
    newXp: number
    newGold: number
    newHp: number
  } | null
  message: string
}
