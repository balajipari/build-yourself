import { API_CONFIG } from '../config/api';
import { API_ENDPOINTS } from '../config/constants';
import { authService } from './auth';

interface FeedbackData {
  feedback_text: string;
  selected_tags?: string[];
  rating?: number;
}

class FeedbackService {
  async submitFeedback(data: FeedbackData): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if user is authenticated
      const token = authService.getJWTToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.FEEDBACK.SUBMIT}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService();
