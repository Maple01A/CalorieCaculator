import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';

export interface User {
  id: string;
  email: string;
  displayName: string;
  dailyCalorieGoal?: number;
  isGuest?: boolean; // ゲストフラグ
}

class AuthService {
  private currentUser: User | null = null;
  private listeners: Array<(user: User | null) => void> = [];

  // 現在のユーザーを取得
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // ゲストモードかどうかを確認
  isGuestMode(): boolean {
    return this.currentUser?.isGuest === true;
  }

  // 認証状態の監視
  onAuthStateChanged(callback: (user: User | null) => void) {
    this.listeners.push(callback);
    
    // 初回実行
    this.checkAuthState().then(() => {
      callback(this.currentUser);
    });

    // アンサブスクライブ関数を返す
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  private async checkAuthState() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userJson = await AsyncStorage.getItem('currentUser');
      const isGuest = await AsyncStorage.getItem('isGuestMode');
      
      if (token && userJson) {
        this.currentUser = JSON.parse(userJson);
      } else if (isGuest === 'true' && userJson) {
        this.currentUser = JSON.parse(userJson);
      } else {
        this.currentUser = null;
      }
    } catch (error) {
      console.error('認証状態の確認エラー:', error);
      this.currentUser = null;
    }
  }

  // ゲストとして開始
  async startAsGuest(): Promise<User> {
    try {
      const guestUser: User = {
        id: `guest_${Date.now()}`,
        email: '',
        displayName: 'ゲストユーザー',
        dailyCalorieGoal: 2000,
        isGuest: true,
      };

      this.currentUser = guestUser;
      await AsyncStorage.setItem('currentUser', JSON.stringify(guestUser));
      await AsyncStorage.setItem('isGuestMode', 'true');
      
      this.notifyListeners();
      return guestUser;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // ゲストからアカウント作成
  async convertGuestToUser(email: string, password: string, displayName?: string): Promise<User> {
    try {
      // まず新規登録
      const response = await apiClient.signUp(email, password, displayName);
      
      // ゲストモードフラグを削除
      await AsyncStorage.removeItem('isGuestMode');
      
      this.currentUser = response.user;
      await AsyncStorage.setItem('currentUser', JSON.stringify(response.user));
      await AsyncStorage.setItem('lastLoginEmail', email);
      
      this.notifyListeners();
      return response.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // メールアドレスでログイン
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const response = await apiClient.signIn(email, password);
      
      // ゲストモードフラグを削除
      await AsyncStorage.removeItem('isGuestMode');
      
      this.currentUser = response.user;
      await AsyncStorage.setItem('currentUser', JSON.stringify(response.user));
      await AsyncStorage.setItem('lastLoginEmail', email);
      
      this.notifyListeners();
      return response.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // メールアドレスで新規登録
  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<User> {
    try {
      const response = await apiClient.signUp(email, password, displayName);
      
      // ゲストモードフラグを削除
      await AsyncStorage.removeItem('isGuestMode');
      
      this.currentUser = response.user;
      await AsyncStorage.setItem('currentUser', JSON.stringify(response.user));
      await AsyncStorage.setItem('lastLoginEmail', email);
      
      this.notifyListeners();
      return response.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // ログアウト
  async signOut(): Promise<void> {
    try {
      if (!this.isGuestMode()) {
        await apiClient.signOut();
      }
      
      // AsyncStorageからユーザー情報を削除
      await AsyncStorage.removeItem('currentUser');
      await AsyncStorage.removeItem('isGuestMode');
      await AsyncStorage.removeItem('authToken');
      
      this.currentUser = null;
      this.notifyListeners();
      
      console.log('✅ ログアウト完了');
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // 最後にログインしたメールアドレスを取得
  async getLastLoginEmail(): Promise<string | null> {
    return await AsyncStorage.getItem('lastLoginEmail');
  }

  // エラーハンドリング
  private handleAuthError(error: any): Error {
    let message = 'エラーが発生しました';

    if (error.message) {
      message = error.message;
    }

    // より具体的なエラーメッセージに変換
    if (message.includes('email')) {
      message = 'メールアドレスの形式が正しくありません';
    } else if (message.includes('password')) {
      message = 'パスワードは6文字以上で設定してください';
    } else if (message.includes('already')) {
      message = 'このメールアドレスは既に使用されています';
    } else if (message.includes('incorrect') || message.includes('正しくありません')) {
      message = 'メールアドレスまたはパスワードが正しくありません';
    } else if (message.includes('network') || message.includes('ネットワーク')) {
      message = 'ネットワークエラーが発生しました';
    }

    return new Error(message);
  }
}

export const authService = new AuthService();
