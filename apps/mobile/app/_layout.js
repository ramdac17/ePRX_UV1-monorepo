import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
const MyCyberTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: "#050505",
        card: "#050505",
        text: "#FFFFFF",
        primary: "#00F0FF", // Neon Cyan
        border: "rgba(0, 240, 255, 0.3)",
    },
};
export default function RootLayout() {
    const segments = useSegments();
    const router = useRouter();
    const [isAuthLoaded, setIsAuthLoaded] = useState(false);
    const [hasToken, setHasToken] = useState(false);
    // 1. Initial Auth Check & Observer
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                setHasToken(!!token);
            }
            catch (e) {
                setHasToken(false);
            }
            finally {
                setIsAuthLoaded(true);
            }
        };
        checkAuth();
    }, [segments]); // Re-run check whenever the user moves between screens
    // 2. Navigation Guard logic
    useEffect(() => {
        // Wait until we actually know if the user has a token
        if (!isAuthLoaded)
            return;
        const inAuthGroup = segments[0] === "(auth)";
        if (!hasToken && !inAuthGroup) {
            // Not logged in -> Kick to login
            router.replace("/login");
        }
        else if (hasToken && inAuthGroup) {
            // Logged in -> Move to dashboard
            router.replace("/(tabs)");
        }
    }, [hasToken, isAuthLoaded, segments]);
    // 3. Prevent flickering while checking auth
    if (!isAuthLoaded)
        return null;
    return (<ThemeProvider value={MyCyberTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }}/>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
      </Stack>
    </ThemeProvider>);
}
