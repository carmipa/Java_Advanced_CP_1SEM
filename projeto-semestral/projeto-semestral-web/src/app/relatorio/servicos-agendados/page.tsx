// app/relatorio/servicos-agendados/page.tsx
"use client";

import { useState, useEffect } from 'react';
import NavBar from '@/components/nav-bar';
import { fetchAuthenticated } from '@/utils/apiService'; // <<< Import adicionado

// --- Imports para Gráfico ---
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title as ChartTitle,
    Tooltip,
    Legend
} from 'chart.js';

// --- Ícones Lucide ---
import {
    CalendarDays,
    Hash,
    AlertTriangle,
    Stethoscope,
    Car,
    ListX,
    BarChart3,
    ListChecks,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { MdErrorOutline } from 'react-icons/md';

// Registrar componentes Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

// Interfaces
interface ServicoAgendado {
    agendaId: number;
    dataAgendamento: string;
    veiculoPlaca: string;
    descricaoProblema: string;
    diagnostico: string;
}
interface PaginatedServicosResponse {
    content: ServicoAgendadoDto[];
    totalPages: number;
    number: number;
    size: number;
}
interface ServicoAgendadoDto {
    agendaId: number;
    dataAgendamento: string;
    veiculoPlaca: string | null;
    descricaoProblema: string | null;
    diagnostico: string | null;
}
interface ContagemMensalDto {
    mesAno: string;
    quantidade: number;
}

// Helpers
const tratarErroFetch = (err: any): string => {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
        return "Não foi possível conectar ao servidor. Verifique a API e a rede.";
    }
    if (err.message && (err.message.startsWith("Erro HTTP") || err.message.includes("inválido") || err.message.includes("Endpoint"))) {
        return err.message;
    }
    return err.message || "Ocorreu um erro desconhecido.";
};

const formatarData = (dataString: string | null | undefined): string => {
    if (!dataString) return '-';
    try {
        return new Date(dataString + 'T00:00:00Z')
            .toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    } catch (e) {
        console.error("Erro formatar data:", dataString, e);
        return 'Inválida';
    }
};

