// src/app/pagamento/buscar/page.tsx
"use client";

import React, { useState, FormEvent, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Para redirecionamento em caso de AuthError
import NavBar from "@/components/nav-bar";
import {
    MdSearch, MdFilterList, MdEdit, MdDelete, MdErrorOutline,
    MdCalendarToday, MdCreditCard, MdListAlt, MdAttachMoney, MdArrowBack
} from "react-icons/md";
import {
    Search as SearchIcon, Loader2, AlertCircle, Hash, CalendarDays,
    DollarSign, Edit3, Trash2, ChevronLeft, ChevronRight
} from "lucide-react";
import { fetchAuthenticated, AuthError } from "@/utils/apiService";

// Interface para o DTO de resposta da lista de pagamentos do backend
interface PagamentoListDto {
    id: number;
    dataPagamento: string;
    tipoPagamento: string;
    desconto: number;        // Assumindo que 'desconto' é o percentual
    totalParcelas: string;   // Como string, conforme entidade
    valorParcelas: number;
    totalComDesconto: number;
    clienteId?: number | null;
    orcamentoId?: number | null;
}

// Interface para a resposta paginada da API
interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // current page number (0-indexed)
    size: number;
}

export default function BuscarPagamentosPage() {
    const router = useRouter();
    const [resultadosBusca, setResultadosBusca] = useState<PagamentoListDto[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [buscaRealizada, setBuscaRealizada] = useState(false);

    // Estados dos filtros
    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');
    const [filtroTipoPagamento, setFiltroTipoPagamento] = useState('');
    const [filtroClienteId, setFiltroClienteId] = useState('');
    const [filtroOrcamentoId, setFiltroOrcamentoId] = useState('');
    const [filtroValorMin, setFiltroValorMin] = useState('');
    const [filtroValorMax, setFiltroValorMax] = useState('');

    // Estados da Paginação
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(9); // Ajuste conforme necessário

    const formatCurrency = (value?: number | null): string => {
        if (value == null) return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateString?: string | null): string => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z')
                .toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch { return "Data Inválida"; }
    };

    const handleSearch = useCallback(async (page = 0) => {
        setIsSearching(true);
        setBuscaRealizada(true);
        setError(null);
        if (page === 0) { // Nova busca, reseta resultados e página
            setResultadosBusca([]);
            setCurrentPage(0);
        } else { // Paginação
            setCurrentPage(page);
        }

        console.log("Buscando pagamentos com filtros:", {
            dataInicio: filtroDataInicio, dataFim: filtroDataFim, tipoPagamento: filtroTipoPagamento,
            clienteId: filtroClienteId, orcamentoId: filtroOrcamentoId,
            valorMin: filtroValorMin, valorMax: filtroValorMax, page
        });

        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                size: pageSize.toString(),
                sort: 'id,desc' // Ordena por ID decrescente (mais recentes primeiro)
            });
            if (filtroDataInicio) queryParams.append('dataInicio', filtroDataInicio);
            if (filtroDataFim) queryParams.append('dataFim', filtroDataFim);
            if (filtroTipoPagamento) queryParams.append('tipoPagamento', filtroTipoPagamento);
            if (filtroClienteId) queryParams.append('clienteId', filtroClienteId);
            if (filtroOrcamentoId) queryParams.append('orcamentoId', filtroOrcamentoId);
            if (filtroValorMin) queryParams.append('valorMin', filtroValorMin.replace(',', '.'));
            if (filtroValorMax) queryParams.append('valorMax', filtroValorMax.replace(',', '.'));

            const response = await fetchAuthenticated(
                `/rest/pagamentos?${queryParams.toString()}`
            );

            if (!response.ok) {
                if (response.status === 204) {
                    setResultadosBusca([]);
                    setTotalPages(0);
                    // Não é um erro, apenas nenhum resultado
                    return;
                }
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}` }));
                throw new Error(errorData.message || 'Falha ao buscar pagamentos');
            }

            const data: PaginatedResponse<PagamentoListDto> = await response.json();
            setResultadosBusca(data.content || []);
            setTotalPages(data.totalPages || 0);
            // setCurrentPage já foi setado no início da função

        } catch (err: any) {
            console.error("Erro na busca de pagamentos:", err);
            if (err instanceof AuthError) {
                setError("Sua sessão expirou ou é inválida. Por favor, faça login novamente.");
                router.replace('/login');
            } else {
                setError(err.message || 'Erro ao buscar pagamentos.');
            }
            setResultadosBusca([]);
            setTotalPages(0);
        } finally {
            setIsSearching(false);
        }
    }, [
        filtroDataInicio, filtroDataFim, filtroTipoPagamento, filtroClienteId,
        filtroOrcamentoId, filtroValorMin, filtroValorMax, pageSize, router
    ]);

    // Busca inicial ao montar (opcional, pode remover se não quiser carregar nada inicialmente)
    useEffect(() => {
        handleSearch(0);
    }, [handleSearch]);


    const handleSubmitForm = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleSearch(0); // Inicia a busca da primeira página
    };


    const handleDelete = async (id: number) => {
        if (!window.confirm(`Tem certeza que deseja excluir o pagamento ID ${id}?`)) return;
        setError(null);
        try {
            const response = await fetchAuthenticated(`/rest/pagamentos/${id}`, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) {
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status} ao excluir.` }));
                throw new Error(errorData.message || 'Falha ao excluir pagamento');
            }
            alert('Pagamento excluído com sucesso!');
            // Refaz a busca na página atual para atualizar a lista
            handleSearch(currentPage);
        } catch (err: any) {
            console.error("Erro ao excluir pagamento:", err);
            if (err instanceof AuthError) {
                setError("Sua sessão expirou ou é inválida. Por favor, faça login novamente para realizar esta ação.");
                router.replace('/login');
            } else {
                setError(err.message || 'Erro ao excluir pagamento.');
            }
        }
    };

    return (
        <>
            <NavBar active="pagamento-buscar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="flex items-center justify-center gap-2 text-3xl font-bold mb-6 text-center">
                    <SearchIcon size={30} className="text-sky-400" /> Buscar Registros de Pagamento
                </h1>

                <form
                    onSubmit={handleSubmitForm}
                    className="mb-8 p-6 bg-slate-800 rounded-lg shadow-lg max-w-4xl mx-auto"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-end">
                        <div>
                            <label htmlFor="filtroDataInicio" className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1">
                                <MdCalendarToday size={16} /> Data Início:
                            </label>
                            <input type="date" id="filtroDataInicio" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)}
                                   className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md date-input-fix" />
                        </div>
                        <div>
                            <label htmlFor="filtroDataFim" className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1">
                                <MdCalendarToday size={16} /> Data Fim:
                            </label>
                            <input type="date" id="filtroDataFim" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)}
                                   className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md date-input-fix" />
                        </div>
                        <div>
                            <label htmlFor="filtroTipoPagamento" className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1">
                                <MdCreditCard size={16} /> Tipo Pagamento:
                            </label>
                            <select id="filtroTipoPagamento" value={filtroTipoPagamento} onChange={e => setFiltroTipoPagamento(e.target.value)}
                                    className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md">
                                <option value="">Todos</option>
                                <option value="dinheiro">Dinheiro</option>
                                <option value="pix">PIX</option>
                                <option value="debito">Débito</option>
                                <option value="credito a vista">Crédito à Vista</option>
                                <option value="credito parcelado">Crédito Parcelado</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filtroValorMin" className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1">
                                <MdAttachMoney size={16} /> Valor Mín.:
                            </label>
                            <input type="text" id="filtroValorMin" value={filtroValorMin} onChange={e => setFiltroValorMin(e.target.value)}
                                   placeholder="Ex: 50,00" className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="filtroValorMax" className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1">
                                <MdAttachMoney size={16} /> Valor Máx.:
                            </label>
                            <input type="text" id="filtroValorMax" value={filtroValorMax} onChange={e => setFiltroValorMax(e.target.value)}
                                   placeholder="Ex: 500,00" className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="filtroClienteId" className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1">
                                ID Cliente:
                            </label>
                            <input type="number" id="filtroClienteId" value={filtroClienteId} onChange={e => setFiltroClienteId(e.target.value)}
                                   placeholder="ID numérico" className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="filtroOrcamentoId" className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1">
                                ID Orçamento:
                            </label>
                            <input type="number" id="filtroOrcamentoId" value={filtroOrcamentoId} onChange={e => setFiltroOrcamentoId(e.target.value)}
                                   placeholder="ID numérico" className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md" />
                        </div>

                        <div className="md:col-span-1 lg:col-span-3 flex justify-end pt-4">
                            <button type="submit" disabled={isSearching}
                                    className={`h-10 px-6 py-2 font-semibold rounded-md shadow flex items-center justify-center gap-2 ${
                                        isSearching ? 'bg-sky-800 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'
                                    }`}>
                                <MdFilterList size={20} /> {isSearching ? 'Buscando...' : 'Aplicar Filtros'}
                            </button>
                        </div>
                    </div>
                </form>

                {isSearching && (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                        <span className="ml-3 text-sky-300">Buscando pagamentos...</span>
                    </div>
                )}
                {error && !isSearching && (
                    <div className="text-center text-red-400 py-4 bg-red-900/30 border border-red-700 rounded-md p-3 max-w-2xl mx-auto my-6">
                        <p className="flex items-center justify-center gap-1"><AlertCircle size={20} /> {error}</p>
                    </div>
                )}
                {buscaRealizada && !isSearching && !error && resultadosBusca.length === 0 && (
                    <p className="text-center text-slate-400 py-10 bg-slate-800/50 rounded-lg shadow-xl">
                        Nenhum pagamento encontrado para os critérios informados.
                    </p>
                )}

                {resultadosBusca.length > 0 && !isSearching && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
                            {resultadosBusca.map(pag => (
                                <div key={pag.id} className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20 transition-shadow">
                                    <div className="bg-slate-700 p-3 flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-1 font-semibold text-sky-300"><Hash size={16} /> ID: {pag.id}</span>
                                        <span className="flex items-center gap-1 text-slate-400"><CalendarDays size={16} /> {formatDate(pag.dataPagamento)}</span>
                                    </div>
                                    <div className="p-4 space-y-3 flex-grow">
                                        <div>
                                            <h3 className="flex items-center text-xl font-bold text-green-400 gap-1">
                                                {formatCurrency(pag.totalComDesconto)}
                                            </h3>
                                            <p className="text-xs text-slate-400">Valor Total Pago</p>
                                        </div>
                                        <div className="text-sm space-y-1 text-slate-300 pt-2 border-t border-slate-700/50">
                                            <p><MdCreditCard className="inline mr-1 text-slate-400"/> <strong>Tipo:</strong> {pag.tipoPagamento}</p>
                                            <p><MdListAlt className="inline mr-1 text-slate-400"/> <strong>Parcelas:</strong> {pag.totalParcelas}x de {formatCurrency(pag.valorParcelas)}</p>
                                            <p><MdAttachMoney className="inline mr-1 text-slate-400"/> <strong>Desconto Aplicado:</strong> {pag.desconto?.toFixed(1)}%</p>
                                            {pag.clienteId && <p><MdPerson className="inline mr-1 text-slate-400"/> <strong>Cliente ID:</strong> {pag.clienteId}</p>}
                                            {pag.orcamentoId && <p><FileText size={14} className="inline mr-1 text-slate-400"/> <strong>Orçamento ID:</strong> {pag.orcamentoId}</p>}
                                        </div>
                                    </div>
                                    <div className="bg-slate-900 p-3 mt-auto border-t border-slate-700 flex justify-end gap-2">
                                        <Link href={`/pagamento/alterar/${pag.id}`}>
                                            <button className="inline-flex items-center px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-xs font-medium gap-1 shadow-sm">
                                                <Edit3 size={14} /> Alterar
                                            </button>
                                        </Link>
                                        <button onClick={() => handleDelete(pag.id)}
                                                className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium gap-1 shadow-sm">
                                            <Trash2 size={14} /> Deletar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Controles de Paginação */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-8 gap-3">
                                <button onClick={() => handleSearch(undefined, currentPage - 1)} disabled={currentPage === 0}
                                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 flex items-center gap-1">
                                    <ChevronLeft size={18}/> Anterior
                                </button>
                                <span className="text-slate-300 text-sm">Página {currentPage + 1} de {totalPages}</span>
                                <button onClick={() => handleSearch(undefined, currentPage + 1)} disabled={currentPage >= totalPages - 1}
                                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 flex items-center gap-1">
                                    Próxima <ChevronRight size={18}/>
                                </button>
                            </div>
                        )}
                    </>
                )}

                <div className="mt-10 text-center">
                    <Link href="/pagamento/listar"> {/* Ou para a página principal de pagamento se /pagamento for o menu */}
                        <button className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md shadow flex items-center justify-center gap-2 mx-auto">
                            <MdArrowBack /> Voltar para Lista
                        </button>
                    </Link>
                </div>
                <style jsx global>{`.date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }`}</style>
            </main>
        </>
    );
}