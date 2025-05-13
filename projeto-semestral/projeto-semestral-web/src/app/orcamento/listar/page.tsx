// src/app/orcamento/listar/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import NavBar from "@/components/nav-bar";
import {
    MdDescription,
    MdAdd,
    MdEdit,
    MdDelete,
    MdErrorOutline,
    MdCalendarToday,
    MdAttachMoney,
    MdListAlt,
    MdCancel,          // <<< novo import (ícone do botão “Cancelar”)
} from "react-icons/md";
import {
    FileText,
    Hash,
    CalendarDays,
    DollarSign,
    Edit3,
    Trash2,
    ListChecks,
    Loader2,
    AlertCircle,
} from "lucide-react";

// <<< novo import – função autenticada >>>
import { fetchAuthenticated } from "@/utils/apiService";

// -----------------------------------------------------------------------------
// DTO
// -----------------------------------------------------------------------------
interface OrcamentoListDto {
    id: number;
    dataOrcamento: string;
    valorMaoDeObra: number;
    valorHora: number;
    quantidadeHoras: number;
    valorTotal: number;
    // (adicione novos campos se o backend enviar)
}

// -----------------------------------------------------------------------------
// Componente
// -----------------------------------------------------------------------------
export default function ListarOrcamentosPage() {
    const [orcamentos, setOrcamentos] = useState<OrcamentoListDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal de deleção
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [orcamentoParaDeletar, setOrcamentoParaDeletar] =
        useState<OrcamentoListDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ---------------------------------------------------------------------------
    // Buscar lista de orçamentos
    // ---------------------------------------------------------------------------
    const fetchOrcamentos = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // >>> ALTERADO: fetchAuthenticated <<<
            const response = await fetchAuthenticated("/rest/orcamentos");

            if (!response.ok) {
                if (response.status === 204) {
                    setOrcamentos([]);
                    return;
                }
                const errorData = await response
                    .json()
                    .catch(() => ({ message: `Erro HTTP ${response.status}` }));
                throw new Error(errorData.message || "Erro ao buscar orçamentos");
            }

            const data: OrcamentoListDto[] = await response.json();
            data.sort((a, b) => b.id - a.id);
            setOrcamentos(data);
        } catch (err: any) {
            setError(err.message);
            setOrcamentos([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrcamentos();
    }, []);

    // ---------------------------------------------------------------------------
    // Deleção
    // ---------------------------------------------------------------------------
    const openDeleteModal = (orcamento: OrcamentoListDto) => {
        setOrcamentoParaDeletar(orcamento);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setOrcamentoParaDeletar(null);
        setShowDeleteModal(false);
        setError(null);
    };

    const confirmDelete = async () => {
        if (!orcamentoParaDeletar) return;
        setIsDeleting(true);
        setError(null);
        try {
            // >>> ALTERADO: fetchAuthenticated <<<
            const response = await fetchAuthenticated(
                `/rest/orcamentos/${orcamentoParaDeletar.id}`,
                { method: "DELETE" }
            );

            if (!response.ok && response.status !== 204) {
                const errorData = await response
                    .json()
                    .catch(() => ({ message: `Erro HTTP ${response.status}` }));
                throw new Error(errorData.message || "Falha ao excluir orçamento");
            }

            setOrcamentos((prev) =>
                prev.filter((o) => o.id !== orcamentoParaDeletar.id)
            );
            closeDeleteModal();
            // (um toast de sucesso seria interessante)
        } catch (err: any) {
            setError(`Falha ao excluir: ${err.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    // ---------------------------------------------------------------------------
    // Helpers de formatação
    // ---------------------------------------------------------------------------
    const formatCurrency = (value: number | null | undefined): string => {
        if (value === null || value === undefined) return "R$ 0,00";
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return "N/A";
        try {
            return new Date(
                dateString.includes("T") ? dateString : dateString + "T00:00:00Z"
            ).toLocaleDateString("pt-BR", { timeZone: "UTC" });
        } catch {
            return dateString;
        }
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
        <>
            <NavBar active="orcamento-listar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-center sm:text-left">
                        <ListChecks size={28} className="text-sky-400" />
                        Orçamentos Registrados
                    </h1>
                    <Link href="/orcamento/cadastrar">
                        <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow whitespace-nowrap">
                            <MdAdd size={20} /> Novo Orçamento (Completo)
                        </button>
                    </Link>
                </div>

                {/* Loading ----------------------------------------------------------- */}
                {isLoading && (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                        <span className="ml-3 text-sky-300">Carregando orçamentos...</span>
                    </div>
                )}

                {/* Erro -------------------------------------------------------------- */}
                {error && !showDeleteModal && (
                    <div className="text-center text-red-400 py-4 bg-red-900/30 border border-red-700 rounded-md p-3">
                        <p className="flex items-center justify-center gap-1">
                            <AlertCircle size={20} /> {error}
                        </p>
                        <button
                            onClick={fetchOrcamentos}
                            className="mt-2 px-3 py-1 bg-sky-700 hover:bg-sky-600 rounded text-xs"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                )}

                {/* Vazio ------------------------------------------------------------- */}
                {!isLoading && !error && orcamentos.length === 0 && (
                    <p className="text-center text-slate-400 py-10 bg-slate-800/50 rounded-lg shadow-xl">
                        Nenhum orçamento encontrado.
                    </p>
                )}

                {/* Lista ------------------------------------------------------------- */}
                {!isLoading && orcamentos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {orcamentos.map((orc) => (
                            <div
                                key={orc.id}
                                className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20 transition-shadow duration-300"
                            >
                                <div className="bg-slate-700 p-3 flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1 font-semibold text-sky-300">
                    <Hash size={16} /> ID Orçam.: {orc.id}
                  </span>
                                    <span className="flex items-center gap-1 text-slate-400">
                    <CalendarDays size={16} /> {formatDate(orc.dataOrcamento)}
                  </span>
                                </div>

                                <div className="p-4 space-y-3 flex-grow">
                                    <div>
                                        <h3 className="flex items-center text-2xl font-bold text-green-400 gap-1">
                                            {formatCurrency(orc.valorTotal)}
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Valor Total do Orçamento
                                        </p>
                                    </div>

                                    <div className="text-sm space-y-1 text-slate-300 pt-2 border-t border-slate-700/50">
                                        <p>
                      <span className="font-medium text-slate-400">
                        Mão de Obra (Taxa):
                      </span>{" "}
                                            {formatCurrency(orc.valorMaoDeObra)}
                                        </p>
                                        <p>
                      <span className="font-medium text-slate-400">
                        Valor/Hora:
                      </span>{" "}
                                            {formatCurrency(orc.valorHora)}
                                        </p>
                                        <p>
                      <span className="font-medium text-slate-400">
                        Qtd. Horas:
                      </span>{" "}
                                            {orc.quantidadeHoras}h
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-900 p-3 mt-auto border-t border-slate-700 flex justify-end gap-2">
                                    <Link href={`/orcamento/alterar/${orc.id}`}>
                                        <button
                                            className="inline-flex items-center px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-xs font-medium gap-1 shadow-sm"
                                            title="Alterar/Ver Detalhes"
                                        >
                                            <Edit3 size={14} /> Detalhes/Alterar
                                        </button>
                                    </Link>

                                    <button
                                        onClick={() => openDeleteModal(orc)}
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
            </main>

            {/* --------------------------------------------------------------------
           Modal de Confirmação de Deleção
         ------------------------------------------------------------------ */}
            {showDeleteModal && orcamentoParaDeletar && (
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
                            Tem certeza que deseja excluir o orçamento ID{" "}
                            <span className="font-bold">{orcamentoParaDeletar.id}</span>?
                        </p>

                        <div className="text-slate-300 text-sm mb-6 border-l-2 border-red-500 pl-3 bg-slate-700/30 p-3 rounded">
                            <p>
                                <strong>Data:</strong>{" "}
                                {formatDate(orcamentoParaDeletar.dataOrcamento)}
                            </p>
                            <p>
                                <strong>Valor Total:</strong>{" "}
                                {formatCurrency(orcamentoParaDeletar.valorTotal)}
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
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="animate-spin" /> Excluindo...
                                    </>
                                ) : (
                                    <>
                                        <MdDelete /> Sim, Excluir
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
