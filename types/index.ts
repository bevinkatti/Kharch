export type Category = "fixed" | "living" | "savings";

export interface CheckItem {
  id: string;
  label: string;
  amount: number;
  source?: "expense" | "manual";
  expense_id?: string;
  category?: Category;
}

export interface Expense {
  id: string;
  month_id: string;
  clerk_id: string;
  label: string;
  category: Category;
  amount: number;
  sort_order: number;
  created_at: string;
}

export interface Month {
  id: string;
  clerk_id: string;
  month_key: string;
  salary: number;
  bonus: number;
  ef_amount: number;
  notes: string;
  checks: boolean[];
  check_items: CheckItem[] | null;
  created_at: string;
  updated_at: string;
  expenses?: Expense[];
}

export interface UserSettings {
  id: string;
  clerk_id: string;
  currency: string;
  city_label: string;
  ef_target: number;
  salary: number;
  salary_day?: number | null;
  created_at: string;
  updated_at: string;
}

export interface MonthSummary {
  month_key: string;
  label: string;
  full_label: string;
  total_saved: number;
  salary: number;
  fixed: number;
  living: number;
  savings: number;
  buffer: number;
  is_logged: boolean;
  checks_done: number;
  checks_total: number;
}

export interface YearStats {
  total_saved: number;
  months_logged: number;
  avg_saved_per_month: number;
  best_month: string | null;
  current_streak: number;
}

export interface ApiSuccess<T> { data: T; error: null; }
export interface ApiError       { data: null; error: string; }
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
