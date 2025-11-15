import { writable } from "svelte/store";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export const gameStore = writable({
    loading: true,
    games: [],
    loaded: false
});

let unsubscribe = null;

export async function loadGamesOnce() {
    gameStore.update(s => ({ ...s, loading: true }));

    if (unsubscribe) {
        unsubscribe();
    }

    unsubscribe = onSnapshot(collection(db, "games"), snap => {
        const all = [];
        snap.forEach(docu => {
            all.push({
                id: docu.id,
                ref: docu.ref,
                ...docu.data()
            });
        });

        gameStore.set({
            loading: false,
            games: all,
            loaded: true
        });
    });
}
