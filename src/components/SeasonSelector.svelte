<script>
export let seasons = [];
export let selectedSeason;
export let onChange;

function handleChange(e) {
    onChange?.(e.target.value);
}
</script>
<h3 class="text-white text-lg font-medium mb-3">Vali hooaeg:</h3>
<select bind:value={selectedSeason} on:change={handleChange}>
    {#each seasons as s}
    <option value={s}>{s}</option>
{/each}
</select>

<style>
select {
    background: #001048;
    color: white;
    border: 1px solid #03538b;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
}
    </style>
