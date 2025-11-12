<script lang="ts">
    import { onMount, afterUpdate   } from 'svelte';
    import Chart from 'chart.js/auto';
    import type { PointElement } from 'chart.js';
    import annotationPlugin from 'chartjs-plugin-annotation';
    import { getAvailableSeasons, getSeasonStats, type PlayerStats } from '../../lib/services/statsService';
    import { getPlayerImage } from "../../lib/utils/helpers";
    import { getImageUrl } from "../../lib/utils/images";

    Chart.register(annotationPlugin);

    let seasons: string[] = [];
    let selectedSeason = '';
    let selectedTeam = '';
    let teams: string[] = [];
    let players: PlayerStats[] = [];
    let isLoading = false;
    let showBothTeams = false;
    let chartReady = false;
    let canvas: HTMLCanvasElement;
    let chart: Chart;

    onMount(async () => {
        isLoading = true;
        seasons = await getAvailableSeasons();
        if (seasons.length > 0) {
            selectedSeason = seasons[seasons.length - 1];
            await loadSeasonStats();
        }
        isLoading = false;
    });

    async function loadSeasonStats() {
        isLoading = true;
        const { teams: teamStats } = await getSeasonStats(selectedSeason);
        teams = Object.keys(teamStats);
        console.log('Raw teamStats:', teamStats);
        if (!selectedTeam && teams.length > 0) {
            selectedTeam = teams[0];
        }

        if (showBothTeams) {
            players = teams.flatMap(team =>
                teamStats[team].map(p => ({ ...p, TEAM: team }))
            );
        } else {
            players = selectedTeam ? teamStats[selectedTeam].map(p => ({ ...p, TEAM: selectedTeam })) : [];
        }


        isLoading = false;
        chartReady = true;
    }

    async function getImage(player) {
        const imagePath = getImageUrl(player.NAME);
        const defaultImage = getImageUrl("default_player");
        return imagePath || defaultImage;
    }

    async function loadImagesWithUrls(players) {
        const promises = players.map(async (p) => {
            const imgUrl = await getImage(p);
            return new Promise((resolve) => {
                const img = new Image(40, 40);
                img.src = imgUrl;
                img.onload = () => resolve({ ...p, img });
                img.onerror = () => {
                    const fallback = new Image(40, 40);
                    fallback.src = '/assets/player_images/default_player.jpg';
                    resolve({ ...p, img: fallback });
                };
            });
        });
        return await Promise.all(promises);
    }

    function calcTS(fgMade: number, fgAtt: number, ftAtt: number, pts: number) {
        const denom = 2 * (Number(fgAtt) + 0.44 * Number(ftAtt));
        if (denom === 0) {
            return 0;
        }
        return Number(pts) / denom;
    }

    afterUpdate(() => {
        if (chartReady && canvas) {
            drawChart();
            chartReady = false;
        }
    });

    async function drawChart() {
        if (!canvas) {
            return;
        }
        if (chart) {
            chart.destroy();
        }

        const MIN_FGA = 3;
        const MIN_MIN = 7;
        const MIN_GAMES = 2;

        const filteredPlayers = players.filter(p =>
            Number(p.FG_ATT) >= MIN_FGA &&
            Number(p.MIN) >= MIN_MIN &&
            Number(p.GAMES) >= MIN_GAMES
        );

        if (filteredPlayers.length === 0) {
            return;
        }

        const playerImages: Record<string, HTMLImageElement> = {};
        await Promise.all(
            filteredPlayers.map(async p => {
                const url = await getImage(p);
                const img = new Image(50, 50);
                img.src = url;
                playerImages[p.NAME] = img;
            })
        );

        const dataPoints = filteredPlayers.map(p => ({
            x: Number(p.PTS),
            y: calcTS(p.FG_MADE, p.FG_ATT, p.FT_ATT, p.PTS),
            label: p.NAME,
            team: p.TEAM
        }));

        const avgX = dataPoints.reduce((s, d) => s + d.x, 0) / dataPoints.length;
        const avgY = dataPoints.reduce((s, d) => s + d.y, 0) / dataPoints.length;

        chart = new Chart(canvas, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Players',
                    data: dataPoints,
                    pointRadius: 0,
                    borderWidth: 0,
                    clip: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    intersect: true
                },
                elements: {
                    point: {
                        radius: 0,
                        hitRadius: 15,
                        hoverRadius: 0
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        bodyFont: { size: 13 },
                        titleFont: { size: 14, weight: 'bold' },
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            title: (ctx) => (ctx[0]?.raw as any)?.label ?? '',
                            label: (ctx) => {
                                const raw = ctx.raw as any;
                                const player = filteredPlayers.find(p => p.NAME === raw.label);
                                if (!player) {
                                    return '';
                                }
                                return [
                                    `Team: ${player.TEAM}`,
                                    `PTS: ${player.PTS}`,
                                    `REB: ${player.REB}`,
                                    `AST: ${player.AST}`,
                                    `STL: ${player.STL}`,
                                    `BLK: ${player.BLK}`,
                                    `TS%: ${(raw.y * 100).toFixed(1)}%`
                                ];
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            avgX: {
                                type: 'line',
                                xMin: avgX, xMax: avgX,
                                borderColor: 'rgba(255,255,255,0.4)',
                                borderWidth: 1,
                                label: { display: true, content: 'Avg PPG', color: '#fff' }
                            },
                            avgY: {
                                type: 'line',
                                yMin: avgY, yMax: avgY,
                                borderColor: 'rgba(255,255,255,0.4)',
                                borderWidth: 1,
                                label: { display: true, content: 'Avg TS%', color: '#fff' }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        min: 0,
                        suggestedMax: 30,
                        title: { display: true, text: 'Points per Game', color: '#fff' },
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        min: 0,
                        max: 1,
                        title: { display: true, text: 'True Shooting %', color: '#fff' },
                        ticks: {
                            color: '#fff',
                            callback: v => `${(Number(v) * 100).toFixed(0)}%`
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            },
            plugins: [{
                id: 'playerImages',
                afterDatasetsDraw: (chart) => {
                    const ctx = chart.ctx;
                    const dataset = chart.data.datasets[0];
                    const meta = chart.getDatasetMeta(0);

                    dataset.data.forEach((d: any, i: number) => {
                        const element: any = meta.data[i];
                        if (!element) {
                            return;
                        }
                        const { x, y } = element.getProps(['x', 'y'], true);

                        const img = playerImages[d.label];
                        if (!img?.complete) {
                            return;
                        }

                        const size = 36;
                        const xPos = x - size / 2;
                        const yPos = y - size / 2;

                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                        ctx.clip();
                        ctx.drawImage(img, xPos, yPos, size, size);
                        ctx.restore();

                        // sinine äär
                        ctx.beginPath();
                        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = '#03538b';
                        ctx.stroke();
                    });
                }
            }]
        });

    }

    function handleSeasonChange(e: Event) {
        selectedSeason = (e.target as HTMLSelectElement).value;
        loadSeasonStats();
    }

    function handleTeamChange(e: Event) {
        selectedTeam = (e.target as HTMLSelectElement).value;
        loadSeasonStats();
    }

    function handleBothTeamsToggle(e: Event) {
        showBothTeams = (e.target as HTMLInputElement).checked;
        loadSeasonStats();
    }
</script>

<div class="p-6 text-white space-y-4">
    <h1 class="text-3xl font-bold">Scoring & Efficiency</h1>

    <div class="flex flex-wrap gap-4 items-center">
        <select class="bg-[#03538b] px-3 py-2 rounded-lg" bind:value={selectedSeason} on:change={handleSeasonChange}>
            {#each seasons as season}
                <option value={season}>{season}</option>
            {/each}
        </select>

        <select class="bg-[#03538b] px-3 py-2 rounded-lg" bind:value={selectedTeam} on:change={handleTeamChange} disabled={showBothTeams}>
            {#each teams as team}
                <option value={team}>{team}</option>
            {/each}
        </select>

        <label class="flex items-center space-x-2">
            <input type="checkbox" bind:checked={showBothTeams} on:change={handleBothTeamsToggle}>
            <span>Näita mõlemat tiimi</span>
        </label>
    </div>

    {#if isLoading}
        <p>Laen andmeid...</p>
    {:else}
        <div class="bg-[#000536] p-4 rounded-2xl shadow-xl">
            <canvas bind:this={canvas}></canvas>
        </div>
    {/if}
</div>

<style>
    select {
        color: white;
    }
    canvas {
        width: 100%;
        height: 600px;
    }
</style>
