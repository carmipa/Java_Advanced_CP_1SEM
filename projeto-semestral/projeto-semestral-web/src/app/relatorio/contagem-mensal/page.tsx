// app/relatorio/contagem-mensal/page.tsx
"use client";

import { useState, useEffect } from 'react';
import NavBar from '@/components/nav-bar'; // Ajuste o caminho

// --- Imports do Chart.js ---
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title as ChartTitle, Tooltip, Legend
} from 'chart.js';
// --- Ícones (Restaurados) ---
import {
    MdBarChart, MdTableChart, MdInsertChart, MdList, MdCalendarToday
} from 'react-icons/md';

// --- Registrar componentes Chart.js ---
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

// --- Interfaces ---
interface ContagemMensalDto { mesAno: string; quantidade: number; }
type ViewMode = 'both' | 'table' | 'graph';
// ----------------

export default function RelatorioContagemMensalPage() {
    const [dadosContagem, setDadosContagem] = useState<ContagemMensalDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('both');

    useEffect(() => {
        const fetchContagem = async () => {
            setIsLoading(true); setError(null);
            try {
                const resp = await fetch("http://localhost:8080/rest/relatorios/contagem-agendamentos-mensal");
                if (!resp.ok) { /* ... tratamento de erro ... */
                    if (resp.status === 404) throw new Error("Endpoint não encontrado (404).");
                    if (resp.status >= 500) throw new Error(`Erro no servidor (${resp.status}).`);
                    throw new Error(`Erro HTTP ${resp.status}.`);
                }
                if (resp.status === 204) { setDadosContagem([]); return; }
                const data: ContagemMensalDto[] = await resp.json();
                data.sort((a, b) => a.mesAno.localeCompare(b.mesAno)); // Ordena os dados por data
                setDadosContagem(data);
            } catch (err: any) {
                setError( err instanceof TypeError ? "Falha ao conectar ao servidor." : err.message );
                setDadosContagem([]);
            } finally { setIsLoading(false); }
        };
        fetchContagem();
    }, []);

    // --- Cores para barras (Restaurado) ---
    const backgroundColors = [
        'rgba(54, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)',
        'rgba(255, 206, 86, 0.7)', 'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)', 'rgba(255, 99, 132, 0.7)',
        'rgba(100, 116, 139, 0.7)' // Cor neutra se precisar de mais
    ];
    const borderColors = backgroundColors.map(color => color.replace(/0\.7/, '1'));

    // Dados do gráfico (Restaurado)
    const labels = dadosContagem.map(d => d.mesAno);
    const valores = dadosContagem.map(d => d.quantidade);
    const chartData = { labels, datasets: [ { label: 'Agendamentos', data: valores, backgroundColor: backgroundColors.slice(0, valores.length), borderColor: borderColors.slice(0, valores.length), borderWidth: 1 } ] };

    // Opções do Gráfico (Restaurado + Correção de Alinhamento)
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // <<< Mantido para melhor ajuste de altura/largura
        plugins: {
            legend: { labels: { color: '#94a3b8' }, position: 'top' as const }, // Cor clara para legenda
            title: { display: true, text: 'Agendamentos por Mês/Ano', color: '#e2e8f0', font: { size: 16 } } // Cor clara para título
        },
        scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } }, // Cor clara para eixo X
            y: { beginAtZero: true, ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: 'rgba(100, 116, 139, 0.2)' } } // Cor clara para eixo Y e grid mais suave
        }
    };
    // ---------------------------------

    // Layout helpers (Restaurado)
    const getLayoutClasses = () => viewMode === 'both' ? 'flex flex-col lg:flex-row gap-6' : 'flex flex-col gap-6';
    const getSectionClasses = (sec: 'table' | 'graph') => {
        if (viewMode === 'table') return sec === 'table' ? 'w-full bg-slate-800 p-4 rounded-lg shadow-md' : 'hidden'; // Adicionado shadow/rounded
        if (viewMode === 'graph') return sec === 'graph' ? 'w-full bg-white p-4 rounded-lg shadow-md' : 'hidden'; // Adicionado shadow/rounded
        // both
        return sec === 'table' ? 'lg:w-1/3 xl:w-1/4 bg-slate-800 p-4 rounded-lg shadow-md flex-shrink-0' : 'lg:w-2/3 xl:w-3/4 bg-white p-4 rounded-lg shadow-md'; // Adicionado shadow/rounded
    };

    return (
        <>
            <NavBar active="relatorio-contagem-mensal" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Título com Ícone (Restaurado) */}
                <h1 className="flex items-center justify-center text-3xl font-bold mb-6">
                    <MdInsertChart className="mr-2 text-4xl" />
                    Relatório: Contagem Mensal
                </h1>

                {/* Botões de modo com Ícones (Restaurado) */}
                <div className="mb-6 flex justify-center gap-3">
                    <button onClick={() => setViewMode('both')} className={`flex items-center px-4 py-1.5 text-sm rounded-md transition ${ viewMode === 'both' ? 'bg-sky-600 text-white shadow' : 'bg-slate-600 text-slate-200 hover:bg-slate-500' }`}><MdList className="mr-1" /> Ambos</button>
                    <button onClick={() => setViewMode('table')} className={`flex items-center px-4 py-1.5 text-sm rounded-md transition ${ viewMode === 'table' ? 'bg-sky-600 text-white shadow' : 'bg-slate-600 text-slate-200 hover:bg-slate-500' }`}><MdTableChart className="mr-1" /> Tabela</button>
                    <button onClick={() => setViewMode('graph')} className={`flex items-center px-4 py-1.5 text-sm rounded-md transition ${ viewMode === 'graph' ? 'bg-sky-600 text-white shadow' : 'bg-slate-600 text-slate-200 hover:bg-slate-500' }`}><MdBarChart className="mr-1" /> Gráfico</button>
                </div>

                {/* Erro (Restaurado) */}
                {error && (<p className="text-center text-red-400 mb-4 p-3 bg-red-900/50 rounded border border-red-500">{error}</p>)}

                {/* Loading (Restaurado) */}
                {isLoading ? (<p className="text-center text-sky-300 py-10">Carregando relatório...</p>) : (
                    // Container principal dos resultados (Restaurado)
                    <div className="bg-slate-900 rounded-lg shadow p-4 md:p-6">
                        {dadosContagem.length === 0 && !error ? (<p className="text-center text-slate-400">Nenhum dado encontrado.</p>) : !error ? (
                            <div className={getLayoutClasses()}>
                                {/* Seção Tabela com Ícones (Restaurado) */}
                                <div className={getSectionClasses('table')}>
                                    <h2 className="flex items-center text-lg mb-3 font-semibold text-white"><MdList className="mr-2" /> Dados Mensais</h2>
                                    {/* Usei ul/li para a tabela textual */}
                                    <ul className="list-none pl-0 space-y-1 text-sm max-h-96 overflow-y-auto text-slate-300">
                                        {dadosContagem.map(item => (
                                            <li key={item.mesAno} className="flex items-center border-b border-slate-700 py-1"> {/* Adicionado borda e padding */}
                                                <MdCalendarToday className="inline-block mr-2 text-base text-slate-400 flex-shrink-0" /> {/* Ícone para data */}
                                                <span className="flex-grow">{item.mesAno}:</span>
                                                <span className="font-semibold text-slate-100 ml-2">{item.quantidade}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Seção Gráfico com Correção de Alinhamento */}
                                <div className={getSectionClasses('graph')}>
                                    {/* Container interno para centralizar o canvas */}
                                    {/* Ajuste max-w-full ou outra largura se necessário */}
                                    <div className="relative h-64 md:h-96 mx-auto" style={{ width: '95%' }}> {/* Adicionado mx-auto e largura relativa */}
                                        <Bar data={chartData} options={chartOptions} />
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </main>
        </>
    );
}