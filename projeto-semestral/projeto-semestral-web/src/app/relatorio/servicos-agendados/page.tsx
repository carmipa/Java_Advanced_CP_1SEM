// app/relatorio/servicos-agendados/page.tsx
"use client";

import { useState, useEffect } from 'react';
import NavBar from '@/components/nav-bar';
// --- Ícones importados ---
import { CalendarDays, Hash, RectangleHorizontal, AlertTriangle, Stethoscope } from 'lucide-react';

// --- Interfaces ---
interface ServicoAgendado { agendaId: number; dataAgendamento: string; veiculoPlaca: string | null; descricaoProblema: string | null; diagnostico: string | null; }
interface PaginatedServicosResponse { content: ServicoAgendadoDto[]; totalPages: number; number: number; size: number; }
interface ServicoAgendadoDto { agendaId: number; dataAgendamento: string; veiculoPlaca: string | null; descricaoProblema: string | null; diagnostico: string | null; }
// ----------------

export default function RelatorioServicosAgendadosPage() {
    const [servicos, setServicos] = useState<ServicoAgendado[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10); // Ajustado para 10, modifique se necessário

    useEffect(() => {
        const fetchServicos = async (page = 0) => {
            setIsLoading(true); setError(null);
            const today = new Date().toISOString().split('T')[0];
            const params = new URLSearchParams({
                page: page.toString(), size: pageSize.toString(),
                sort: 'dataAgendamento,asc', dataInicio: today
            });
            const apiUrl = `http://localhost:8080/rest/relatorios/servicos-agendados?${params.toString()}`;
            console.info("Buscando serviços agendados:", apiUrl);

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) { /* ... tratamento de erro ... */
                    if (response.status === 404) throw new Error("Endpoint de serviços agendados não encontrado (404).");
                    if (response.status >= 500) throw new Error(`Erro no servidor (${response.status}).`);
                    throw new Error(`Erro HTTP ${response.status}`);
                }
                if (response.status === 204) { setServicos([]); setTotalPages(0); setCurrentPage(0); return; }

                const data: PaginatedServicosResponse = await response.json();
                const formatados: ServicoAgendado[] = data.content.map(dto => ({
                    agendaId: dto.agendaId,
                    dataAgendamento: dto.dataAgendamento ? new Date(dto.dataAgendamento + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A',
                    veiculoPlaca: dto.veiculoPlaca || '-',
                    descricaoProblema: dto.descricaoProblema || '-',
                    diagnostico: dto.diagnostico || 'Pendente'
                }));
                setServicos(formatados); setTotalPages(data.totalPages); setCurrentPage(data.number);
            } catch (err: any) {
                if (err instanceof TypeError && err.message === "Failed to fetch") { setError("Falha ao conectar ao servidor."); }
                else { setError(err.message || "Falha ao carregar relatório."); }
                setServicos([]); setTotalPages(0);
            } finally { setIsLoading(false); }
        };
        fetchServicos(currentPage);
    }, [currentPage, pageSize]);

    // Funções de Paginação
    const handlePreviousPage = () => { if (currentPage > 0) { setCurrentPage(prev => prev - 1); } };
    const handleNextPage = () => { if (currentPage < totalPages - 1) { setCurrentPage(prev => prev + 1); } };


    return (
        <>
            <NavBar active="relatorio-servicos-agendados"/>
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Título com Ícone */}
                <h1 className="text-3xl font-bold mb-6 text-center flex justify-center items-center gap-2">
                    <Stethoscope className="h-8 w-8" /> {/* Ícone de exemplo */}
                    Relatório: Serviços Agendados
                </h1>

                {error && ( <p className="text-center text-red-400 mb-4 p-3 bg-red-900/50 border border-red-500 rounded">{error}</p> )}

                {isLoading ? (
                    <p className="text-center text-sky-300 py-10">Carregando relatório...</p>
                ) : (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                {/* Cabeçalhos com Ícones */}
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-300"><div className="flex items-center gap-2"><Hash size={16}/>Agenda ID</div></th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-300"><div className="flex items-center gap-2"><CalendarDays size={16}/>Data</div></th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-300"><div className="flex items-center gap-2"><RectangleHorizontal size={16}/>Placa</div></th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-300"><div className="flex items-center gap-2"><AlertTriangle size={16}/>Problema Descrito</div></th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-300"><div className="flex items-center gap-2"><Stethoscope size={16}/>Diagnóstico Preliminar</div></th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {servicos.length === 0 && !error ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400">Nenhum serviço agendado encontrado a partir de hoje.</td></tr>
                            ) : (
                                servicos.map((s, index) => {
                                    const rowClass = index % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50';
                                    return (
                                        <tr key={s.agendaId} className={`${rowClass} hover:bg-sky-900/50`}>
                                            {/* Células de dados */}
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">{s.agendaId}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                {/* Adicionando ícone na célula da data também */}
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="h-4 w-4 text-sky-400 flex-shrink-0"/>
                                                    {s.dataAgendamento}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-mono"> {/* Placa com mono */}
                                                {s.veiculoPlaca}
                                            </td>
                                            <td className="px-4 py-4 text-sm whitespace-normal max-w-sm break-words">{s.descricaoProblema}</td>
                                            <td className="px-4 py-4 text-sm whitespace-normal max-w-sm break-words">{s.diagnostico}</td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Controles de Paginação */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex justify-center items-center mt-6 gap-4">
                        <button onClick={handlePreviousPage} disabled={currentPage === 0} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>Anterior </button>
                        <span className="text-slate-300"> Página {currentPage + 1} de {totalPages} </span>
                        <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"> Próxima <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg></button>
                    </div>
                )}
            </main>
        </>
    );
}