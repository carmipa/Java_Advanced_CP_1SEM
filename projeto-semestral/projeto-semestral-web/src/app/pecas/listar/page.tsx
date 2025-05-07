// src/app/pecas/listar/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import {
    Package, List, CirclePlus, Search, Edit3, Trash2, Car, Building, Tag, Calendar, DollarSign, Percent, Calculator, Hash,
    Loader2, AlertCircle, XCircle
} from 'lucide-react';
import { MdErrorOutline, MdCheckCircle, MdCancel, MdDelete } from 'react-icons/md';

// Interface para os dados da peça como vêm da API
interface PecaResponseDto {
    id: number;
    tipoVeiculo: string;
    fabricante: string;
    descricao: string; // Corresponde a DESCRICA_PECA
    dataCompra: string;
    preco: number;
    desconto: number;
    totalDesconto: number;
}

// Interface para os dados formatados para exibição
interface PecaParaLista {
    id: number;
    tipoVeiculo: string;
    fabricante: string;
    descricaoPeca: string;
    dataCompraFormatada: string;
    precoFormatado: string;
    descontoFormatado: string;
    totalComDescontoFormatado: string;
}

export default function ListarPecasPage() {
    const [pecas, setPecas] = useState<PecaParaLista[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Estados para o modal de deleção
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pecaParaDeletar, setPecaParaDeletar] = useState<PecaParaLista | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Funções de formatação
    const formatCurrency = (value: number): string => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (dateString: string): string => {
        try {
            // Adiciona 'T00:00:00Z' para garantir que seja interpretado como UTC
            return new Date(dateString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch (e) {
            console.error("Erro ao formatar data:", dateString, e);
            return "Inválida";
        }
    };

    // Função para buscar peças
    const fetchPecas = async () => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null); // Limpa mensagem de sucesso anterior
        try {
            const response = await fetch('http://localhost:8080/rest/pecas/all');
            if (!response.ok) {
                if (response.status === 204) { // No Content
                    setPecas([]);
                    return;
                }
                throw new Error(`Erro HTTP ${response.status}: Falha ao buscar peças.`);
            }
            const data: PecaResponseDto[] = await response.json();

            // Ordena por ID ascendente (ou como preferir)
            data.sort((a, b) => a.id - b.id);

            const pecasFormatadas: PecaParaLista[] = data.map(dto => ({
                id: dto.id,
                tipoVeiculo: dto.tipoVeiculo || '-',
                fabricante: dto.fabricante || '-',
                descricaoPeca: dto.descricao || '-', // Mapeia de 'descricao' do DTO
                dataCompraFormatada: dto.dataCompra ? formatDate(dto.dataCompra) : '-',
                precoFormatado: formatCurrency(dto.preco),
                descontoFormatado: formatCurrency(dto.desconto),
                totalComDescontoFormatado: formatCurrency(dto.totalDesconto),
            }));
            setPecas(pecasFormatadas);

        } catch (err: any) {
            setError(err.message || "Erro desconhecido ao carregar peças.");
            setPecas([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPecas();
    }, []);

    // Funções do modal de deleção
    const openDeleteModal = (peca: PecaParaLista) => {
        setPecaParaDeletar(peca);
        setShowDeleteModal(true);
        setError(null); // Limpa erro anterior ao abrir modal
    };

    const closeDeleteModal = () => {
        setPecaParaDeletar(null);
        setShowDeleteModal(false);
    };

    const confirmDelete = async () => {
        if (!pecaParaDeletar) return;
        setIsDeleting(true);
        setError(null); // Limpa erro antes de tentar deletar

        try {
            const response = await fetch(`http://localhost:8080/rest/pecas/${pecaParaDeletar.id}`, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) { // 204 também é sucesso
                const errorData = await response.json().catch(() => ({ message: `Erro HTTP ${response.status}` }));
                throw new Error(errorData.message || `Falha ao excluir peça`);
            }
            setSuccessMessage(`Peça "${pecaParaDeletar.descricaoPeca}" (ID: ${pecaParaDeletar.id}) excluída com sucesso!`);
            setPecas(prev => prev.filter(p => p.id !== pecaParaDeletar.id)); // Remove da lista local
            closeDeleteModal();
            setTimeout(() => setSuccessMessage(null), 5000); // Limpa msg de sucesso

        } catch (err: any) {
            setError(`Falha ao excluir: ${err.message}`);
            // Mantém modal aberto para exibir o erro
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {/* Use a chave correta para 'active' na NavBar */}
            <NavBar active="pecas-listar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-center sm:text-left">
                        <Package size={28} className="text-sky-400" /> Lista de Peças Cadastradas
                    </h1>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <Link href="/pecas/cadastrar">
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow whitespace-nowrap">
                                <CirclePlus size={18} /> Nova Peça
                            </button>
                        </Link>
                        <Link href="/pecas/buscar">
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow whitespace-nowrap">
                                <Search size={18} /> Buscar Peça
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Mensagens */}
                {isLoading && <div className='flex justify-center items-center py-10'><Loader2 className="h-8 w-8 animate-spin text-sky-400" /><span className='ml-3 text-sky-300'>Carregando peças...</span></div>}
                {error && !showDeleteModal && ( // Não mostra erro geral se o modal de erro estiver ativo
                    <div className="relative max-w-3xl mx-auto mb-6 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                        <MdErrorOutline className="inline mr-2" /> {error}
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"> <span className="text-xl">&times;</span> </button>
                    </div>
                )}
                {successMessage && (
                    <div className="flex items-center justify-center gap-2 text-green-400 p-3 mb-6 rounded bg-green-900/30 border border-green-700 text-sm max-w-3xl mx-auto">
                        <MdCheckCircle className="text-lg" /> <span>{successMessage}</span>
                    </div>
                )}

                {/* Grid de Cards */}
                {!isLoading && !error && pecas.length === 0 && (
                    <p className="text-center text-slate-400 py-10 bg-slate-800/50 rounded-lg shadow-xl">Nenhuma peça encontrada.</p>
                )}
                {!isLoading && pecas.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {pecas.map((peca) => (
                            <div key={peca.id} className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20 transition-shadow duration-300">
                                {/* Header Card */}
                                <div className="bg-slate-700 p-3 flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-1 font-semibold text-sky-300"> <Hash size={16} /> ID: {peca.id} </span>
                                    <span className="flex items-center gap-1 text-slate-400 uppercase text-xs font-medium tracking-wider"> <Car size={16} /> {peca.tipoVeiculo} </span>
                                </div>
                                {/* Corpo Card */}
                                <div className="p-4 space-y-2 flex-grow text-sm">
                                    <p title={peca.descricaoPeca}><strong><Tag size={16} className="inline -mt-1 mr-1"/> Descrição:</strong> {peca.descricaoPeca}</p>
                                    <p><strong><Building size={16} className="inline -mt-1 mr-1"/> Fabricante/Marca:</strong> {peca.fabricante}</p>
                                    <p><strong><Calendar size={16} className="inline -mt-1 mr-1"/> Data Compra:</strong> {peca.dataCompraFormatada}</p>
                                    <div className="grid grid-cols-3 gap-x-2 pt-2 border-t border-slate-700/50 mt-2">
                                        <p className='text-center'><span className='block text-xs text-slate-400'>Preço</span> <span className='font-semibold'>{peca.precoFormatado}</span></p>
                                        <p className='text-center'><span className='block text-xs text-slate-400'>Desconto</span> <span className='font-semibold'>{peca.descontoFormatado}</span></p>
                                        <p className='text-center'><span className='block text-xs text-slate-400'>Preço Final</span> <strong className='text-green-400'>{peca.totalComDescontoFormatado}</strong></p>
                                    </div>
                                </div>
                                {/* Footer Card */}
                                <div className="bg-slate-900 p-3 mt-auto border-t border-slate-700 flex justify-end gap-2">
                                    <Link href={`/pecas/alterar/${peca.id}`}>
                                        <button className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-xs font-medium gap-1" title="Editar Peça">
                                            <Edit3 size={14} /> Editar
                                        </button>
                                    </Link>
                                    <button onClick={() => openDeleteModal(peca)} className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium gap-1" title="Deletar Peça">
                                        <Trash2 size={14} /> Deletar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal de Confirmação de Deleção */}
            {showDeleteModal && pecaParaDeletar && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={closeDeleteModal}>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full z-50 border border-red-500" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                            <Trash2 size={22} className="text-red-400" /> Confirmar Exclusão
                        </h3>
                        <p className="text-white mb-3">Tem certeza que deseja excluir a peça abaixo?</p>
                        <div className='text-slate-300 text-sm mb-6 border-l-2 border-red-500 pl-3 bg-slate-700/30 p-3 rounded'>
                            <p><strong>ID:</strong> {pecaParaDeletar.id}</p>
                            <p><strong>Descrição:</strong> {pecaParaDeletar.descricaoPeca}</p>
                            <p><strong>Fabricante:</strong> {pecaParaDeletar.fabricante}</p>
                            <p><strong>Preço Final:</strong> {pecaParaDeletar.totalComDescontoFormatado}</p>
                        </div>
                        {/* Exibe erro específico do modal aqui */}
                        {error && isDeleting && (
                            <p className="text-red-400 text-sm mb-3 text-center bg-red-900/50 p-2 rounded">{error}</p>
                        )}
                        <div className="flex justify-end gap-4">
                            <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md focus:outline-none" onClick={closeDeleteModal} disabled={isDeleting}>
                                <MdCancel /> Cancelar
                            </button>
                            <button type="button" className={`flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md focus:outline-none ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={confirmDelete} disabled={isDeleting}>
                                {isDeleting ? <><Loader2 className="animate-spin mr-2"/> Excluindo...</> : <><MdDelete /> Sim, Excluir</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}