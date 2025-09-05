// Builder-specific types and interfaces
export interface QuestionOption {
  number: number;
  text: string;
  value: string;
}

export interface QuestionData {
  question_text?: string;
  ai_message?: string;
  options?: QuestionOption[];
  current_step?: number;
  total_steps?: number;
  is_complete?: boolean;
  is_multiselect?: boolean;
  should_follow_anatomy?: boolean;
}

export interface BuilderState {
  loading: boolean;
  isComplete: boolean;
  imageBase64: string | null;
  questionText: string;
  options: QuestionOption[];
  currentStep: number;
  totalSteps: number;
  customInput: string;
  selectedOptions: QuestionOption[];
  isMultiselect: boolean;
}

export interface BuilderActions {
  sendMessage: (userContent?: string) => Promise<void>;
  handleCustomSubmit: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  downloadImage: () => void;
  clearSession: () => void;
  resetQuestionState: () => void;
  setQuestionState: (data: QuestionData) => void;
  updateMessages: (userContent: string | undefined, aiMessage: string) => void;
  handleOptionSelect: (option: QuestionOption) => void;
  handleContinue: () => void;
}