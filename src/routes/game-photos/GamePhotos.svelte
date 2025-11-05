<script lang="ts">
    import { user } from "../../lib/stores/userStore";
    import { onMount } from "svelte";

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const TAG = import.meta.env.VITE_CLOUDINARY_FOLDER || "nba2k";

    let files: FileList | null = null;
    let loading = false;
    let error = "";
    let uploadedCount = 0;
    let images: string[] = [];

    let modalOpen = false;
    let currentIndex = 0;

    async function handleUpload() {
        if (!files || files.length === 0) {
            error = "Vali vähemalt üks fail.";
            return;
        }

        loading = true;
        error = "";

        try {
            const uploads = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", UPLOAD_PRESET);
                formData.append("tags", TAG);

                const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) throw new Error("Üleslaadimine ebaõnnestus");
                await res.json();
            });

            await Promise.all(uploads);
            uploadedCount++;
            await loadImages();
            files = null;
        } catch (err: any) {
            error = err.message || "Midagi läks valesti.";
        } finally {
            loading = false;
        }
    }

    async function loadImages() {
        loading = true;
        try {
            const res = await fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG}.json`);
            if (!res.ok) {
                return Promise.reject(new Error(`Cloudinary error: ${res.status}`));
            }
            const data = await res.json();
            images = data.resources
                .map((r) => `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${r.public_id}.${r.format}`)
                .reverse();
        } catch (err: any) {
            error = err.message || "Pilte ei saanud laadida.";
        } finally {
            loading = false;
        }
    }

    onMount(loadImages);

    function openModal(index: number) {
        currentIndex = index;
        modalOpen = true;
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
    }

    function closeModal() {
        modalOpen = false;
    }
</script>

<main class="p-8 bg-[#000536] text-white min-h-screen">
    <h1 class="text-3xl font-bold text-[#03a9f4] mb-6 flex items-center gap-2">
        Mängupiltide üleslaadimine
    </h1>

    {#if !$user}
        <p class="text-gray-400 mb-6">
            Pead olema sisse logitud, et pilte üles laadida.
        </p>
    {:else}
        <div
                class="bg-[#001048] p-4 rounded-xl mb-8 shadow-md border border-[#03538b]/40 flex flex-col md:flex-row items-center gap-4"
        >
            <input id="fileInput" type="file" multiple accept="image/*" bind:files={files} class="hidden" />

            <label
                    for="fileInput"
                    class="cursor-pointer bg-[#03538b] hover:bg-[#046ab8] px-4 py-2 rounded-lg font-semibold"
            >
                Vali pildid
            </label>

            <button
                    on:click={handleUpload}
                    disabled={loading || !files}
                    class="bg-[#03538b] hover:bg-[#046ab8] px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
            >
                {loading ? "⏳ Laen üles..." : "Lae üles"}
            </button>
        </div>
    {/if}

    <h2 class="text-2xl font-semibold text-[#03a9f4] mb-4 flex items-center gap-2">
        Mängude galerii
    </h2>

    {#if loading && images.length === 0}
        <p class="text-gray-400">⏳ Laen pilte...</p>
    {:else if error}
        <p class="text-red-400">{error}</p>
    {:else if images.length === 0}
        <p class="text-gray-400">Pilte veel pole — lae mõned üles!</p>
    {:else}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {#each images as img, i}
                <div class="relative group cursor-pointer" on:click={() => openModal(i)}>
                    <img
                            src={img}
                            alt="Game image"
                            class="w-full h-44 object-cover rounded-xl border border-[#03538b]/40 shadow-md group-hover:scale-[1.03] transition-transform"
                            loading="lazy"
                    />
                </div>
            {/each}
        </div>
    {/if}

    {#if modalOpen}
        <div
                class="fixed inset-0 bg-black/90 flex flex-col justify-center items-center z-50 backdrop-blur-sm"
                on:click|self={closeModal}
        >
            <div class="bg-[#001048] p-6 rounded-xl w-[90vw] max-w-4xl shadow-xl border border-[#03538b]/50">
                <h2 class="text-2xl text-[#03a9f4] font-bold mb-4 text-center">🖼️ Mängupilt</h2>

                <div class="flex flex-col items-center">
                    <img
                            src={images[currentIndex]}
                            alt="Selected"
                            class="max-h-[70vh] max-w-full rounded-lg shadow-2xl mb-4"
                    />

                    <div class="flex justify-between w-full text-white text-2xl font-bold mb-4">
                        <button on:click={prevImage} class="hover:text-[#03a9f4] px-4">←</button>
                        <button on:click={nextImage} class="hover:text-[#03a9f4] px-4">→</button>
                    </div>

                    {#if $user}
                        <div
                                class="bg-[#000a3d] p-4 rounded-xl w-full border border-[#03538b]/40 flex flex-col md:flex-row items-center gap-4"
                        >
                            <input id="modalFileInput" type="file" multiple accept="image/*" bind:files={files} class="hidden" />

                            <label
                                    for="modalFileInput"
                                    class="cursor-pointer bg-[#03538b] hover:bg-[#046ab8] px-4 py-2 rounded-lg font-semibold"
                            >
                                Vali pildid
                            </label>

                            <button
                                    on:click={handleUpload}
                                    disabled={loading || !files}
                                    class="bg-[#03538b] hover:bg-[#046ab8] px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                            >
                                {loading ? "⏳ Laen üles..." : "Lae üles"}
                            </button>
                        </div>
                    {/if}
                </div>
            </div>

            <button
                    on:click={closeModal}
                    class="absolute top-6 right-8 text-white text-3xl hover:text-[#03a9f4]"
            >
                ✕
            </button>
        </div>
    {/if}
</main>
