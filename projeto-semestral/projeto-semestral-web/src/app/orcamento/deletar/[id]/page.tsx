// src/app/orcamento/deletar/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdDeleteForever, MdCancel, MdErrorOutline, MdWarningAmber, MdDescription, MdArrowBack } from 'react-icons/md';
import { FileText, Trash2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { fetchAuthenticated } from '@/utils/apiService'; // <<< Import adicionado

// Interface para os dados básicos do orçamento a serem exibidos para confirmação
interface OrcamentoParaDeletar {
    id: number;
    dataOrcamento: string;
    valorTotal: number;
}

interface OrcamentoListDto { // Reutilizando da listagem para buscar os dados
    id: number;
    dataOrcamento: string;
    valorMaoDeObra: number;
    valorHora: number;
    quantidadeHoras: number;
    valorTotal: number;
}

export default function DeletarOrcamentoPage() {
    const params = useParams();
    const router = useRouter();
    const orcamentoId = params.id as string;

    const [orcamentoInfo, setOrcamentoInfo] = useState<OrcamentoParaDeletar | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'N/A';
        try {
            return new Date(
                dateString.includes('T') ? dateString : dateString + 'T00:00:00Z'
            ).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch {
            return dateString;
        }
    };
    const formatCurrency = (value: number | null | undefined): string => {
        if (value == null) return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    useEffect(() => {
        if (orcamentoId) {
            setIsLoadingInfo(true);
            setError(null);
            const fetchOrcamentoData = async () => {
                try {
                    // <<< chamada substituída
                    const response = await fetchAuthenticated(`/rest/orcamentos/${orcamentoId}`);
                    if (response.status === 404) {
                        throw new Error("Orçamento não encontrado para confirmar exclusão.");
                    }
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: `Erro HTTP ${response.status}` }));
                        throw new Error(errorData.message || `Erro ao buscar dados do orçamento`);
                    }
                    const data: OrcamentoListDto = await response.json();
                    setOrcamentoInfo({
                        id: data.id,
                        dataOrcamento: data.dataOrcamento,
                        valorTotal: data.valorTotal,
                    });
                } catch (err: any) {
                    setError(err.message || "Falha ao carregar dados do orçamento para exclusão.");
                    setOrcamentoInfo(null);
                } finally {
                    setIsLoadingInfo(false);
                }
            };
            fetchOrcamentoData();
        } else {
            setError("ID do orçamento inválido na URL.");
            setIsLoadingInfo(false);
        }
    }, [orcamentoId]);

    const handleConfirmDelete = async () => {
        if (!orcamentoId) {
            setError("Não é possível excluir: ID inválido.");
            return;
        }
        setIsDeleting(true);
        setError(null);
        try {
            // <<< chamada substituída
            const response = await fetchAuthenticated(`/rest/orcamentos/${orcamentoId}`, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) {
                const errorText = await response.text().catch(() => `Erro ${response.status}`);
                throw new Error(`Falha ao excluir orçamento: ${errorText || response.statusText}`);
            }
            router.push('/orcamento/listar?deleted=true');
        } catch (err: any) {
            setError(err.message || "Falha ao excluir orçamento.");
            setIsDeleting(false);
        }
    };

    const handleCancel = () => {
        router.push('/orcamento/listar');
    };

    if (isLoadingInfo) {
        return (
            <>
                <NavBar active="orcamento" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
                        <p className="mt-3 text-sky-300 text-lg">Carregando dados para confirmação...</p>
                    </div>
                </main>
            </>
        );
    }

    if (error && !orcamentoInfo) {
        return (
            <>
                <NavBar active="orcamento" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="bg-slate-800 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg mx-auto text-center">
                        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-red-400 mb-3">Erro ao Carregar</h2>
                        <p className="text-slate-300 mb-6">{error}</p>
                        <button
                            onClick={handleCancel}
                            className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 mx-auto"
                        >
                            <MdArrowBack size={20} /> Voltar para Lista
                        </button>
                    </div>
                </main>
            </>
        );
    }

    if (!orcamentoInfo && !isLoadingInfo) {
        return (
            <>
                <NavBar active="orcamento" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="bg-slate-800 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg mx-auto text-center">
                        <MdWarningAmber className="text-7xl text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-yellow-400 mb-3">Orçamento Não Encontrado</h2>
                        <p className="text-slate-300 mb-6">
                            O orçamento ID {orcamentoId} não foi encontrado ou já foi excluído.
                        </p>
                        <button
                            onClick={handleCancel}
                            className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 mx-auto"
                        >
                            <MdArrowBack size={20} /> Voltar para Lista
                        </button>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <NavBar active="orcamento" />
            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
                <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg border border-red-600">
                    <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-4 text-center text-red-400">
                        <Trash2 size={28} /> Confirmar Exclusão de Orçamento
                    </h2>
                    <p className="text-center mb-6 text-slate-300">
                        Tem certeza que deseja excluir o seguinte orçamento?
                    </p>

                    {orcamentoInfo && (
                        <div className="text-slate-300 text-sm mb-8 border-l-4 border-red-500 pl-4 bg-slate-800 p-4 rounded">
                            <p><strong>ID do Orçamento:</strong> {orcamentoInfo.id}</p>
                            <p><strong>Data:</strong> {formatDate(orcamentoInfo.dataOrcamento)}</p>
                            <p><strong>Valor Total:</strong> {formatCurrency(orcamentoInfo.valorTotal)}</p>
                        </div>
                    )}

                    {error && (
                        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500 mb-4">
                            {error}
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                        <button
                            onClick={handleConfirmDelete}
                            className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-red-600 rounded-md shadow hover:bg-red-700 transition-opacity duration-300 ${
                                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={isDeleting}
                        >
                            {isDeleting
                                ? <><Loader2 className="animate-spin mr-2" /> Excluindo...</>
                                : <><MdDeleteForever size={20} /> Sim, Excluir</>
                            }
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700"
                        >
                            <MdCancel size={20} /> Não, Cancelar
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}
