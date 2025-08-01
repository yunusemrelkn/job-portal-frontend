import { User, getRoleString, getRoleEnum } from '../types';
import api from './api';

export const authService = {
  async login(email: string, password: string) {
    try {
      console.log('Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });
      const { token, user: rawUser } = response.data;
      
      // Normalize user role to string
      const user: User = {
        ...rawUser,
        role: getRoleString(rawUser.role)
      };
      
      console.log('Login successful - Raw user:', rawUser);
      console.log('Login successful - Normalized user:', user);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  async register(userData: {
    name: string;
    surname: string;
    email: string;
    password: string;
    phone?: string;
    role: string;
    companyId?: number;
  }) {
    try {
      console.log('Attempting registration:', { ...userData, password: '[HIDDEN]' });
      
      // Convert role string to enum for backend
      const backendUserData = {
        ...userData,
        role: getRoleEnum(userData.role)
      };
      
      const response = await api.post('/auth/register', backendUserData);
      const { token, user: rawUser } = response.data;
      
      // Normalize user role to string
      const user: User = {
        ...rawUser,
        role: getRoleString(rawUser.role)
      };
      
      console.log('Registration successful - Raw user:', rawUser);
      console.log('Registration successful - Normalized user:', user);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout() {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      const rawUser = JSON.parse(userStr);
      
      // Ensure role is always a string
      const user: User = {
        ...rawUser,
        role: getRoleString(rawUser.role)
      };
      
      console.log('Current user - Raw:', rawUser);
      console.log('Current user - Normalized:', user);
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      localStorage.removeItem('user');
      return null;
    }
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const isAuth = !!(token && user);
    console.log('Is authenticated:', isAuth);
    return isAuth;
  }
};