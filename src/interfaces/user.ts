export interface User {
  id: string,
  email: string,
  name: string,
  last_name: string
  hashed_password: string,
  created_at: Date,
  updated_at: Date,
}