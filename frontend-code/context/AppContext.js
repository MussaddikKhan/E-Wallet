'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ApiContext = createContext();

// Consider moving this to environment variables
const SERVICE_URLS = {
  user: 'http://localhost:8082/user',
  wallet: 'http://localhost:8083/wallet',
  bank: 'http://localhost:8085/bank',
  transaction: 'http://localhost:8081/transaction', // Verify this matches your backend
};

export const ApiProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
    setAuthLoading(false);
  }, []);

  const handleLogin = useCallback((jwtToken, username) => {
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('phone', username);  // Make sure username here is phone number or rename accordingly
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('phone');
  }, []);

  const safeFetch = async (url, options = {}, requiresAuth = true) => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (requiresAuth) {
        const localToken = token || localStorage.getItem('token');
        if (!localToken) {
          throw new Error('Authentication required. Please login.');
        }
        headers['Authorization'] = `Bearer ${localToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include' // Important for cookies/sessions
      });

      console.log('API Response:', response); // Debug logging

      if (response.status === 401) {
        logout();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
          errorData.error ||
          `Request failed with status ${response.status}`
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (err) {
      console.error('API Error:', err); // Detailed error logging
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced API methods with better error handling
  const getApi = async (service, endpoint, requiresAuth = true) => {
    const url = `${SERVICE_URLS[service]}${endpoint}`;
    console.log('GET Request to:', url); // Debug logging
    return safeFetch(url, { method: 'GET' }, requiresAuth);
  };

  const postApi = async (service, endpoint, body, requiresAuth = true) => {
    const url = `${SERVICE_URLS[service]}${endpoint}`;
    console.log('POST Request to:', url, body); // Debug logging

    return safeFetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    }, requiresAuth);
  };

  // <-- FIXED putApi: added 'Content-Type' header -->
  const putApi = async (service, endpoint, body, requiresAuth = true) => {
    const url = `${SERVICE_URLS[service]}${endpoint}`;
    return safeFetch(url, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    }, requiresAuth);
  };

  // Enhanced API methods
  const api = {
    login: async (credentials) => {
      const response = await postApi('user', '/login', credentials, false);
      if (response?.token) {
        handleLogin(response.token, credentials.username);
        return response;
      }
      throw new Error('Login failed: No token received');
    },

    logout,

    register: async (userData) => {
      return postApi('user', '/signup', userData, false);
    },

    getUserByPhone: (phoneNumber) => getApi('user', `/get/${phoneNumber}`),

    getWalletBalance: () => getApi('wallet', '/view/balance'),

    getBankBalance: () => getApi('bank', '/get/balance'),

    addMoneyToBank: (amount) => putApi('bank', '/add/money', { amount }),

    initiateTransaction: async (data) => {
      try {
        // Ensure data is properly formatted
        const transactionData = {
          receiver: data.receiver,
          amount: parseFloat(data.amount),
          transactionMethod: data.transactionMethod
        };

        console.log('Initiating transaction:', transactionData);
        const response = await postApi('transaction', '/initiate', transactionData);

        // Verify the response structure matches your backend
        if (!response || response.error) {
          throw new Error(response?.error || 'Transaction failed');
        }

        return response;
      } catch (error) {
        console.error('Transaction error:', error);
        throw error;
      }
    }
  };

  return (
    <ApiContext.Provider
      value={{
        ...api,
        token,
        isAuthenticated: !!token,
        loading,
        error,
        authLoading,
        clearError: () => setError(null),
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
