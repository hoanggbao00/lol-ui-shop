export interface Item {
  id: number
  firestoreId?: string // Firestore document ID gốc
  name: string
  description: string
  rank: string
  level: number
  championCount: number
  skinCount: number
  blueEssence: number
  riotPoints: number
  notableSkins: string
  rentPrice: number
  buyPrice: number
  status: 'available' | 'rented' | 'sold'
  image: string
}
