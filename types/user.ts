export interface User {
  user_id: number
  username: string
  email: string
  password_hash?: string // Optional as it shouldn't be exposed to frontend
  avatar_url: string
  phone: string | null
  role: 'admin' | 'user'
  balance: number
  bank_name: string | null
  bank_account_number: string | null
  bank_account_holder: string | null
  created_at: string
  is_active: boolean
}

