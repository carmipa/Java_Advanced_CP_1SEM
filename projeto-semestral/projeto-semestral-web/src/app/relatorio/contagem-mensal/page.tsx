// app/relatorio/contagem-mensal/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react'; // <<< ADICIONAR useMemo AQUI
import NavBar from '@/components/nav-bar';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title as ChartTitle, Tooltip, Legend, Filler, PointElement, LineElement, BarController, LineController, ArcElement // Registro mais completo
} from 'chart.js';
import {
    MdBarChart, MdTableChart, MdInsertChart, MdList, MdCalendarToday, MdErrorOutline
} from 'react-icons/md';
import { Loader2 } from 'lucide-react'; // Para ícone de loading

// Registrar componentes Chart.js (mais completo para evitar erros)
ChartJS.register(
    CategoryScale, LinearScale, BarController, BarElement, LineController, LineElement, PointElement, ArcElement,
    ChartTitle, Tooltip, Legend, Filler
);

interface ContagemMensalDto { mesAno: string; quantidade: number; }
type ViewMode = 'both' | 'table' | 'graph';

// Cores para barras (consistente com outros relatórios)
const backgroundColors = [
    'rgba(54, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(255, 206, 86, 0.7)',
    'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)', 'rgba(255, 99, 132, 0.7)',
    'rgba(100, 116, 139, 0.7)', 'rgba(239, 68, 68, 0.7)', 'rgba(59, 130, 246, 0.7)',
    'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(139, 92, 246, 0.7)'
];
const borderColors = backgroundColors.map(color => color.replace(/0\.7/, '1'));

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
                if (!resp.ok) {
                    if (resp.status === 404) throw new Error("Endpoint não encontrado (404). Verifique a URL da API.");
                    if (resp.status >= 500) throw new Error(`Erro no servidor (${resp.status}). Tente novamente mais tarde.`);
                    throw new Error(`Erro HTTP ${resp.status}.`);
                }
                if (resp.status === 204) { setDadosContagem([]); return; }
                const data: ContagemMensalDto[] = await resp.json();
                data.sort((a, b) => b.mesAno.localeCompare(a.mesAno)); // Para a tabela (mais recentes primeiro)
                setDadosContagem(data);
            } catch (err: any) {
                setError( err instanceof TypeError && err.message === 'Failed to fetch' ? "Falha ao conectar ao servidor." : err.message );
                setDadosContagem([]);
            } finally { setIsLoading(false); }
        };
        fetchContagem();
    }, []);

    const chartData = useMemo(() => {
        const sortedDataForChart = [...dadosContagem].sort((a, b) => a.mesAno.localeCompare(b.mesAno)); // ASC para gráfico
        const labels = sortedDataForChart.map(d => d.mesAno);
        const valores = sortedDataForChart.map(d => d.quantidade);
        return {
            labels,
            datasets: [{
                label: 'Nº de Agendamentos',
                data: valores,
                backgroundColor: valores.map((_, i) => backgroundColors[i % backgroundColors.length]),
                borderColor: valores.map((_, i) => borderColors[i % borderColors.length]),
                borderWidth: 1,
                borderRadius: 4, // Adiciona um leve arredondamento às barras
                barPercentage: 0.7, // Ajusta a largura das barras
                categoryPercentage: 0.8, // Ajusta o espaçamento entre grupos de barras
            }]
        };
    }, [dadosContagem]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }, // Uma série, legenda não é crucial
            title: {
                display: true,
                text: 'Agendamentos por Mês/Ano',
                color: '#e2e8f0', // Cor do título para tema escuro
                font: { size: 16 as number, weight: 'bold' as 'bold' },
                padding: {bottom: 15}
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.7)',
                titleFont: { size: 13 as number },
                bodyFont: { size: 12 as number },
                padding: 8,
                cornerRadius: 3
            }
        },
        scales: {
            x: {
                ticks: { color: '#94a3b8' }, // Cor dos labels do eixo X
                grid: { display: false }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#94a3b8', stepSize: Math.max(1, Math.ceil(Math.max(...(chartData.datasets[0].data.map(v => Number(v))), 1) / 6)) },
                grid: { color: 'rgba(100, 116, 139, 0.2)' } // Cor das linhas de grade do eixo Y
            }
        }
    };

    const getLayoutClasses = () => viewMode === 'both' ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : 'flex flex-col gap-6';

    const getSectionClasses = (sec: 'table' | 'graph'): string => {
        // Ambas as seções usarão o mesmo fundo escuro agora
        const baseClasses = 'bg-slate-800 p-4 rounded-lg shadow-md';
        if (viewMode === 'table') return sec === 'table' ? `w-full ${baseClasses}` : 'hidden';
        if (viewMode === 'graph') return sec === 'graph' ? `w-full ${baseClasses}` : 'hidden';
        // both
        return sec === 'table'
            ? `lg:col-span-1 ${baseClasses} flex flex-col` // Tabela ocupa 1/3 no modo "ambos"
            : `lg:col-span-2 ${baseClasses}`;              // Gráfico ocupa 2/3 no modo "ambos"
    };

    return (
        <>
            <NavBar active="relatorio-contagem-mensal" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="flex items-center justify-center text-2xl md:text-3xl font-bold mb-6 text-center gap-2">
                    <MdInsertChart className="text-4xl text-sky-400" />
                    Relatório: Contagem Mensal de Agendamentos
                </h1>

                <div className="mb-6 flex flex-wrap justify-center gap-3">
                    <button onClick={() => setViewMode('both')} className={`flex items-center px-4 py-1.5 text-sm rounded-md transition-colors shadow-sm ${ viewMode === 'both' ? 'bg-sky-500 text-white font-semibold' : 'bg-slate-700 text-slate-200 hover:bg-slate-600' }`} aria-label="Mostrar Tabela e Gráfico"><MdList className="mr-1" /> Ambos</button>
                    <button onClick={() => setViewMode('table')} className={`flex items-center px-4 py-1.5 text-sm rounded-md transition-colors shadow-sm ${ viewMode === 'table' ? 'bg-sky-500 text-white font-semibold' : 'bg-slate-700 text-slate-200 hover:bg-slate-600' }`} aria-label="Mostrar Apenas Tabela"><MdTableChart className="mr-1" /> Tabela</button>
                    <button onClick={() => setViewMode('graph')} className={`flex items-center px-4 py-1.5 text-sm rounded-md transition-colors shadow-sm ${ viewMode === 'graph' ? 'bg-sky-500 text-white font-semibold' : 'bg-slate-700 text-slate-200 hover:bg-slate-600' }`} aria-label="Mostrar Apenas Gráfico"><MdBarChart className="mr-1" /> Gráfico</button>
                </div>

                {error && (
                    <div className="relative max-w-3xl mx-auto mb-6 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                        <MdErrorOutline className="inline mr-2" />
                        {error}
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar">
                            <span className="text-xl" aria-hidden="true">&times;</span>
                        </button>
                    </div>
                )}

                {isLoading ? (
                    <div className='flex justify-center items-center py-10'>
                        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                        <span className='ml-3 text-sky-300 text-lg'>Carregando relatório...</span>
                    </div>
                ) : (
                    <div className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-xl border border-slate-700">
                        {dadosContagem.length === 0 && !error ? (<p className="text-center text-slate-400 py-6">Nenhum dado encontrado para o período.</p>) : !error ? (
                            <div className={getLayoutClasses()}>
                                <div className={`${getSectionClasses('table')} flex flex-col`}>
                                    <h2 className="flex items-center text-lg mb-3 font-semibold text-sky-300 flex-shrink-0 border-b border-slate-700 pb-2">
                                        <MdList className="mr-2" /> Dados Mensais (Recentes Primeiro)
                                    </h2>
                                    <div className="flex-grow overflow-y-auto max-h-96">
                                        <table className="w-full text-sm text-left">
                                            <thead className="sticky top-0 bg-slate-700 text-xs text-slate-300 uppercase z-10">
                                            <tr>
                                                <th scope="col" className="px-4 py-2"> <div className="flex items-center gap-1"> <MdCalendarToday size={14}/> Mês/Ano </div> </th>
                                                <th scope="col" className="px-4 py-2 text-right"> Quantidade </th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700">
                                            {dadosContagem.map(item => (
                                                <tr key={item.mesAno} className="hover:bg-slate-700/50">
                                                    <td className="px-4 py-2 text-slate-300">{item.mesAno}</td>
                                                    <td className="px-4 py-2 font-medium text-slate-100 text-right">{item.quantidade}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className={getSectionClasses('graph')}>
                                    <div className="relative h-80 md:h-96 lg:h-[450px]"> {/* Altura ajustável */}
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