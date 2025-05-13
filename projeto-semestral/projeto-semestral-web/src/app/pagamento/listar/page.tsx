// src/app/pagamento/listar/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import NavBar from "@/components/nav-bar";
import {
    MdPayment,
    MdAdd,
    MdEdit,
    MdDelete,
    MdErrorOutline,
    MdFilterList,
    MdChevronLeft,
    MdChevronRight,
    MdAttachMoney,
    MdCalendarToday,
    MdCreditCard,
    MdListAlt,
    MdPercent,
    MdCancel,
    MdArrowBack, // usado no modal de erro
} from "react-icons/md";
import {
    Hash,
    Edit3,
    Trash2,
    CalendarDays,
    CreditCard,
    Tag,
    ListOrdered,
    Info,
    Delete,
} from "lucide-react";

// <<< NOVO IMPORT – função autenticada >>>
import { fetchAuthenticated } from "@/utils/apiService";

// -----------------------------------------------------------------------------
// Tipos
// -----------------------------------------------------------------------------
interface Pagamento {
    id: number;
    dataPagamento: string;
    tipoPagamento: string;
    desconto: number;
    totalParcelas: string;
    valorParcelas: number;
    totalComDesconto: number;
    clienteId?: number | null;
    orcamentoId?: number | null;
}

