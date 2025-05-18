// app/relatorio/agendamentos-futuros/page.tsx
"use client";

import { useState, useEffect } from 'react';
import NavBar from '@/components/nav-bar'; // Ajuste o caminho se necessário
import { fetchAuthenticated } from '@/utils/apiService'; // <<< Import adicionado

// --- Imports para Gráfico ---
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title as ChartTitle, Tooltip, Legend
} from 'chart.js';

// --- Ícones ---
import { CalendarDays, ClipboardList, Hash, BarChart3, ListChecks, ChevronLeft, ChevronRight } from 'lucide-react';
import { MdErrorOutline, MdCalendarToday } from 'react-icons/md'; // Ícones adicionais se necessário

// --- Registrar componentes Chart.js ---
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

// --- Interfaces ---
interface AgendamentoParaLista {
    id: number;
    dataAgendamento: string; // Formatada: DD/MM/YYYY ou 'N/A'
    observacao: string;
}
interface PaginatedAgendaResponse {
    content: AgendamentoApiResponseDto[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}
interface AgendamentoApiResponseDto {
    id: number;
    dataAgendamento: string; // Formato YYYY-MM-DD
    observacao: string | null;
}
// --- Interface para Contagem Mensal ---
interface ContagemMensalDto {
    mesAno: string; // Formato "YYYY-MM"
    quantidade: number;
}
// ----------------

export default function RelatorioAgendamentosFuturosPage() {
    // --- Estados para Agendamentos Futuros ---
    const [agendamentos, setAgendamentos] = useState<AgendamentoParaLista[]>([]);
    const [isLoadingAgendamentos, setIsLoadingAgendamentos] = useState(true);
    const [errorAgendamentos, setErrorAgendamentos] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(12); // Ajustado para cards

    // --- Estados para Contagem Mensal / Gráfico ---
    const [dadosContagem, setDadosContagem] = useState<ContagemMensalDto[]>([]);
    const [isLoadingContagem, setIsLoadingContagem] = useState(true);
    const [errorContagem, setErrorContagem] = useState<string | null>(null);

    // --- Fetch Agendamentos Futuros (usando fetchAuthenticated) ---
    const fetchAgendamentosFuturos = async (page = 0) => {
        setIsLoadingAgendamentos(true);
        setErrorAgendamentos(null);
        const today = new Date().toISOString().split('T')[0];
        const params = new URLSearchParams({
            page: page.toString(),
            size: pageSize.toString(),
            sort: 'dataAgendamento,asc',
            dataInicio: today
        });
        console.info("[Futuros] Buscando:", `/rest/agenda?${params.toString()}`);

        try {
            const response = await fetchAuthenticated(`/rest/agenda?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}`);
            }
            if (response.status === 204) {
                setAgendamentos([]);
                setTotalPages(0);
                setCurrentPage(page);
                return;
            }

            const data: PaginatedAgendaResponse = await response.json();
            const formatados: AgendamentoParaLista[] = data.content.map(dto => ({
                id: dto.id,
                dataAgendamento: formatarData(dto.dataAgendamento),
                observacao: dto.observacao || '',
            }));
            setAgendamentos(formatados);
            setTotalPages(data.totalPages);
            setCurrentPage(data.number);
        } catch (err: any) {
            setErrorAgendamentos(tratarErroFetch(err));
            setAgendamentos([]);
            setTotalPages(0);
        } finally {
            setIsLoadingAgendamentos(false);
        }
    };

