export interface ValidationResult {
  is_safe: boolean;
  violation_type: string;
  risk_level: string;
  creative_score: number;
  suggestions: string[];
  explanation: string;
  enhanced_prompt?: string;
  message?: string;
}

export interface ValidationResponse {
  message: string;
  validation_result: ValidationResult;
  is_safe: boolean;
  suggestions: string[];
  explanation: string;
  risk_level: string;
}
