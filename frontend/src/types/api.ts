// API-related types and interfaces
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface ChatApiRequest {
  project_id: string;
  user_message: string;
}

export interface ChatApiResponse {
  ai_message: string;
  question_text?: string;
  options?: Array<{ number: number; text: string; value: string }>;
  current_step?: number;
  total_steps?: number;
  is_complete?: boolean;
}

export interface ImageApiRequest {
  project_id: string;
}

export interface ImageApiResponse {
  image_base64: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}
