// src/app/pecas/deletar/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { Trash2, AlertCircle, Package, Tag, Building, DollarSign, Loader2, ArrowLeft, XCircle } from 'lucide-react';
import { MdErrorOutline, MdCancel, MdDelete } from 'react-icons/md';

// Interface para buscar os dados da peça
interface PecaResponseDto {
    id: number;
    tipoVeiculo: string;
    fabricante: string;
    descricao: string;
    preco: number;
    totalDesconto: number; // Mostrar preço final para confirmação
}

export default function DeletarPecaPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [pecaInfo, setPecaInfo] = useState<PecaResponseDto | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Formatação
    const formatCurrency = (value: number): string => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Busca dados da peça para confirmação
    useEffect(() => {
        if (!id) { setError("ID da peça não fornecido."); setIsFetching(false); return; }
        const fetchPeca = async () => {
            setIsFetching(true); setError(null);
            try {
                const response = await fetch(`http://localhost:8080/rest/pecas/${id}`);
                if (response.status === 404) throw new Error(`Peça com ID ${id} não encontrada.`);
                if (!response.ok) throw new Error(`Erro HTTP ${response.status}: Falha ao buscar dados da peça.`);
                const data: PecaResponseDto = await response.json();
                setPecaInfo(data);
            } catch (err: any) { setError(err.message || "Erro ao carregar dados da peça."); setPecaInfo(null);
            } finally { setIsFetching(false); }
        };
        fetchPeca();
    }, [id]);

    // Executa a deleção
    const handleDelete = async () => {
        if (!id) { setError("ID inválido."); return; }
        setIsDeleting(true); setError(null);
        try {
            const response = await fetch(`http://localhost:8080/rest/pecas/${id}`, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) {
                const errorData = await response.json().catch(() => ({ message: `Erro HTTP ${response.status}` }));
                throw new Error(errorData.message || `Falha ao excluir peça`);
            }
            // Idealmente, mostrar uma mensagem de sucesso antes de redirecionar
            router.push('/pecas/listar?deleted=true'); // Adiciona query param

        } catch (err: any) { setError(err.message || "Falha ao deletar peça.");
        } finally { setIsDeleting(false); }
    };

    // Renderização condicional
    if (isFetching) {
        return (
            <>
                <NavBar active="pecas" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
                        <p className="mt-3 text-sky-300 text-lg">Carregando dados da peça...</p>
                    </div>
                </main>
            </>
        );
    }

    if (error && !pecaInfo) { // Erro grave ao carregar
        return (
            <>
                <NavBar active="pecas" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl text-center w-full max-w-lg border border-red-500">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4"/>
                        <h2 className="text-xl font-semibold text-red-400 mb-3">Erro ao Carregar</h2>
                        <p className="text-slate-300 mb-6">{error}</p>
                        <Link href="/pecas/listar">
                            <button className="px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-md text-white font-semibold flex items-center justify-center gap-2 mx-auto">
                                <ArrowLeft size={18}/> Voltar para Lista
                            </button>
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    if (!pecaInfo && !isFetching) { // Peça não encontrada, mas sem erro de fetch
        return (
            <>
                <NavBar active="pecas" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl text-center w-full max-w-lg border border-yellow-500">
                        <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4"/>
                        <h2 className="text-xl font-semibold text-yellow-400 mb-3">Peça Não Encontrada</h2>
                        <p className="text-slate-300 mb-6">A peça com ID {id} não foi encontrada. Ela pode ter sido excluída.</p>
                        <Link href="/pecas/listar">
                            <button className="px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-md text-white font-semibold flex items-center justify-center gap-2 mx-auto">
                                <ArrowLeft size={18}/> Voltar para Lista
                            </button>
                        </Link>
                    </div>
                </main>
            </>
        );
    }


    return (
        <>
            <NavBar active="pecas-deletar" />
            <main className="container mx-auto px-4 py-10 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-lg border border-red-600">
                    <h1 className="flex items-center justify-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-center text-red-400">
                        <Trash2 size={28} className="text-red-400" /> Confirmar Exclusão de Peça
                    </h1>
                    <p className="text-center mb-6 text-slate-300">Tem certeza que deseja excluir a peça abaixo? Esta ação não pode ser desfeita.</p>

                    {pecaInfo && (
                        <div className="text-slate-300 text-sm mb-8 border-l-4 border-red-500 pl-4 bg-slate-800 p-4 rounded">
                            <p><strong><Hash size={14} className="inline -mt-1 mr-1"/> ID:</strong> {pecaInfo.id}</p>
                            <p><strong><Tag size={14} className="inline -mt-1 mr-1"/> Descrição:</strong> {pecaInfo.descricao}</p>
                            <p><strong><Building size={14} className="inline -mt-1 mr-1"/> Fabricante:</strong> {pecaInfo.fabricante}</p>
                            <p><strong><Car size={14} className="inline -mt-1 mr-1"/> Tipo Veíc.:</strong> {pecaInfo.tipoVeiculo}</p>
                            <p><strong><DollarSign size={14} className="inline -mt-1 mr-1"/> Preço Final:</strong> {formatCurrency(pecaInfo.totalDesconto)}</p>
                        </div>
                    )}

                    {/* Erro durante a deleção */}
                    {error && (
                        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500 mb-4 text-sm">{error}</p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                        <button
                            onClick={handleDelete}
                            className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 font-semibold text-white bg-red-600 rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isDeleting || isFetching}
                        >
                            {isDeleting ? <><Loader2 className="animate-spin mr-2"/> Excluindo...</> : <><MdDelete size={20}/> Sim, Excluir</>}
                        </button>
                        <Link href="/pecas/listar" className="w-full sm:w-auto">
                            <button type="button" className="flex items-center justify-center gap-2 w-full px-6 py-2.5 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 text-center" disabled={isDeleting}>
                                <MdCancel size={20}/> Não, Cancelar
                            </button>
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}