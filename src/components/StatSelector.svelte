<script lang="ts">
    export let selectedStat = "PTS";
    export let statOptions: string[] = ["PTS", "REB", "AST", "STL", "BLK", "TO", "MIN"];
    export let onChange: (stat: string) => void = () => {};
</script>

<label class="text-sm opacity-80 mr-2">Statistika:</label>
{#each statOptions as stat}
    <button
            class="stat-btn {stat === selectedStat ? 'active' : ''}"
            on:click={() => onChange?.(stat)}
    >
        {stat}
    </button>
{/each}

<style>
    button.stat-btn {
        padding: 0.3rem 0.8rem;
        border: 1px solid #03538b;
        border-radius: 8px;
        margin-right: 0.4rem;
        cursor: pointer;
    }
    button.stat-btn.active {
        background-color: #03538b;
    }
</style>
