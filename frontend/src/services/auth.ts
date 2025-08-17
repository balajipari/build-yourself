import { API_CONFIG } from '../config/api';
import { API_ENDPOINTS } from '../config/constants';
import type { User, AuthResponse } from '../types/auth';

class AuthService {

  async getGoogleAuthUrl(): Promise<string> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE_URL}`);
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      const data = await response.json();
      return data.authorization_url;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      throw error;
    }
  }

  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.CALLBACK}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate');
      }

      const data: AuthResponse = await response.json();
      
      // Store tokens in localStorage
      this.storeTokens(data);
      
      return data;
    } catch (error) {
      console.error('Error handling Google callback:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getJWTToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const user: User = await response.json();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      this.clearTokens();
      return null;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return false;
      }

      const data = await response.json();
      this.updateAccessToken(data.access_token);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getJWTToken();
      if (token) {
        await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.clearTokens();
    }
  }

  isAuthenticated(): boolean {
    const token = this.getJWTToken();
    return !!token;
  }

  private storeTokens(authData: AuthResponse): void {
    localStorage.setItem('jwt_token', authData.jwt_token);
    localStorage.setItem('refresh_token', authData.refresh_token);
    localStorage.setItem('access_token', authData.access_token);
    localStorage.setItem('user_info', JSON.stringify(authData.user_info));
  }

  private clearTokens(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
  }

  private getJWTToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private updateAccessToken(accessToken: string): void {
    localStorage.setItem('access_token', accessToken);
  }

  getUserInfo(): User | null {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }
}

export const authService = new AuthService();
