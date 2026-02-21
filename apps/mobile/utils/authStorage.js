// apps/mobile/utils/authStorage.ts
import * as SecureStore from 'expo-secure-store';
const TOKEN_KEY = 'eprx_auth_token';
// MAKE SURE THIS HAS 'export'
export const getToken = async () => {
    return await SecureStore.getItemAsync(TOKEN_KEY);
};
// Ensure these have export too
export const storeToken = async (token) => {
    if (typeof token !== 'string') {
        console.error("CRITICAL: Attempted to store a non-string token.");
        return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
};
export const removeToken = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
};
