// app/relatorio/agendamentos-futuros/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link'; // Link pode não ser necessário aqui, a menos que link para detalhes
import NavBar from '@/components/nav-bar';

// --- Interfaces (podem ser as mesmas da listagem) ---
interface AgendamentoParaLista { id: number; dataAgendamento: string; observacao: string; }
interface PaginatedAgendaResponse { content: AgendamentoApiResponseDto[]; totalPages: number; totalElements: number; number: number; size: number; }
interface AgendamentoApiResponseDto { id: number; dataAgendamento: string; observacao: string | null; }
// ----------------------------------------------------

export default function RelatorioAgendamentosFuturosPage() {
    const [agendamentos, setAgendamentos] = useState<AgendamentoParaLista[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(15); // Pode aumentar o tamanho para relatórios

    // --- Função para buscar agendamentos futuros paginados ---
    const fetchAgendamentosFuturos = async (page = 0) => {
        setIsLoading(true);
        setError(null);

        const today = new Date().toISOString().split('T')[0]; // Pega data de hoje no formato AAAA-MM-DD

        const params = new URLSearchParams({
            page: page.toString(),
            size: pageSize.toString(),
            sort: 'dataAgendamento,asc', // Ordenar por data ascendente
            dataInicio: today // <<< FILTRO PRINCIPAL DESTE RELATÓRIO
        });
        const apiUrl = `http://localhost:8080/rest/agenda?${params.toString()}`;
        console.info("Buscando agendamentos futuros:", apiUrl);

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json().catch(() => ({ message: "Requisição inválida (400)." }));
                    throw new Error(errorData.message || `Erro HTTP ${response.status}`);
                }
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }

            if (response.status === 204) { // No Content
                setAgendamentos([]); setTotalPages(0); setCurrentPage(0);
                console.info("Nenhum agendamento futuro encontrado.");
                return;
            }

            const data: PaginatedAgendaResponse = await response.json();
            const agendamentosFormatados: AgendamentoParaLista[] = data.content.map(dto => ({
                id: dto.id,
                dataAgendamento: dto.dataAgendamento ? new Date(dto.dataAgendamento + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A',
                observacao: dto.observacao || '',
            }));

            setAgendamentos(agendamentosFormatados);
            setTotalPages(data.totalPages);
            setCurrentPage(data.number);

        } catch (err: any) {
            setError(err.message || "Falha ao carregar relatório de agendamentos futuros.");
            setAgendamentos([]); setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAgendamentosFuturos(currentPage);
    }, [currentPage, pageSize]);

    // Funções de Paginação
    const handlePreviousPage = () => { if (currentPage > 0) { fetchAgendamentosFuturos(currentPage - 1); } };
    const handleNextPage = () => { if (currentPage < totalPages - 1) { fetchAgendamentosFuturos(currentPage + 1); } };

    return (
        <>
            <NavBar active="relatorio"/>
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="text-3xl font-bold mb-6 text-center">Relatório: Agendamentos Futuros</h1>

                {/* Mensagens */}
                {error && ( <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert"><span className="block sm:inline">{error}</span><button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-2xl" aria-hidden="true">&times;</span></button></div> )}

                {/* Tabela de Agendamentos */}
                {isLoading ? (
                    <p className="text-center text-sky-300 py-10">Carregando relatório...</p>
                ) : (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data Agendada</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Observação</th>
                                {/* Adicionar colunas de Cliente/Veículo se implementar no backend */}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {agendamentos.length === 0 ? (
                                <tr><td colSpan={3} className="px-6 py-4 text-center text-slate-400">Nenhum agendamento futuro encontrado.</td></tr> // Ajustar colSpan se adicionar colunas
                            ) : (
                                agendamentos.map((agendamento) => (
                                    <tr key={agendamento.id} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{agendamento.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{agendamento.dataAgendamento}</td>
                                        <td className="px-6 py-4 whitespace-normal max-w-lg truncate" title={agendamento.observacao}>{agendamento.observacao}</td>
                                        {/* Adicionar tds de Cliente/Veículo aqui */}
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Controles de Paginação */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex justify-center items-center mt-6 gap-4">
                        {/* ... botões de paginação ... */}
                        <button onClick={handlePreviousPage} disabled={currentPage === 0} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                            Anterior
                        </button>
                        <span className="text-slate-300">
                             Página {currentPage + 1} de {totalPages}
                         </span>
                        <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                            Próxima
                        </button>
                    </div>
                )}
            </main>
        </>
    );
}