interface PaginatedPagamentosResponse {
    content: Pagamento[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

// -----------------------------------------------------------------------------
// Componente
// -----------------------------------------------------------------------------
export default function ListarPagamentosPage() {
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroDataInicio, setFiltroDataInicio] = useState("");
    const [filtroDataFim, setFiltroDataFim] = useState("");

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(12);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pagamentoParaDeletar, setPagamentoParaDeletar] =
        useState<Pagamento | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------
    const formatCurrency = (value: number | null | undefined): string =>
        value?.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        }) || "R$ 0,00";

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString + "T00:00:00Z").toLocaleDateString("pt-BR", {
                timeZone: "UTC",
            });
        } catch {
            return dateString;
        }
    };

    // ---------------------------------------------------------------------------
    // Carrega lista
    // ---------------------------------------------------------------------------
    const fetchPagamentos = async (page = currentPage) => {
        setIsLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                size: pageSize.toString(),
                sort: "id,asc",
            });
            if (filtroTipo) queryParams.append("tipoPagamento", filtroTipo);
            if (filtroDataInicio) queryParams.append("dataInicio", filtroDataInicio);
            if (filtroDataFim) queryParams.append("dataFim", filtroDataFim);

            // >>> ALTERADO: fetchAuthenticated <<<
            const response = await fetchAuthenticated(
                `/rest/pagamentos?${queryParams.toString()}`
            );

            if (!response.ok) {
                if (response.status === 204) {
                    setPagamentos([]);
                    setTotalPages(0);
                    setCurrentPage(0);
                    return;
                }
                const errorData = await response
                    .json()
                    .catch(() => ({ message: `Erro HTTP ${response.status}` }));
                throw new Error(errorData.message || "Erro ao buscar pagamentos");
            }

            const data: PaginatedPagamentosResponse = await response.json();
            setPagamentos(data.content || []);
            setTotalPages(data.totalPages || 0);
            setCurrentPage(data.number || 0);
        } catch (err: any) {
            setError(err.message);
            setPagamentos([]);
            setTotalPages(0);
            setCurrentPage(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPagamentos(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPagamentos(0);
    };

    // ---------------------------------------------------------------------------
    // Deleção
    // ---------------------------------------------------------------------------
    const openDeleteModal = (pagamento: Pagamento) => {
        setPagamentoParaDeletar(pagamento);
        setShowDeleteModal(true);
        setError(null);
    };

    const closeDeleteModal = () => {
        setPagamentoParaDeletar(null);
        setShowDeleteModal(false);
    };

    const confirmDelete = async () => {
        if (!pagamentoParaDeletar) return;
        setIsDeleting(true);
        setError(null);

        try {
            // >>> ALTERADO: fetchAuthenticated <<<
            const response = await fetchAuthenticated(
                `/rest/pagamentos/${pagamentoParaDeletar.id}`,
                { method: "DELETE" }
            );

            if (!response.ok && response.status !== 204) {
                const errorData = await response
                    .json()
                    .catch(() => ({ message: `Erro HTTP ${response.status}` }));
                throw new Error(errorData.message || "Falha ao excluir registro");
            }

            fetchPagamentos(currentPage);
            closeDeleteModal();
        } catch (err: any) {
            setError(`Falha ao excluir: ${err.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
        <>
            <NavBar active="pagamento-listar" />

            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-center sm:text-left">
                        <MdPayment className="text-3xl text-sky-400" />
                        Registros de Pagamento
                    </h1>
                    <Link href="/pagamento/cadastrar">
                        <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow whitespace-nowrap">
                            <MdAdd size={20} /> Novo Registro
                        </button>
                    </Link>
                </div>

                {/* Filtro */}
                <form
                    onSubmit={handleFilterSubmit}
                    className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md flex flex-wrap gap-4 items-end"
                >
                    <div>
                        <label
                            htmlFor="filtroDataInicio"
                            className="text-sm text-slate-300 block mb-1"
                        >
                            De:
                        </label>
                        <input
                            type="date"
                            id="filtroDataInicio"
                            value={filtroDataInicio}
                            onChange={(e) => setFiltroDataInicio(e.target.value)}
                            className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white date-input-fix"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="filtroDataFim"
                            className="text-sm text-slate-300 block mb-1"
                        >
                            Até:
                        </label>
                        <input
                            type="date"
                            id="filtroDataFim"
                            value={filtroDataFim}
                            onChange={(e) => setFiltroDataFim(e.target.value)}
                            className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white date-input-fix"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="filtroTipo"
                            className="text-sm text-slate-300 block mb-1"
                        >
                            Tipo Pag.:
                        </label>
                        <select
                            id="filtroTipo"
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                            className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white min-w-[150px]"
                        >
                            <option value="">Todos</option>
                            <option value="dinheiro">Dinheiro</option>
                            <option value="pix">PIX</option>
                            <option value="debito">Débito</option>
                            <option value="credito a vista">Crédito à Vista</option>
                            <option value="credito parcelado">Crédito Parcelado</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="p-2 h-10 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md flex items-center gap-2 px-4"
                    >
                        <MdFilterList size={20} /> Filtrar
                    </button>
                </form>

                {/* Mensagens */}
                {isLoading && (
                    <p className="text-center text-sky-300 py-10">
                        Carregando registros...
                    </p>
                )}

                {error && !showDeleteModal && (
                    <div className="text-center text-red-400 py-4 bg-red-900/30 border border-red-700 rounded-md">
                        <p className="flex items-center justify-center gap-2">
                            <MdErrorOutline size={22} /> Erro ao carregar: {error}
                        </p>
                        <button
                            onClick={() => fetchPagamentos(0)}
                            className="mt-2 px-3 py-1 bg-sky-600 hover:bg-sky-700 rounded text-white"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                )}

                {!isLoading && !error && pagamentos.length === 0 && (
                    <p className="text-center text-slate-400 py-10 bg-slate-900 rounded-lg shadow-xl">
                        Nenhum registro de pagamento encontrado.
                    </p>
                )}

                {/* Cards */}
                {!isLoading && pagamentos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {pagamentos.map((pag) => (
                            <div
                                key={pag.id}
                                className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20 transition-shadow duration-300"
                            >
                                <div className="bg-slate-700 p-3 flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1 font-semibold text-sky-300">
                    <Hash size={16} /> ID: {pag.id}
                  </span>
                                    <span className="flex items-center gap-1 text-slate-400">
                    <CalendarDays size={16} />{" "}
                                        {formatDate(pag.dataPagamento)}
                  </span>
                                </div>

                                <div className="p-4 space-y-3 flex-grow">
                                    <div>
                                        <h3 className="flex items-center text-lg font-semibold mb-1 text-sky-200 gap-1">
                                            <MdAttachMoney
                                                size={22}
                                                className="text-green-400"
                                            />{" "}
                                            {formatCurrency(pag.totalComDesconto)}
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Total com Desconto
                                        </p>
                                    </div>

                                    <div className="text-sm space-y-1 text-slate-300">
                                        <p className="flex items-center gap-1.5">
                                            <CreditCard
                                                size={15}
                                                className="text-slate-500"
                                            />{" "}
                                            Tipo: <span className="font-medium">{pag.tipoPagamento}</span>
                                        </p>
                                        <p className="flex items-center gap-1.5">
                                            <ListOrdered
                                                size={15}
                                                className="text-slate-500"
                                            />{" "}
                                            Parcelas:{" "}
                                            <span className="font-medium">
                        {pag.totalParcelas}x de{" "}
                                                {formatCurrency(pag.valorParcelas)}
                      </span>
                                        </p>
                                        <p className="flex items-center gap-1.5">
                                            <Tag size={15} className="text-slate-500" /> Desconto:{" "}
                                            <span className="font-medium">
                        {pag.desconto?.toFixed(1)}%
                      </span>
                                        </p>
                                        {pag.clienteId && (
                                            <p className="flex items-center gap-1.5">
                                                <Info size={15} className="text-slate-500" /> Cliente
                                                ID:{" "}
                                                <span className="font-medium">{pag.clienteId}</span>
                                            </p>
                                        )}
                                        {pag.orcamentoId && (
                                            <p className="flex items-center gap-1.5">
                                                <Info size={15} className="text-slate-500" /> Orçamento
                                                ID:{" "}
                                                <span className="font-medium">{pag.orcamentoId}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-900 p-3 mt-auto border-t border-slate-700 flex justify-end gap-2">
                                    <Link href={`/pagamento/alterar/${pag.id}`}>
                                        <button
                                            className="inline-flex items-center px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-xs font-medium gap-1 shadow-sm"
                                            title="Alterar"
                                        >
                                            <Edit3 size={14} /> Editar
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => openDeleteModal(pag)}
                                        className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium gap-1 shadow-sm"
                                        title="Deletar"
                                    >
                                        <Trash2 size={14} /> Deletar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginação */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 gap-3">
                        <button
                            onClick={() => fetchPagamentos(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            <MdChevronLeft size={20} /> Anterior
                        </button>
                        <span className="text-slate-300 text-sm">
              Página {currentPage + 1} de {totalPages}
            </span>
                        <button
                            onClick={() => fetchPagamentos(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            Próxima <MdChevronRight size={20} />
                        </button>
                    </div>
                )}
            </main>

            {/* Modal de exclusão */}
            {showDeleteModal && pagamentoParaDeletar && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4"
                    onClick={closeDeleteModal}
                >
                    <div
                        className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full z-50 border border-red-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                            <Trash2 size={22} className="text-red-400" /> Confirmar Exclusão
                        </h3>
                        <p className="text-white mb-3">
                            Tem certeza que deseja excluir este registro de pagamento?
                        </p>

                        <div className="text-slate-300 text-sm mb-6 border-l-2 border-red-500 pl-3 bg-slate-700/30 p-3 rounded">
                            <p>
                                <strong>ID:</strong> {pagamentoParaDeletar.id}
                            </p>
                            <p>
                                <strong>Data:</strong>{" "}
                                {formatDate(pagamentoParaDeletar.dataPagamento)}
                            </p>
                            <p>
                                <strong>Tipo:</strong> {pagamentoParaDeletar.tipoPagamento}
                            </p>
                            <p>
                                <strong>Valor Total:</strong>{" "}
                                {formatCurrency(pagamentoParaDeletar.totalComDesconto)}
                            </p>
                        </div>

                        {error && isDeleting && (
                            <p className="text-red-400 text-sm mb-3 text-center bg-red-900/50 p-2 rounded">
                                {error}
                            </p>
                        )}

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md"
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                            >
                                <MdCancel /> Cancelar
                            </button>

                            <button
                                type="button"
                                className={`flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md ${
                                    isDeleting ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Excluindo..." : <><Delete /> Sim, Excluir</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ajuste global date input */}
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator {
                    filter: invert(0.8);
                    cursor: pointer;
                }
                input[type="date"]:required:invalid::-webkit-datetime-edit {
                    color: transparent;
                }
                input[type="date"]:focus::-webkit-datetime-edit {
                    color: white !important;
                }
                input[type="date"]::-webkit-datetime-edit {
                    color: white;
                }
            `}</style>
        </>
    );
}
