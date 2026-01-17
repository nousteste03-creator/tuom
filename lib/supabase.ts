// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

/* ---------------------------------------------------
   Adapter universal para storage
   - Nativo: SecureStore
   - Web / Node: AsyncStorage
--------------------------------------------------- */
const storage =
  Platform.OS === 'web'
    ? {
        getItem: async (key: string) => {
          try {
            return await AsyncStorage.getItem(key);
          } catch (e) {
            console.warn('AsyncStorage getItem failed:', e);
            return null;
          }
        },
        setItem: async (key: string, value: string) => {
          try {
            await AsyncStorage.setItem(key, value);
          } catch (e) {
            console.warn('AsyncStorage setItem failed:', e);
          }
        },
        removeItem: async (key: string) => {
          try {
            await AsyncStorage.removeItem(key);
          } catch (e) {
            console.warn('AsyncStorage removeItem failed:', e);
          }
        },
      }
    : {
        getItem: (key: string) => SecureStore.getItemAsync(key),
        setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
        removeItem: (key: string) => SecureStore.deleteItemAsync(key),
      };

/* ---------------------------------------------------
   Criação do cliente Supabase
--------------------------------------------------- */
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
