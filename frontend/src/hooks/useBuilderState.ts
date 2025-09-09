import { useState, useCallback } from 'react';
import { APP_CONFIG } from '../config/constants';
import type { BuilderState, QuestionData, QuestionOption } from '../types/builder';

// Custom hook for builder state management
export function useBuilderState() {
  const [state, setState] = useState<BuilderState>({
    loading: false,
    isComplete: false,
    imageBase64: null,
    questionText: '',
    options: [],
    selectedOptions: [],
    currentStep: 0,
    totalSteps: APP_CONFIG.DEFAULT_TOTAL_STEPS,
    customInput: '',
    isMultiselect: false,
  });

  const resetQuestionState = useCallback(() => {
    setState(prev => ({
      ...prev,
      questionText: '',
      options: [],
      currentStep: 0,
      totalSteps: APP_CONFIG.DEFAULT_TOTAL_STEPS,
      customInput: '',
    }));
  }, []);

  const resetAllState = useCallback(() => {
    setState({
      loading: false,
      isComplete: false,
      imageBase64: null,
      questionText: '',
      options: [],
      selectedOptions: [],
      currentStep: 0,
      totalSteps: APP_CONFIG.DEFAULT_TOTAL_STEPS,
      customInput: '',
      isMultiselect: false,
    });
  }, []);

  const setQuestionState = useCallback((data: QuestionData) => {
    setState(prev => ({
      ...prev,
      questionText: data.question_text || data.ai_message || '',
      options: data.options || [],
      currentStep: data.current_step || 0,
      totalSteps: data.total_steps || APP_CONFIG.DEFAULT_TOTAL_STEPS,
      isComplete: false,
      customInput: '',
      isMultiselect: data.is_multiselect || false,
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setIsComplete = useCallback((isComplete: boolean) => {
    setState(prev => ({ ...prev, isComplete }));
  }, []);

  const setImageBase64 = useCallback((imageBase64: string | null) => {
    setState(prev => ({ ...prev, imageBase64 }));
  }, []);

  const setCustomInput = useCallback((customInput: string) => {
    setState(prev => ({ ...prev, customInput }));
  }, []);

  const setSelectedOptions = useCallback((selectedOptions: QuestionOption[]) => {
    setState(prev => ({ ...prev, selectedOptions }));
  }, []);

  return {
    ...state,
    resetQuestionState,
    resetAllState,
    setQuestionState,
    setLoading,
    setIsComplete,
    setImageBase64,
    setCustomInput,
    setSelectedOptions,
  };
}
