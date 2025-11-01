// src/lib/services/authService.ts
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";

export async function loginWithEmail(email: string, password: string) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        console.error("Login error:", error.message);
        throw error;
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout error:", error);
    }
}
