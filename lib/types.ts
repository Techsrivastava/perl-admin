// Type definitions for the entire system
export interface User {
  id: number
  email: string
  role: "super_admin" | "university" | "consultancy" | "agent"
  name: string
  phone?: string
  status: "active" | "inactive" | "suspended"
  created_at: string
  updated_at: string
}

export interface University {
  id: number
  user_id: number
  name: string
  registration_number: string
  authorized_person: string
  contact_email: string
  contact_phone: string
  address: string
  city: string
  state: string
  country: string
  wallet_balance: number
  total_received: number
  total_payable: number
  status: "pending" | "approved" | "rejected" | "suspended"
  created_at: string
  updated_at: string
}

export interface Consultancy {
  id: number
  user_id: number
  name: string
  owner_name: string
  registration_number: string
  contact_email: string
  contact_phone: string
  address: string
  wallet_balance: number
  total_collected: number
  total_university_payable: number
  total_agent_payable: number
  net_profit: number
  status: "pending" | "approved" | "rejected" | "suspended"
  created_at: string
  updated_at: string
}

export interface Agent {
  id: number
  user_id: number
  consultancy_id: number
  name: string
  contact_email: string
  contact_phone: string
  wallet_balance: number
  total_fees_submitted: number
  total_commission_earned: number
  total_commission_paid: number
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface Course {
  id: number
  name: string
  stream: string
  duration_years: number
  level: "UG" | "PG" | "Diploma"
  mode: "Regular" | "Online" | "Distance"
  eligibility: string
  syllabus?: string
  created_at: string
  updated_at: string
}

export interface Admission {
  id: number
  student_name: string
  student_email: string
  student_phone: string
  university_id: number
  course_id: number
  consultancy_id: number
  agent_id: number
  total_fee: number
  fee_received: number
  fee_pending: number
  university_fee: number
  consultancy_profit: number
  agent_commission: number
  status: "pending" | "approved" | "reverted" | "rejected"
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_universities: number
  total_consultancies: number
  total_agents: number
  total_students: number
  pending_admissions: number
  approved_admissions: number
  reverted_admissions: number
  total_fees_collected: number
  fees_paid_to_universities: number
  agent_commissions_paid: number
  consultancy_profit: number
  system_profit: number
}