    // --- Fetch Contagem Mensal (usando fetchAuthenticated) ---
    const fetchContagemMensal = async () => {
        setIsLoadingContagem(true);
        setErrorContagem(null);
        console.info("[Contagem] Buscando:", `/rest/relatorios/contagem-agendamentos-mensal`);
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
            data.sort((a, b) => a.mesAno.localeCompare(b.mesAno)); // Ordena para o gráfico
            setDadosContagem(data);
        } catch (err: any) {
            setErrorContagem(tratarErroFetch(err));
            setDadosContagem([]);
        } finally {
            setIsLoadingContagem(false);
        }
    };

    // --- useEffect para buscar ambos os dados ---
    useEffect(() => {
        fetchAgendamentosFuturos(currentPage);
        fetchContagemMensal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);

    // --- Configuração do Gráfico ---
    const labels = dadosContagem.map(d => d.mesAno);
    const valores = dadosContagem.map(d => d.quantidade);
    const backgroundColors = [
        'rgba(54, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)',
        'rgba(255, 206, 86, 0.7)', 'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)', 'rgba(255, 99, 132, 0.7)',
        'rgba(100, 116, 139, 0.7)'
    ];
    const borderColors = backgroundColors.map(color => color.replace(/0\.7/, '1'));
    const chartData = {
        labels,
        datasets: [{
            label: 'Nº de Agendamentos',
            data: valores,
            backgroundColor: backgroundColors.slice(0, valores.length),
            borderColor: borderColors.slice(0, valores.length),
            borderWidth: 1,
        }]
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Agendamentos por Mês/Ano', color: '#e2e8f0', font: { size: 16 } },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed.y !== null) { label += context.parsed.y; }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
            y: {
                beginAtZero: true,
                ticks: { color: '#94a3b8', stepSize: Math.max(1, Math.ceil(Math.max(...valores, 1) / 5)) },
                grid: { color: 'rgba(100, 116, 139, 0.2)' }
            }
        },
    };
    // ----------------------------

    // --- Funções Auxiliares ---
    const handlePreviousPage = () => { if (currentPage > 0) setCurrentPage(prev => prev - 1); };
    const handleNextPage = () => { if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1); };
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
    const tratarErroFetch = (err: any): string => {
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
            return "Não foi possível conectar ao servidor. Verifique a API e a rede.";
        }
        return err.message || "Ocorreu um erro desconhecido.";
    };
    // -------------------------

    return (
        <>
            <NavBar active="relatorio-agendamentos-futuros" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Título Principal */}
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                    <CalendarDays className="h-8 w-8 text-sky-400" />
                    Relatórios de Agendamento
                </h1>

                {/* Seção do Gráfico Mensal */}
                <section className="mb-8 bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                    <h2 className="flex items-center text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-2 gap-2">
                        <BarChart3 size={24} /> Contagem Mensal de Agendamentos
                    </h2>
                    {errorContagem && (
                        <p className="text-center text-red-400 mb-4 p-3 bg-red-900/50 rounded border border-red-500 flex items-center gap-2">
                            <MdErrorOutline /> Erro ao carregar dados do gráfico: {errorContagem}
                        </p>
                    )}
                    {isLoadingContagem ? (
                        <p className="text-center text-sky-300 py-5">Carregando gráfico...</p>
                    ) : (
                        <div className="relative h-64 md:h-80">
                            {dadosContagem.length > 0 ? (
                                <Bar options={chartOptions} data={chartData} />
                            ) : (
                                <p className="text-center text-slate-400 flex items-center justify-center h-full">
                                    Nenhum dado de contagem mensal disponível.
                                </p>
                            )}
                        </div>
                    )}
                </section>

                {/* Seção Agendamentos Futuros */}
                <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                    <h2 className="flex items-center text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-2 gap-2">
                        <ListChecks size={24} /> Próximos Agendamentos (a partir de hoje)
                    </h2>

                    {errorAgendamentos && (
                        <p className="text-center text-red-400 mb-4 p-3 bg-red-900/50 rounded border border-red-500 flex items-center gap-2">
                            <MdErrorOutline /> {errorAgendamentos}
                        </p>
                    )}

                    {isLoadingAgendamentos ? (
                        <p className="text-center text-sky-300 py-10">Carregando agendamentos futuros...</p>
                    ) : (
                        <>
                            {agendamentos.length === 0 && !errorAgendamentos ? (
                                <p className="text-center text-slate-400 py-10">Nenhum agendamento futuro encontrado.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {agendamentos.map(ag => (
                                        <div key={ag.id} className="bg-slate-800 rounded-lg shadow-md border border-slate-700 flex flex-col overflow-hidden">
                                            <div className="bg-slate-700 p-3 flex justify-between items-center text-sm">
                                                <span className="flex items-center gap-1 font-semibold text-sky-300">
                                                    <Hash size={16} /> ID: {ag.id}
                                                </span>
                                                <span className="flex items-center gap-1 text-slate-400">
                                                    <CalendarDays size={16} /> {ag.dataAgendamento}
                                                </span>
                                            </div>
                                            <div className="p-4 space-y-2 flex-grow">
                                                <h3 className="flex items-center text-base font-semibold mb-1 text-slate-200 gap-1">
                                                    <ClipboardList size={18} className="text-amber-400 flex-shrink-0" /> Observação
                                                </h3>
                                                <p className="text-sm text-slate-300 break-words max-h-28 overflow-y-auto pr-1">
                                                    {ag.observacao || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!isLoadingAgendamentos && totalPages > 1 && (
                                <div className="flex justify-center items-center mt-6 gap-3">
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
