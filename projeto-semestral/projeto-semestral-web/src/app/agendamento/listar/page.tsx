"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';
// Importação dos ícones
import { MdAdd, MdEdit, MdDelete, MdEventNote } from 'react-icons/md';

interface AgendamentoParaLista {
    id: number;
    dataAgendamento: string;
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
    dataAgendamento: string;
    observacao: string | null;
}

export default function ListarAgendamentosPage() {
    const [agendamentos, setAgendamentos] = useState<AgendamentoParaLista[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(10);

    const router = useRouter();

    const fetchAgendamentos = async (page = 0) => {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
            page: page.toString(),
            size: pageSize.toString(),
            sort: 'dataAgendamento,desc'
        });
        const apiUrl = `http://localhost:8080/rest/agenda?${params.toString()}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
            const data: PaginatedAgendaResponse = await response.json();
            const agendamentosFormatados: AgendamentoParaLista[] = data.content.map(dto => ({
                id: dto.id,
                dataAgendamento: new Date(dto.dataAgendamento + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
                observacao: dto.observacao || '',
            }));
            setAgendamentos(agendamentosFormatados);
            setTotalPages(data.totalPages);
            setCurrentPage(data.number);
        } catch (err: any) {
            setError(err.message || "Falha ao carregar agendamentos.");
            setAgendamentos([]);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAgendamentos(currentPage);
    }, [currentPage, pageSize]);

    const handlePreviousPage = () => {
        if (currentPage > 0) fetchAgendamentos(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) fetchAgendamentos(currentPage + 1);
    };

    return (
        <>
            <NavBar active="agendamento" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Cabeçalho */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="flex items-center gap-2 text-3xl font-bold">
                        <MdEventNote className="text-4xl" />
                        Agendamentos
                    </h1>
                    <Link href="/agendamento/cadastrar">
                        <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500">
                            <MdAdd />
                            Novo Agendamento
                        </button>
                    </Link>
                </div>

                {/* Mensagem de erro */}
                {error && (
                    <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                        <span className="block sm:inline">{error}</span>
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar">
                            <span className="text-2xl" aria-hidden="true">&times;</span>
                        </button>
                    </div>
                )}

                {/* Tabela de Agendamentos */}
                {isLoading ? (
                    <p className="text-center text-sky-300 py-10">Carregando agendamentos...</p>
                ) : (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Observação</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {agendamentos.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-400">Nenhum agendamento encontrado.</td></tr>
                            ) : (
                                agendamentos.map((agendamento) => (
                                    <tr key={agendamento.id} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{agendamento.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{agendamento.dataAgendamento}</td>
                                        <td className="px-6 py-4 whitespace-normal max-w-md truncate" title={agendamento.observacao}>{agendamento.observacao}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center gap-2">
                                                <Link href={`/agendamento/alterar/${agendamento.id}`}>
                                                    <button className="flex items-center gap-1 px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded">
                                                        <MdEdit />
                                                        Editar
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => router.push(`/agendamento/deletar/${agendamento.id}`)}
                                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                                                >
                                                    <MdDelete />
                                                    Deletar
                                                </button>
                                            </div>
                                        </td>
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
                        <button onClick={handlePreviousPage} disabled={currentPage === 0} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                            Anterior
                        </button>
                        <span className="text-slate-300">Página {currentPage + 1} de {totalPages}</span>
                        <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                            Próxima
                        </button>
                    </div>
                )}
            </main>
        </>
    );
}
