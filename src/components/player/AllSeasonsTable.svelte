<script>
    export let seasonAverages = {};
    export let seasonGameCounts = {};
</script>

<h2 class="text-xl font-semibold text-[#03a9f4] mt-10 mb-3">
    📊 Kõigi hooaegade keskmised
</h2>

<table class="w-full text-sm border border-[#02315e] rounded-xl overflow-hidden mb-16">
    <thead class="bg-[#03538b]">
    <tr>
        <th class="py-2 px-3 text-left">Hooaeg</th>
        <th class="py-2 px-3">GP</th>
        <th class="py-2 px-3">MIN</th>
        <th class="py-2 px-3">PTS</th>
        <th class="py-2 px-3">REB</th>
        <th class="py-2 px-3">AST</th>
        <th class="py-2 px-3">STL</th>
        <th class="py-2 px-3">BLK</th>
        <th class="py-2 px-3">TO</th>
        <th class="py-2 px-3">FLS</th>
        <th class="py-2 px-3">FG%</th>
        <th class="py-2 px-3">3PT%</th>
        <th class="py-2 px-3">FT%</th>
    </tr>
    </thead>

    <tbody>
    {#each Object.entries(seasonAverages).sort((a, b) => b[0].localeCompare(a[0])) as [season, st]}
        <tr class="odd:bg-[#001048] even:bg-[#00093a] hover:bg-[#022c56]">
            <td class="py-2 px-3">{season}</td>
            <td class="text-center">{seasonGameCounts[season] || 0}</td>
            <td class="text-center">{st.MIN.toFixed(1)}</td>
            <td class="text-center">{st.PTS.toFixed(1)}</td>
            <td class="text-center">{st.REB.toFixed(1)}</td>
            <td class="text-center">{st.AST.toFixed(1)}</td>
            <td class="text-center">{st.STL.toFixed(1)}</td>
            <td class="text-center">{st.BLK.toFixed(1)}</td>
            <td class="text-center">{st.TO.toFixed(1)}</td>
            <td class="text-center">{st.FLS.toFixed(1)}</td>
            <td class="text-center">{st["FG%"]}</td>
            <td class="text-center">{st["3PT%"]}</td>
            <td class="text-center">{st["FT%"]}</td>
        </tr>
    {/each}
    </tbody>
</table>
