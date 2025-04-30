"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';
import { MdSearch, MdEdit, MdDelete, MdErrorOutline, MdFindInPage } from 'react-icons/md'; // Ícones adicionados

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

type TipoBuscaAgendamento = 'id' | 'observacao' | 'dataInicio' | 'dataFim';

export default function BuscarAgendamentosPage() {
    const [resultadosBusca, setResultadosBusca] = useState<AgendamentoParaLista[]>([]);
    const [tipoBusca, setTipoBusca] = useState<TipoBuscaAgendamento>('observacao');
    const [termoBusca, setTermoBusca] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [buscaRealizada, setBuscaRealizada] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(10);

    const router = useRouter();

    const handleSearch = async (event?: FormEvent<HTMLFormElement>, page = 0) => {
        if (event) event.preventDefault();
        setIsSearching(true);
        setBuscaRealizada(true);
        setError(null);
        setResultadosBusca([]);

        const params = new URLSearchParams({
            page: page.toString(),
            size: pageSize.toString(),
        });

        if (termoBusca.trim()) {
            if (tipoBusca === 'dataInicio' || tipoBusca === 'dataFim') {
                if (/^\d{4}-\d{2}-\d{2}$/.test(termoBusca.trim())) {
                    params.append(tipoBusca, termoBusca.trim());
                } else {
                    setError("Formato de data inválido. Use AAAA-MM-DD.");
                    setIsSearching(false);
                    setBuscaRealizada(false);
                    return;
                }
            } else {
                params.append(tipoBusca, termoBusca.trim());
            }
        }

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
            setResultadosBusca(agendamentosFormatados);
            setTotalPages(data.totalPages);
            setCurrentPage(data.number);
        } catch (err: any) {
            setError(err.message || "Falha ao buscar agendamentos.");
            setResultadosBusca([]);
            setTotalPages(0);
        } finally {
            setIsSearching(false);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) handleSearch(undefined, currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) handleSearch(undefined, currentPage + 1);
    };

    const getPlaceholder = () => {
        switch (tipoBusca) {
            case 'id': return 'Digite o ID...';
            case 'dataInicio': return 'Data Início (AAAA-MM-DD)...';
            case 'dataFim': return 'Data Fim (AAAA-MM-DD)...';
            default: return 'Digite parte da observação...';
        }
    };

    return (
        <>
            <NavBar active="agendamento" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Título com ícone */}
                <h1 className="flex items-center justify-center gap-2 text-3xl font-bold mb-6">
                    <MdFindInPage className="text-4xl" /> Buscar Agendamentos
                </h1>

                {/* Formulário de Busca */}
                <form onSubmit={handleSearch} className="mb-8 p-6 bg-slate-800 rounded-lg shadow-lg flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-auto">
                        <label htmlFor="tipoBusca" className="block text-sm font-medium mb-1 text-slate-300">Buscar por:</label>
                        <select
                            id="tipoBusca"
                            name="tipoBusca"
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            value={tipoBusca}
                            onChange={(e) => { setTipoBusca(e.target.value as TipoBuscaAgendamento); setTermoBusca(''); setResultadosBusca([]); setBuscaRealizada(false); setError(null); }}
                        >
                            <option value="observacao">Observação</option>
                            <option value="id">ID</option>
                            <option value="dataInicio">Data Início</option>
                        </select>
                    </div>

                    <div className="flex-1 min-w-0">
                        <label htmlFor="termoBusca" className="block text-sm font-medium mb-1 text-slate-300">Termo de Busca:</label>
                        <input
                            type={tipoBusca === 'id' ? 'number' : tipoBusca.includes('data') ? 'date' : 'text'}
                            id="termoBusca"
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            placeholder={getPlaceholder()}
                            required={tipoBusca !== 'observacao'}
                        />
                    </div>

                    <button type="submit" className="flex items-center justify-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500 whitespace-nowrap" disabled={isSearching}>
                        <MdSearch />
                        {isSearching ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>

                {/* Mensagem de erro */}
                {error && (
                    <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                        <div className="flex items-center gap-2">
                            <MdErrorOutline className="text-2xl" />
                            <span>{error}</span>
                        </div>
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar">
                            <span className="text-2xl" aria-hidden="true">&times;</span>
                        </button>
                    </div>
                )}

                {/* Resultados */}
                {buscaRealizada && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow mt-6">
                        <h2 className="text-xl font-semibold p-4 bg-slate-800 rounded-t-lg">Resultados da Busca</h2>
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Observação</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {isSearching ? (
                                <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-400">Buscando...</td></tr>
                            ) : resultadosBusca.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-400">Nenhum agendamento encontrado.</td></tr>
                            ) : (
                                resultadosBusca.map(agendamento => (
                                    <tr key={agendamento.id} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4">{agendamento.id}</td>
                                        <td className="px-6 py-4">{agendamento.dataAgendamento}</td>
                                        <td className="px-6 py-4 truncate" title={agendamento.observacao}>{agendamento.observacao}</td>
                                        <td className="px-6 py-4 text-center space-x-2">
                                            <Link href={`/agendamento/alterar/${agendamento.id}`}>
                                                <button className="flex items-center justify-center gap-1 px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded">
                                                    <MdEdit /> Editar
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => router.push(`/agendamento/deletar/${agendamento.id}`)}
                                                className="flex items-center justify-center gap-1 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                                            >
                                                <MdDelete /> Deletar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Paginação */}
                {buscaRealizada && !isSearching && totalPages > 1 && (
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
