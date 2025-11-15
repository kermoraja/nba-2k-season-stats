<script>
    export let games = [];
    export let user;
    export let onEditGame;
</script>

<table class="w-full text-sm border border-[#02315e] rounded-xl overflow-hidden">
    <thead class="bg-[#03538b]">
    <tr>
        <th class="py-2 px-3 text-left">Kuupäev</th>
        <th class="py-2 px-3 text-left">Mäng</th>
        <th class="py-2 px-3 text-left">Skoor</th>
        <th>MIN</th><th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th>
        <th>TO</th><th>FLS</th><th>FG</th><th>3PT</th><th>FT</th>
        {#if user}<th>Muuda</th>{/if}
    </tr>
    </thead>

    <tbody>
    {#each games as g}
        <tr class="odd:bg-[#001048] even:bg-[#00093a] hover:bg-[#022c56]">
            <td class="py-2 px-3">{g.GAME_DATE}</td>
            <td class="px-3">{g.VS_LABEL}</td>
            <td class="px-3">{g.SCORE_DETAIL}
                <span class="ml-2 font-bold text-[#03a9f4]">{g.RESULT}</span>
            </td>
            <td class="text-center">{g.MIN}</td>
            <td class="text-center">{g.PTS}</td>
            <td class="text-center">{g.REB}</td>
            <td class="text-center">{g.AST}</td>
            <td class="text-center">{g.STL}</td>
            <td class="text-center">{g.BLK}</td>
            <td class="text-center">{g.TO}</td>
            <td class="text-center">{g.FLS}</td>
            <td class="text-center">{g.FG || "-"}</td>
            <td class="text-center">{g["3PT"] || "-"}</td>
            <td class="text-center">{g.FT || "-"}</td>

            {#if user}
                <td class="text-center">
                    <button class="px-2 py-1 bg-[#03538b] rounded text-xs"
                            on:click={() => onEditGame(g)}>
                        ✏️
                    </button>
                </td>
            {/if}
        </tr>
    {/each}
    </tbody>
</table>
