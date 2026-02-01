import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// 環境変数からAPI URLを取得（フォールバックとしてローカルURLを使用）
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 
                     process.env.EXPO_PUBLIC_API_URL || 
                     'http://localhost:3000';

console.log('🌐 API Base URL:', API_BASE_URL);

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('トークンの読み込みエラー:', error);
    }
  }

  private async saveToken(token: string) {
    try {
      this.token = token;
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('トークンの保存エラー:', error);
    }
  }

  async clearToken() {
    try {
      this.token = null;
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('トークンの削除エラー:', error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token && !endpoint.includes('/auth/')) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const fullUrl = `${this.baseUrl}${endpoint}`;
    console.log('🔗 API Request:', fullUrl);

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API Error:', response.status, data);
        throw new Error(data.error || data.message || 'リクエストに失敗しました');
      }

      return data;
    } catch (error: any) {
      console.error('API request error:', error);
      throw new Error(error.message || 'ネットワークエラーが発生しました');
    }
  }

  // Auth endpoints
  async signUp(email: string, password: string, displayName?: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });

    await this.saveToken(response.token);
    return response;
  }

  async signIn(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await this.saveToken(response.token);
    return response;
  }

  async signOut() {
    await this.clearToken();
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me', {
      method: 'GET',
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Foods endpoints
  async searchFoods(query: string) {
    return this.request<{ foods: any[] }>(`/foods/search?query=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
  }

  async getFoodById(foodId: string) {
    return this.request<any>(`/foods/${foodId}`, {
      method: 'GET',
    });
  }

  // Settings endpoints
  async getSettings(userId: string) {
    return this.request<any>(`/users/${userId}/settings`, {
      method: 'GET',
    });
  }

  async updateSettings(userId: string, settings: any) {
    return this.request<any>(`/users/${userId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Meals endpoints
  async addMeal(meal: any) {
    return this.request<{ message: string; id: string }>('/meals', {
      method: 'POST',
      body: JSON.stringify(meal),
    });
  }

  async getDailySummary(userId: string, date: string) {
    return this.request<any>(`/meals/${userId}/daily/${date}`, {
      method: 'GET',
    });
  }

  async getMeals(userId: string, startDate?: string, endDate?: string) {
    let url = `/meals/${userId}`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return this.request<any[]>(url, {
      method: 'GET',
    });
  }

  // 既存のメソッド（互換性のため残す）
  async getMealsByDateRange(startDate: Date, endDate: Date) {
    // TODO: userIdを適切に取得する必要がある
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    return this.getMeals('current-user', start, end);
  }

  async createMeal(meal: any) {
    return this.addMeal(meal);
  }

  async createMealsBatch(meals: any[]) {
    // バッチ処理は個別に送信
    const results = [];
    for (const meal of meals) {
      const result = await this.addMeal(meal);
      results.push(result);
    }
    return { insertedIds: results.map(r => r.id) };
  }

  async deleteMeal(mealId: string) {
    // TODO: バックエンドに削除APIを追加する必要がある
    console.warn('削除APIは未実装です');
    return Promise.resolve();
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
