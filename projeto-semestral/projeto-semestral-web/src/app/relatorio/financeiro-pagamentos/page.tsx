// src/app/relatorio/financeiro-pagamentos/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import NavBar from '@/components/nav-bar';
import { Bar, Pie } from 'react-chartjs-2'; // Pie adicionado
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarController,
    BarElement,
    LineController,
    LineElement,
    PointElement,
    ArcElement,     // Necessário para Pie/Doughnut
    Title as ChartTitle,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import {
    MdAttachMoney, MdTrendingUp, MdPieChart, MdFilterList, MdErrorOutline, MdAssessment, MdCalendarToday, MdSummarize
} from 'react-icons/md';
import { DollarSign, Users, BarChartHorizontalBig, Activity, Palette, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

ChartJS.register(
    CategoryScale, LinearScale, BarController, BarElement,
    LineController, LineElement, PointElement, ArcElement, // ArcElement registrado
    ChartTitle, Tooltip, Legend, Filler
);

interface EstatisticasPagamentosDto {
    totalOperacoes: number;
    valorTotalArrecadado: number;
    ticketMedio: number;
}
interface PagamentosPorTipoDto {
    tipoPagamento: string;
    quantidade: number;
    valorTotal: number;
}
interface EvolucaoMensalValorDto {
    mesAno: string;
    valorTotal: number;
}
type ViewModePagamentos = 'resumo' | 'porTipo' | 'evolucaoValor';

const chartBackgroundColors = [
    'rgba(54, 162, 235, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(255, 206, 86, 0.8)',
    'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)', 'rgba(255, 99, 132, 0.8)',
    'rgba(100, 116, 139, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(139, 92, 246, 0.8)'
]; // Alpha aumentado para melhor visualização em Pie
const chartBorderColors = chartBackgroundColors.map(color => color.replace(/0\.8/, '1'));

export default function RelatorioFinanceiroPagamentosPage() {
    const [viewMode, setViewMode] = useState<ViewModePagamentos>('resumo');
    const [dataInicio, setDataInicio] = useState(() => new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
    const [dataFim, setDataFim] = useState(() => new Date().toISOString().split('T')[0]);

    const [estatisticas, setEstatisticas] = useState<EstatisticasPagamentosDto | null>(null);
    const [pagamentosPorTipo, setPagamentosPorTipo] = useState<PagamentosPorTipoDto[]>([]);
    const [evolucaoValor, setEvolucaoValor] = useState<EvolucaoMensalValorDto[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({ dataInicio, dataFim }).toString();
            let fetchError = null;

            try {
                const statsRes = await fetch(`http://localhost:8080/rest/relatorios/pagamentos/estatisticas?${queryParams}`);
                if (!statsRes.ok) {
                    const errorData = await statsRes.json().catch(() => ({ message: `Estatísticas: ${statsRes.statusText} (status ${statsRes.status})` }));
                    throw new Error(errorData.message);
                }
                const statsData = await statsRes.json();
                setEstatisticas(statsData);
            } catch (e: any) {
                console.error("Erro ao buscar estatísticas:", e);
                fetchError = e.message || "Erro ao buscar estatísticas.";
                setEstatisticas(null);
            }

            try {
                const tipoRes = await fetch(`http://localhost:8080/rest/relatorios/pagamentos/por-tipo?${queryParams}`);
                if (!tipoRes.ok) {
                    const errorData = await tipoRes.json().catch(() => ({ message: `Pagamentos por Tipo: ${tipoRes.statusText} (status ${tipoRes.status})` }));
                    throw new Error(errorData.message);
                }
                const tipoData = await tipoRes.json();
                setPagamentosPorTipo(tipoData || []);
            } catch (e: any) {
                console.error("Erro ao buscar pagamentos por tipo:", e);
                fetchError = fetchError ? `${fetchError}\n${e.message}` : (e.message || "Erro ao buscar pagamentos por tipo.");
                setPagamentosPorTipo([]);
            }

            try {
                const evolucaoRes = await fetch(`http://localhost:8080/rest/relatorios/pagamentos/evolucao-mensal-valor?${queryParams}`);
                if (!evolucaoRes.ok) {
                    const errorData = await evolucaoRes.json().catch(() => ({ message: `Evolução Mensal: ${evolucaoRes.statusText} (status ${evolucaoRes.status})` }));
                    throw new Error(errorData.message);
                }
                const evolucaoData = await evolucaoRes.json();
                const sortedEvolucaoData = (evolucaoData || []).sort((a: EvolucaoMensalValorDto, b: EvolucaoMensalValorDto) => a.mesAno.localeCompare(b.mesAno));
                setEvolucaoValor(sortedEvolucaoData);
            } catch (e: any) {
                console.error("Erro ao buscar evolução mensal:", e);
                fetchError = fetchError ? `${fetchError}\n${e.message}` : (e.message || "Erro ao buscar evolução mensal.");
                setEvolucaoValor([]);
            }
            if (fetchError) { setError(fetchError); }
        } catch (err: any) {
            console.error("Falha geral ao buscar dados do relatório:", err);
            setError(err.message || "Erro desconhecido ao buscar dados.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataInicio, dataFim]);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    const formatCurrency = (value: number | undefined | null): string => {
        if (value === null || value === undefined) return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const pagamentosPorTipoChartData = useMemo(() => {
        const labels = pagamentosPorTipo.map(p => p.tipoPagamento);
        const dataValues = pagamentosPorTipo.map(p => p.valorTotal);
        const dataQuantidades = pagamentosPorTipo.map(p => p.quantidade);
        return {
            labels,
            datasets: [
                {
                    type: 'bar' as const,
                    label: 'Valor Total (R$)',
                    data: dataValues,
                    backgroundColor: labels.map((_, i) => chartBackgroundColors[i % chartBackgroundColors.length]),
                    borderColor: labels.map((_, i) => chartBorderColors[i % chartBorderColors.length]),
                    borderWidth: 1,
                    yAxisID: 'yValor',
                    order: 1
                },
                {
                    type: 'bar' as const,
                    label: 'Quantidade',
                    data: dataQuantidades,
                    backgroundColor: labels.map((_, i) => chartBackgroundColors[(i + Math.floor(chartBackgroundColors.length / 2)) % chartBackgroundColors.length].replace('0.8', '0.6')),
                    borderColor: labels.map((_, i) => chartBorderColors[(i + Math.floor(chartBorderColors.length / 2)) % chartBorderColors.length]),
                    borderWidth: 1,
                    yAxisID: 'yQuantidade',
                    order: 2
                }
            ]
        };
    }, [pagamentosPorTipo]);

    // NOVO: Dados para o Gráfico de Pizza (Distribuição por Quantidade)
    const pagamentosPorTipoPizzaChartData = useMemo(() => {
        const labels = pagamentosPorTipo.map(p => p.tipoPagamento);
        const dataQuantidades = pagamentosPorTipo.map(p => p.quantidade);
        return {
            labels,
            datasets: [{
                label: 'Quantidade por Forma de Pagamento',
                data: dataQuantidades,
                backgroundColor: labels.map((_, i) => chartBackgroundColors[i % chartBackgroundColors.length]),
                borderColor: labels.map((_, i) => chartBorderColors[i % chartBorderColors.length]),
                borderWidth: 1,
            }]
        };
    }, [pagamentosPorTipo]);

    const evolucaoValorChartData = useMemo(() => {
        const labels = evolucaoValor.map(e => e.mesAno);
        const dataValues = evolucaoValor.map(e => e.valorTotal);
        return {
            labels,
            datasets: [{
                type: 'bar' as const,
                label: 'Valor Total Arrecadado (R$)',
                data: dataValues,
                backgroundColor: labels.map((_, i) => chartBackgroundColors[i % chartBackgroundColors.length]),
                borderColor: labels.map((_, i) => chartBorderColors[i % chartBorderColors.length]),
                borderWidth: 1
            }]
        };
    }, [evolucaoValor]);

    const chartOptionsBase = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: '#e2e8f0', boxWidth: 15, padding:15 }
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { size: 14 as number },
                bodyFont: { size: 12 as number },
                padding: 10,
                cornerRadius: 4
            }
        },
        scales: { x: { ticks: { color: '#94a3b8' }, grid: { display: false } } }
    };

    const pagamentosPorTipoChartOptions = {
        ...chartOptionsBase,
        plugins: {
            ...chartOptionsBase.plugins,
            title: { display: true, text: 'Pagamentos por Forma (Valor e Quantidade)', color: '#e2e8f0', font: { size: 16 as number, weight: 'bold' as 'bold' }, padding: {bottom: 15} }
        },
        scales: {
            ...chartOptionsBase.scales,
            x: { ...chartOptionsBase.scales.x, stacked: false },
            yValor: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: { display: true, text: 'Valor Total (R$)', color: '#94a3b8', font: {size: 12 as number, weight: 'bold' as 'bold'}},
                ticks: { color: '#94a3b8', callback: function(value: any) { return 'R$ ' + Number(value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2 }); } },
                grid: { color: 'rgba(100, 116, 139, 0.2)' },
                stacked: false
            },
            yQuantidade: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                title: { display: true, text: 'Quantidade de Pagamentos', color: '#94a3b8', font: {size: 12 as number, weight: 'bold' as 'bold'}},
                ticks: { color: '#94a3b8', stepSize: pagamentosPorTipo.length > 0 ? Math.max(1, Math.ceil(Math.max(...(pagamentosPorTipo.map(p => p.quantidade)), 1) / 5)) : 1 },
                grid: { drawOnChartArea: false },
                stacked: false
            },
        }
    };

    // NOVO: Opções para o Gráfico de Pizza
    const pizzaChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#e2e8f0',
                    boxWidth: 12,
                    padding: 20,
                    font: { size: 11 as number}
                }
            },
            title: {
                display: true,
                text: 'Distribuição por Quantidade', // Título mais simples para o espaço
                color: '#cbd5e1', // Cor mais suave para subtítulo
                font: { size: 14 as number, weight: 'normal' as 'normal' },
                padding: { top: 0, bottom: 10 }
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        let label = context.label || '';
                        if (context.parsed !== null) {
                            if (label) { label += ': '; }
                            label += context.parsed;
                        }
                        return label;
                    }
                }
            }
        }
    };

    const evolucaoValorChartOptions = {
        ...chartOptionsBase,
        plugins: {
            ...chartOptionsBase.plugins,
            legend: { display: false },
            title: { display: true, text: 'Evolução Mensal do Valor Arrecadado', color: '#e2e8f0', font: { size: 16 as number, weight: 'bold' as 'bold'}, padding: {bottom: 15} }
        },
        scales: {
            ...chartOptionsBase.scales,
            y: {
                beginAtZero: true,
                ticks: { color: '#94a3b8', callback: function(value: any) { return 'R$ ' + Number(value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2 }); } },
                grid: { color: 'rgba(100, 116, 139, 0.2)' }
            }
        }
    };


    return (
        <>
            <NavBar active="relatorio-financeiro-pagamentos" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="flex items-center justify-center text-2xl md:text-3xl font-bold mb-6 text-center gap-2">
                    <MdAssessment className="text-4xl text-sky-400" />
                    Relatório Financeiro de Pagamentos
                </h1>

                <form onSubmit={handleFilterSubmit} className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md flex flex-wrap items-end gap-4 justify-center">
                    <div className="flex items-center gap-2">
                        <label htmlFor="dataInicio" className="text-sm text-slate-300 whitespace-nowrap"><MdCalendarToday className="inline mr-1"/>De:</label>
                        <input type="date" id="dataInicio" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white date-input-fix"/>
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="dataFim" className="text-sm text-slate-300 whitespace-nowrap"><MdCalendarToday className="inline mr-1"/>Até:</label>
                        <input type="date" id="dataFim" value={dataFim} onChange={e => setDataFim(e.target.value)} className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white date-input-fix"/>
                    </div>
                    <button type="submit" disabled={isLoading} className={`p-2 h-10 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md flex items-center gap-2 px-4 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <MdFilterList size={20}/> Aplicar Filtros
                    </button>
                </form>

                <div className="mb-6 flex flex-wrap justify-center gap-3">
                    {(['resumo', 'porTipo', 'evolucaoValor'] as ViewModePagamentos[]).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors shadow-sm ${ viewMode === mode ? 'bg-sky-500 text-white font-semibold' : 'bg-slate-700 text-slate-200 hover:bg-slate-600' }`}
                        >
                            {mode === 'resumo' && <><MdSummarize className="mr-2"/>Resumo Geral</>}
                            {mode === 'porTipo' && <><MdPieChart className="mr-2"/>Formas de Pagamento</>}
                            {mode === 'evolucaoValor' && <><MdTrendingUp className="mr-2"/>Evolução Mensal (Valor)</>}
                        </button>
                    ))}
                </div>

                {isLoading && (
                    <div className='flex justify-center items-center py-10'>
                        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                        <span className='ml-3 text-sky-300 text-lg'>Carregando dados do relatório...</span>
                    </div>
                )}
                {error && !isLoading && (
                    <div className="text-center text-red-400 py-4 bg-red-900/30 border border-red-700 rounded-md p-4 max-w-2xl mx-auto">
                        <p className="flex items-center justify-center gap-2"><MdErrorOutline size={22}/> Erro ao carregar relatório: {error}</p>
                        <button onClick={fetchData} className="mt-3 px-4 py-1.5 bg-sky-600 hover:bg-sky-700 rounded text-white text-sm">
                            Tentar Novamente
                        </button>
                    </div>
                )}

                {!isLoading && !error && (
                    <div className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-xl border border-slate-700">
                        {viewMode === 'resumo' && (
                            <section>
                                <h2 className="flex items-center text-xl font-semibold mb-6 text-sky-300 border-b border-slate-700 pb-3 gap-2">
                                    <MdSummarize size={24}/> Resumo Geral de Pagamentos
                                </h2>
                                {estatisticas && pagamentosPorTipo.length > 0 && (
                                    <div className="mb-8 p-4 bg-slate-800/50 rounded-lg shadow-inner">
                                        <div className="relative h-64 md:h-72">
                                            <Pie options={pizzaChartOptions} data={pagamentosPorTipoPizzaChartData} />
                                        </div>
                                    </div>
                                )}
                                {estatisticas && pagamentosPorTipo.length === 0 && !isLoading && (
                                    <p className="text-center text-slate-400 py-3 my-4 text-sm bg-slate-800/30 rounded-md">
                                        (Dados insuficientes para o gráfico de distribuição por forma de pagamento no período)
                                    </p>
                                )}
                                {estatisticas ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                        <div className="bg-slate-800 p-5 rounded-lg shadow">
                                            <p className="text-3xl lg:text-4xl font-bold text-green-400">{formatCurrency(estatisticas.valorTotalArrecadado)}</p>
                                            <p className="text-sm text-slate-400 mt-1">Valor Total Arrecadado</p>
                                        </div>
                                        <div className="bg-slate-800 p-5 rounded-lg shadow">
                                            <p className="text-3xl lg:text-4xl font-bold text-sky-400">{estatisticas.totalOperacoes}</p>
                                            <p className="text-sm text-slate-400 mt-1">Total de Pagamentos Registrados</p>
                                        </div>
                                        <div className="bg-slate-800 p-5 rounded-lg shadow">
                                            <p className="text-3xl lg:text-4xl font-bold text-amber-400">{formatCurrency(estatisticas.ticketMedio)}</p>
                                            <p className="text-sm text-slate-400 mt-1">Ticket Médio por Pagamento</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-400 py-10">Nenhum dado para o resumo no período selecionado.</p>
                                )}
                            </section>
                        )}

                        {viewMode === 'porTipo' && pagamentosPorTipo.length > 0 && (
                            <section>
                                <h2 className="flex items-center text-xl font-semibold mb-4 text-sky-300 border-b border-slate-700 pb-2 gap-2">
                                    <BarChartHorizontalBig size={24}/> Detalhamento por Forma de Pagamento
                                </h2>
                                <div className="relative h-[450px] md:h-[500px]">
                                    <Bar options={pagamentosPorTipoChartOptions} data={pagamentosPorTipoChartData} />
                                </div>
                            </section>
                        )}
                        {viewMode === 'porTipo' && pagamentosPorTipo.length === 0 && !isLoading && (
                            <p className="text-center text-slate-400 py-10">Nenhum dado de pagamento por tipo para o período selecionado.</p>
                        )}

                        {viewMode === 'evolucaoValor' && evolucaoValor.length > 0 && (
                            <section>
                                <h2 className="flex items-center text-xl font-semibold mb-4 text-sky-300 border-b border-slate-700 pb-2 gap-2">
                                    <Activity size={24}/> Evolução Mensal do Valor Arrecadado
                                </h2>
                                <div className="relative h-80 md:h-96">
                                    <Bar options={evolucaoValorChartOptions} data={evolucaoValorChartData} />
                                </div>
                            </section>
                        )}
                        {viewMode === 'evolucaoValor' && evolucaoValor.length === 0 && !isLoading && (
                            <p className="text-center text-slate-400 py-10">Nenhum dado de evolução mensal para o período selecionado.</p>
                        )}
                    </div>
                )}
            </main>
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
            `}</style>
        </>
    );
}