import React, { useState } from "react";
import { StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, // Added for system feedback
ActivityIndicator, } from "react-native";
import { Text, View } from "@/components/Themed";
import { CYBER_THEME } from "@/constants/Colors";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/utils/api"; // Import your axios instance
export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("REQUIRED", "CREDENTIAL_ID_OR_ACCESS_CODE_MISSING");
            return;
        }
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email: email.toLowerCase().trim(),
                password,
            });
            const token = response.data.access_token;
            if (token && typeof token === "string") {
                // 1. Persist the token
                await AsyncStorage.setItem("userToken", token);
                // 2. Set the global API header immediately
                api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                console.log("ePRX_UV1_SESSION_ESTABLISHED");
                // 3. Redirect - The RootLayout will now see 'hasToken' as true
                router.replace("/(tabs)");
            }
            else {
                throw new Error("INVALID_TOKEN_FORMAT");
            }
        }
        catch (error) {
            console.error("AUTH_SEQUENCE_INTERRUPTED", error);
            const msg = error.response?.data?.message || "UPLINK_ERROR";
            Alert.alert("ACCESS_DENIED", msg.toUpperCase());
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.background}>
        <View style={styles.glowTop}/>
        <View style={styles.glowBottom}/>

        <View style={styles.header}>
          <Text style={styles.logoText}>
            ePRX <Text style={{ color: CYBER_THEME.primary }}>UV1</Text>
          </Text>
          <Text style={styles.subtitle}>
            {isLoading ? "VERIFYING_CREDENTIALS..." : "AUTHENTICATION_REQUIRED"}
          </Text>
        </View>

        <View style={styles.glassCard}>
          <Text style={styles.label}>CREDENTIAL_ID</Text>
          <TextInput style={[styles.input, isLoading && { opacity: 0.5 }]} placeholder="USER@SYSTEM.IO" placeholderTextColor="#444" value={email} onChangeText={setEmail} autoCapitalize="none" editable={!isLoading} keyboardType="email-address"/>

          <Text style={styles.label}>ACCESS_CODE</Text>
          <TextInput style={[styles.input, isLoading && { opacity: 0.5 }]} placeholder="••••••••" placeholderTextColor="#444" secureTextEntry value={password} onChangeText={setPassword} editable={!isLoading}/>

          <Pressable onPress={handleLogin} disabled={isLoading} style={({ pressed }) => [
            styles.button,
            (pressed || isLoading) && { opacity: 0.7 },
        ]}>
            {isLoading ? (<ActivityIndicator color="#000"/>) : (<Text style={styles.buttonText}>INITIALIZE_LOGIN</Text>)}
          </Pressable>

          <Pressable style={styles.secondaryLink} onPress={() => router.push("/(auth)/register")} disabled={isLoading}>
            <Text style={styles.secondaryText}>NEW_USER? [REGISTER_ENTRY]</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>);
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    background: {
        flex: 1,
        padding: 25,
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    glowTop: {
        position: "absolute",
        top: -100,
        left: -50,
        width: 300,
        height: 300,
        backgroundColor: CYBER_THEME.primary,
        borderRadius: 150,
        opacity: 0.1,
    },
    glowBottom: {
        position: "absolute",
        bottom: -120,
        right: -80,
        width: 300,
        height: 300,
        backgroundColor: "#FF00FF", // Magenta glow
        borderRadius: 150,
        opacity: 0.1,
    },
    header: { backgroundColor: "transparent", marginBottom: 40 },
    logoText: {
        fontSize: 42,
        fontWeight: "900",
        color: "#fff",
        letterSpacing: -1,
    },
    subtitle: {
        color: CYBER_THEME.primary,
        fontSize: 12,
        letterSpacing: 2,
        marginTop: 5,
    },
    glassCard: {
        backgroundColor: "#0a0a0a",
        padding: 25,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "#1a1a1a",
    },
    label: {
        color: "#666",
        fontSize: 10,
        marginBottom: 8,
        letterSpacing: 1,
        fontWeight: "bold",
    },
    input: {
        backgroundColor: "#000",
        color: CYBER_THEME.primary,
        padding: 15,
        borderRadius: 5,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#222",
        fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    },
    button: {
        backgroundColor: CYBER_THEME.primary,
        padding: 18,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: { color: "#000", fontWeight: "900", letterSpacing: 1 },
    secondaryLink: {
        marginTop: 20,
        alignItems: "center",
        backgroundColor: "transparent",
    },
    secondaryText: { color: "#444", fontSize: 11 },
});
