import { writable } from "svelte/store";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase";

export const user = writable<User | null>(null);
export const loadingUser = writable(true);

onAuthStateChanged(auth, (firebaseUser) => {
    user.set(firebaseUser);
    loadingUser.set(false);
});