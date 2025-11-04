<script lang="ts">
    import { loginWithEmail } from "../lib/services/authService";
    import { user } from "../lib/stores/userStore";
    import { logoutUser } from "../lib/services/authService";

    let email = "";
    let password = "";
    let message = "";

    async function handleLogin() {
        message = "";
        try {
            await loginWithEmail(email, password);
            window.location.hash = "/";
        } catch (err: any) {
            message = `${err.message}`;
        }
    }
</script>

{#if $user}
    <div class="logged-in">
        <p>Tere, {$user.email}!</p>
        <button on:click={logoutUser}>Logi välja</button>
    </div>
{:else}
    <div class="login-card">
        <h2 class="title">Logi sisse</h2>

        <input
                type="email"
                placeholder="E-post"
                bind:value={email}
                class="input"
                required
        />

        <input
                type="password"
                placeholder="Parool"
                bind:value={password}
                class="input"
                required
        />

        <button class="auth-btn" on:click={handleLogin}>Logi sisse</button>

        {#if message}
            <p class="status">{message}</p>
        {/if}
    </div>
{/if}

<style>
    .login-card {
        background: #001048;
        padding: 2rem;
        border-radius: 1rem;
        max-width: 400px;
        margin: 5rem auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .title {
        color: #ffffff;
        margin-bottom: 1.5rem;
        font-weight: 600;
        font-size: 1.3rem;
    }
    .input {
        width: 100%;
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
        border-radius: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 0.95rem;
        transition: all 0.2s;
    }
    .input::placeholder {
        color: rgba(255, 255, 255, 0.6);
    }
    .input:focus {
        outline: none;
        border-color: #03538b;
        background: rgba(3, 83, 139, 0.2);
        box-shadow: 0 0 0 2px rgba(3, 83, 139, 0.3);
    }

    /* eemaldame autofill sinise tausta */
    input:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 1000px #001048 inset !important;
        -webkit-text-fill-color: #fff !important;
    }

    .auth-btn {
        background: #03538b;
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        padding: 0.75rem 1rem;
        cursor: pointer;
        font-weight: 600;
        width: 100%;
        transition: all 0.2s;
    }
    .auth-btn:hover {
        background: #046ab8;
        transform: translateY(-1px);
    }
    .status {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: #fff;
    }
    .logged-in {
        text-align: center;
        margin-top: 2rem;
        color: #fff;
    }
    .logged-in button {
        background: #03538b;
        color: white;
        border: none;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
        cursor: pointer;
        margin-top: 0.75rem;
    }
    .logged-in button:hover {
        background: #046ab8;
    }
</style>