export default function RelatorioServicosAgendadosPage() {
    // Estados para Serviços Agendados
    const [servicos, setServicos] = useState<ServicoAgendado[]>([]);
    const [isLoadingServicos, setIsLoadingServicos] = useState(true);
    const [errorServicos, setErrorServicos] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(12);

    // Estados para Contagem Mensal / Gráfico
    const [dadosContagem, setDadosContagem] = useState<ContagemMensalDto[]>([]);
    const [isLoadingContagem, setIsLoadingContagem] = useState(true);
    const [errorContagem, setErrorContagem] = useState<string | null>(null);

    // Fetch Serviços Agendados
    const fetchServicos = async (page = 0) => {
        setIsLoadingServicos(true);
        setErrorServicos(null);
        const today = new Date().toISOString().split('T')[0];
        const params = new URLSearchParams({
            page: page.toString(),
            size: pageSize.toString(),
            sort: 'dataAgendamento,asc',
            dataInicio: today
        });
        console.info("Buscando serviços agendados:", `/rest/relatorios/servicos-agendados?${params.toString()}`);

        try {
            const response = await fetchAuthenticated(`/rest/relatorios/servicos-agendados?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}`);
            }
            if (response.status === 204) {
                setServicos([]);
                setTotalPages(0);
                setCurrentPage(page);
                return;
            }

            const data: PaginatedServicosResponse = await response.json();
            const formatados = data.content.map(dto => ({
                agendaId: dto.agendaId,
                dataAgendamento: formatarData(dto.dataAgendamento),
                veiculoPlaca: dto.veiculoPlaca || '-',
                descricaoProblema: dto.descricaoProblema || '-',
                diagnostico: dto.diagnostico || 'Pendente'
            }));
            setServicos(formatados);
            setTotalPages(data.totalPages);
            setCurrentPage(data.number);
        } catch (err: any) {
            setErrorServicos(tratarErroFetch(err));
            setServicos([]);
            setTotalPages(0);
        } finally {
            setIsLoadingServicos(false);
        }
    };

    // Fetch Contagem Mensal
    const fetchContagemMensal = async () => {
        setIsLoadingContagem(true);
        setErrorContagem(null);
        console.info("Buscando contagem mensal:", `/rest/relatorios/contagem-agendamentos-mensal`);

        try {
            const resp = await fetchAuthenticated(`/rest/relatorios/contagem-agendamentos-mensal`);
            if (!resp.ok) {
                throw new Error(`Erro HTTP ${resp.status}`);
            }
            if (resp.status === 204) {
                setDadosContagem([]);
                return;
            }
            const data: ContagemMensalDto[] = await resp.json();
            data.sort((a, b) => a.mesAno.localeCompare(b.mesAno));
            setDadosContagem(data);
        } catch (err: any) {
            setErrorContagem(tratarErroFetch(err));
            setDadosContagem([]);
        } finally {
            setIsLoadingContagem(false);
        }
    };

    useEffect(() => {
        fetchServicos(currentPage);
        fetchContagemMensal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);

    // Gráfico mensal
    const labels = dadosContagem.map(d => d.mesAno);
    const valores = dadosContagem.map(d => d.quantidade);
    const backgroundColors = [
        'rgba(54, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)',
        'rgba(255, 206, 86, 0.7)', 'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)', 'rgba(255, 99, 132, 0.7)',
        'rgba(100, 116, 139, 0.7)', 'rgba(239, 68, 68, 0.7)',
        'rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)',
        'rgba(245, 158, 11, 0.7)', 'rgba(139, 92, 246, 0.7)'
    ];
    const borderColors = backgroundColors.map(c => c.replace(/0\.7/, '1'));
    const chartData = {
        labels,
        datasets: [{
            label: 'Nº de Agendamentos (Total Mensal)',
            data: valores,
            backgroundColor: valores.map((_, i) => backgroundColors[i % backgroundColors.length]),
            borderColor: valores.map((_, i) => borderColors[i % borderColors.length]),
            borderWidth: 1
        }]
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Volume Total de Agendamentos por Mês',
                color: '#e2e8f0',
                font: { size: 16 as number }
            }
        },
        scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#94a3b8',
                    stepSize: Math.max(1, Math.ceil(Math.max(...valores, 1) / 6))
                },
                grid: { color: 'rgba(100, 116, 139, 0.2)' }
            }
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) setCurrentPage(prev => prev - 1);
    };
    const handleNextPage = () => {
        if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
    };

    return (
        <>
            <NavBar active="relatorio-servicos-agendados" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center flex justify-center items-center gap-2">
                    <Stethoscope className="h-8 w-8 text-sky-400" />
                    Relatório: Serviços Agendados (A partir de hoje)
                </h1>

                {/* Gráfico Mensal */}
                <section className="mb-8 bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                    <h2 className="flex items-center text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-2 gap-2">
                        <BarChart3 size={24} />
                        Volume Total de Agendamentos (Mensal)
                    </h2>
                    {errorContagem && (
                        <div className="relative text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                            <MdErrorOutline className="inline mr-2" />
                            Erro ao carregar dados do gráfico: {errorContagem}
                            <button
                                type="button"
                                className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200"
                                onClick={() => setErrorContagem(null)}
                                aria-label="Fechar"
                            >
                                <span className="text-xl" aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    )}
                    {isLoadingContagem ? (
                        <div className='flex justify-center items-center py-10'>
                            <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
                            <span className='ml-3 text-sky-300'>Carregando gráfico...</span>
                        </div>
                    ) : (
                        <div className="relative h-64 md:h-72">
                            {dadosContagem.length > 0 ? (
                                <Bar data={chartData} options={chartOptions} />
                            ) : (
                                <p className="text-center text-slate-400 flex items-center justify-center h-full">
                                    Nenhum dado de contagem mensal disponível para o gráfico.
                                </p>
                            )}
                        </div>
                    )}
                </section>

                {/* Lista de Serviços Agendados */}
                <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                    <h2 className="flex items-center text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-2 gap-2">
                        <ListChecks size={24} />
                        Detalhes dos Serviços Agendados (A partir de hoje)
                    </h2>

                    {errorServicos && (
                        <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                            <MdErrorOutline className="inline mr-2" />
                            Erro ao carregar lista de serviços: {errorServicos}
                            <button
                                type="button"
                                className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200"
                                onClick={() => setErrorServicos(null)}
                                aria-label="Fechar"
                            >
                                <span className="text-xl" aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    )}

                    {isLoadingServicos ? (
                        <div className='flex justify-center items-center py-10'>
                            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                            <span className='ml-3 text-sky-300'>Carregando serviços...</span>
                        </div>
                    ) : servicos.length === 0 && !errorServicos ? (
                        <p className="text-center text-slate-400 py-10 flex items-center justify-center gap-2">
                            <ListX size={20} />
                            Nenhum serviço agendado encontrado a partir de hoje.
                        </p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {servicos.map(s => (
                                    <div key={s.agendaId} className="bg-slate-800 rounded-lg shadow border border-slate-600 flex flex-col hover:border-sky-500 transition-colors duration-200">
                                        <div className="p-3 flex justify-between items-center text-xs border-b border-slate-700 bg-slate-700/30 rounded-t-lg">
                                            <span className="flex items-center gap-1 font-semibold text-sky-300">
                                                <Hash size={14} /> Agenda ID: {s.agendaId}
                                            </span>
                                            <span className="flex items-center gap-1 text-slate-400">
                                                <CalendarDays size={14} /> {s.dataAgendamento}
                                            </span>
                                        </div>
                                        <div className="p-3 space-y-2 text-sm flex-grow">
                                            <p className="flex items-center gap-1">
                                                <Car size={16} className="text-slate-400 flex-shrink-0" />
                                                <strong>Veículo:</strong>
                                                <span className="ml-1 font-mono bg-slate-700 px-1.5 py-0.5 rounded text-xs">
                                                    {s.veiculoPlaca}
                                                </span>
                                            </p>
                                            <div className="pt-1">
                                                <p className="flex items-start gap-1 font-medium text-slate-300 mb-0.5">
                                                    <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                                                    Problema Descrito:
                                                </p>
                                                <p className="text-xs text-slate-400 pl-5 break-words">
                                                    {s.descricaoProblema}
                                                </p>
                                            </div>
                                            <div className="pt-1">
                                                <p className="flex items-start gap-1 font-medium text-slate-300 mb-0.5">
                                                    <Stethoscope size={16} className="text-teal-400 flex-shrink-0 mt-0.5" />
                                                    Diagnóstico Preliminar:
                                                </p>
                                                <p className="text-xs text-slate-400 pl-5 break-words">
                                                    {s.diagnostico}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center mt-6 pt-6 border-t border-slate-700 gap-3">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 0}
                                        className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        <ChevronLeft size={18} /> Anterior
                                    </button>
                                    <span className="text-slate-300 text-sm">
                                        Página {currentPage + 1} de {totalPages}
                                    </span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage >= totalPages - 1}
                                        className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        Próxima <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
        </>
    );
}
