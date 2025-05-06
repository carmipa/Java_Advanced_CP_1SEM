// src/app/pagamento/deletar/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdDeleteForever, MdCancel, MdErrorOutline, MdWarningAmber, MdPayment } from 'react-icons/md';

interface PagamentoInfo {
    id: number;
    dataPagamento: string;
    tipoPagamento: string;
    totalComDesconto: number;
    // Adicione mais campos se desejar mostrar na confirmação
}

export default function DeletarPagamentoPage() {
    const params = useParams();
    const router = useRouter();
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : null;

    const [pagamentoInfo, setPagamentoInfo] = useState<PagamentoInfo | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'N/A';
        try { return new Date(dateString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }); }
        catch (e) { return dateString; }
    };
    const formatCurrency = (value: number | null | undefined): string => {
        if (value === null || value === undefined) return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };


    useEffect(() => {
        if (id) {
            setIsLoadingInfo(true); setError(null);
            const fetchPagamentoData = async () => {
                try {
                    const apiUrl = `http://localhost:8080/rest/pagamentos/${id}`;
                    const response = await fetch(apiUrl);
                    if (response.status === 404) throw new Error("Registro de Pagamento não encontrado para confirmar exclusão.");
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: `Erro HTTP ${response.status}` }));
                        throw new Error(errorData.message || `Erro ao buscar dados`);
                    }
                    const data: PagamentoInfo = await response.json();
                    setPagamentoInfo(data);
                } catch (err: any) {
                    setError(err.message || "Falha ao carregar dados do registro para exclusão.");
                    setPagamentoInfo(null);
                } finally {
                    setIsLoadingInfo(false);
                }
            };
            fetchPagamentoData();
        } else {
            setError("ID do registro de pagamento inválido na URL.");
            setIsLoadingInfo(false);
        }
    }, [id]);

    const handleConfirmDelete = async () => {
        if (!id) { setError("Não é possível excluir: ID inválido."); return; }
        setIsDeleting(true); setError(null);
        try {
            const apiUrl = `http://localhost:8080/rest/pagamentos/${id}`;
            const response = await fetch(apiUrl, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) { // 204 No Content também é sucesso para DELETE
                const errorText = await response.text().catch(() => `Erro ${response.status}`);
                throw new Error(`Falha ao excluir registro: ${errorText || response.statusText}`);
            }
            console.log(`Registro de Pagamento ID ${id} excluído com sucesso.`);
            router.push('/pagamento/listar?deleted=true'); // Adiciona query param para possível mensagem de sucesso na lista
        } catch (err: any) {
            setError(err.message || "Falha ao excluir registro de pagamento.");
            setIsDeleting(false);
        }
    };

    const handleCancel = () => {
        router.push('/pagamento/listar');
    };

    if (isLoadingInfo) {
        return (
            <>
                <NavBar active="pagamento-deletar" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                    <p className="text-center text-sky-300 py-10 text-xl">Carregando dados para confirmação...</p>
                </main>
            </>
        );
    }

    if (error && !pagamentoInfo) { // Erro ao buscar o item, e nenhum item carregado
        return (
            <>
                <NavBar active="pagamento-deletar" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                    <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg mx-auto">
                        <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center text-red-400">
                            <MdErrorOutline className="text-3xl" /> Erro ao Carregar
                        </h2>
                        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500 mb-6">{error}</p>
                        <div className="text-center">
                            <button onClick={handleCancel} className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700">
                                <MdArrowBack size={20}/> Voltar para Lista
                            </button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (!pagamentoInfo && !isLoadingInfo) { // Nenhum erro, mas nenhum item encontrado (ex: ID inválido ou já deletado)
        return (
            <>
                <NavBar active="pagamento-deletar" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                    <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg mx-auto">
                        <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center text-yellow-400">
                            <MdWarningAmber className="text-3xl" /> Registro Não Encontrado
                        </h2>
                        <p className="text-center text-yellow-400 bg-yellow-900/50 p-3 rounded border border-yellow-500 mb-6">
                            O registro de pagamento ID {id} não foi encontrado ou pode já ter sido excluído.
                        </p>
                        <div className="text-center">
                            <button onClick={handleCancel} className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700">
                                <MdArrowBack size={20}/> Voltar para Lista
                            </button>
                        </div>
                    </div>
                </main>
            </>
        );
    }


    return (
        <>
            <NavBar active="pagamento-deletar" />
            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
                <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg border border-red-500">
                    <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-4 text-center text-red-400">
                        <MdDeleteForever className="text-3xl" /> Confirmar Exclusão de Pagamento
                    </h2>
                    <p className="text-center mb-6 text-slate-300">Tem certeza que deseja excluir o seguinte registro de pagamento?</p>

                    {pagamentoInfo && (
                        <div className="text-slate-300 text-sm mb-8 border-l-2 border-red-500 pl-4 bg-slate-800 p-4 rounded">
                            <p><strong>ID do Registro:</strong> {pagamentoInfo.id}</p>
                            <p><strong>Data:</strong> {formatDate(pagamentoInfo.dataPagamento)}</p>
                            <p><strong>Tipo:</strong> {pagamentoInfo.tipoPagamento}</p>
                            <p><strong>Valor Total:</strong> {formatCurrency(pagamentoInfo.totalComDesconto)}</p>
                        </div>
                    )}

                    {error && ( // Erro durante a tentativa de exclusão
                        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500 mb-4">{error}</p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                        <button
                            onClick={handleConfirmDelete}
                            className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-red-600 rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Excluindo...' : (<><MdDeleteForever size={20}/> Sim, Excluir</>)}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                            disabled={isDeleting}
                        >
                            <MdCancel size={20}/> Não, Cancelar
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}