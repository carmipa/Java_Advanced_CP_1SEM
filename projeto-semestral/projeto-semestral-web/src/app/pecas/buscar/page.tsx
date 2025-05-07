// src/app/pecas/buscar/page.tsx
"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import {
    Search, Package, Car, Building, Tag, Calendar, DollarSign, Percent, Calculator, Hash, Edit3, Trash2,
    Loader2, AlertCircle, Filter, ListX, ArrowLeft
} from 'lucide-react';
import { MdErrorOutline } from 'react-icons/md';

// Interfaces (iguais à listagem)
interface PecaResponseDto { id: number; tipoVeiculo: string; fabricante: string; descricao: string; dataCompra: string; preco: number; desconto: number; totalDesconto: number; }
interface PecaParaLista { id: number; tipoVeiculo: string; fabricante: string; descricaoPeca: string; dataCompraFormatada: string; precoFormatado: string; descontoFormatado: string; totalComDescontoFormatado: string; }

// Tipos de busca
type TipoBuscaPeca = 'descricaoPeca' | 'fabricante' | 'tipoVeiculo';

export default function BuscarPecasPage() {
    const [todasPecas, setTodasPecas] = useState<PecaParaLista[]>([]);
    const [resultadosBusca, setResultadosBusca] = useState<PecaParaLista[]>([]);
    const [tipoBusca, setTipoBusca] = useState<TipoBuscaPeca>('descricaoPeca');
    const [termoBusca, setTermoBusca] = useState('');
    const [isLoadingAll, setIsLoadingAll] = useState(false); // Loading inicial de todos
    const [isSearching, setIsSearching] = useState(false); // Loading do filtro/busca
    const [error, setError] = useState<string | null>(null);
    const [buscaRealizada, setBuscaRealizada] = useState(false);

    // Funções de formatação (iguais à listagem)
    const formatCurrency = (value: number): string => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (dateString: string): string => { try { return new Date(dateString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }); } catch { return "Inválida"; }};

    // Busca inicial de todas as peças para filtro client-side
    const fetchTodasPecas = async () => {
        if (todasPecas.length > 0 && !isLoadingAll) return;
        setIsLoadingAll(true); setError(null);
        try {
            const response = await fetch('http://localhost:8080/rest/pecas/all');
            if (!response.ok) throw new Error(`Erro HTTP ${response.status}: Falha ao buscar base de peças.`);
            if (response.status === 204) { setTodasPecas([]); return; }

            const data: PecaResponseDto[] = await response.json();
            data.sort((a, b) => a.id - b.id); // Ordena por ID
            const formatadas = data.map(dto => ({
                id: dto.id, tipoVeiculo: dto.tipoVeiculo || '-', fabricante: dto.fabricante || '-',
                descricaoPeca: dto.descricao || '-', dataCompraFormatada: dto.dataCompra ? formatDate(dto.dataCompra) : '-',
                precoFormatado: formatCurrency(dto.preco), descontoFormatado: formatCurrency(dto.desconto),
                totalComDescontoFormatado: formatCurrency(dto.totalDesconto),
            }));
            setTodasPecas(formatadas);
            console.log(`Carregadas ${formatadas.length} peças para busca local.`);
        } catch (err: any) { setError(err.message); setTodasPecas([]);
        } finally { setIsLoadingAll(false); }
    };

    useEffect(() => { fetchTodasPecas(); }, []); // Roda só na montagem

    // Placeholder dinâmico
    const getPlaceholder = (): string => {
        switch (tipoBusca) {
            case 'descricaoPeca': return 'Digite parte da descrição...';
            case 'fabricante': return 'Digite parte do fabricante/marca...';
            case 'tipoVeiculo': return 'Digite o tipo (Carro, Moto...)';
            default: return '';
        }
    };

    // Lógica da Busca (filtro client-side)
    const handleSearch = (event?: FormEvent<HTMLFormElement>) => {
        if (event) event.preventDefault();
        setIsSearching(true); setBuscaRealizada(true); setError(null);

        if (isLoadingAll) { // Se ainda estiver carregando a base, espera
            setError("Aguarde o carregamento inicial dos dados.");
            setIsSearching(false);
            return;
        }
        if (todasPecas.length === 0 && !isLoadingAll) {
            setError("Não há peças cadastradas para buscar.");
            setIsSearching(false);
            return;
        }

        const query = termoBusca.trim().toLowerCase();
        if (!query) {
            setResultadosBusca([]); setIsSearching(false); return;
        }

        let resultados: PecaParaLista[] = [];
        try {
            switch (tipoBusca) {
                case 'descricaoPeca':
                    resultados = todasPecas.filter(p => p.descricaoPeca.toLowerCase().includes(query));
                    break;
                case 'fabricante':
                    resultados = todasPecas.filter(p => p.fabricante.toLowerCase().includes(query));
                    break;
                case 'tipoVeiculo':
                    resultados = todasPecas.filter(p => p.tipoVeiculo.toLowerCase().includes(query));
                    break;
                default:
                    resultados = [];
            }
        } catch (err) {
            console.error("Erro durante filtro:", err);
            setError("Erro ao filtrar peças.");
        } finally {
            setResultadosBusca(resultados);
            setIsSearching(false);
        }
    };

    // Deleção (similar à listagem, mas opera sobre 'todasPecas' e 'resultadosBusca')
    const handleDelete = async (id: number) => {
        if (!window.confirm(`Tem certeza que deseja excluir a peça ID ${id}?`)) return;
        // Adicionar estado de loading para o botão específico seria ideal
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/rest/pecas/${id}`, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) throw new Error('Falha ao excluir peça');
            alert('Peça excluída com sucesso!');
            // Remove das duas listas para consistência
            setTodasPecas(prev => prev.filter(p => p.id !== id));
            setResultadosBusca(prev => prev.filter(p => p.id !== id));
        } catch (err: any) { setError(err.message || 'Erro ao excluir.'); }
    };

    return (
        <>
            <NavBar active="pecas-buscar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="flex items-center justify-center text-2xl md:text-3xl font-bold mb-8 gap-2">
                    <Search size={28} className="text-sky-400"/> Buscar Peças
                </h1>

                {/* Formulário de Busca */}
                <div className="bg-slate-800 p-4 md:p-6 rounded-lg shadow-lg max-w-3xl mx-auto mb-8 border border-slate-700">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
                        {/* Select Tipo Busca */}
                        <div className="flex-shrink-0 w-full sm:w-auto">
                            <label htmlFor="tipoBuscaPeca" className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1"><Filter size={16}/>Buscar por:</label>
                            <select id="tipoBuscaPeca" name="tipoBuscaPeca" value={tipoBusca} onChange={(e) => { setTipoBusca(e.target.value as TipoBuscaPeca); setTermoBusca(''); setResultadosBusca([]); setBuscaRealizada(false); }} className="w-full sm:w-48 p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500">
                                <option value="descricaoPeca">Descrição</option>
                                <option value="fabricante">Fabricante/Marca</option>
                                <option value="tipoVeiculo">Tipo Veículo</option>
                            </select>
                        </div>
                        {/* Input Termo */}
                        <div className="flex-grow w-full">
                            <label htmlFor="termoBuscaPeca" className="block text-sm font-medium text-slate-300 mb-1">Termo:</label>
                            <input id="termoBuscaPeca" type="text" value={termoBusca} onChange={e => setTermoBusca(e.target.value)} required placeholder={getPlaceholder()} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"/>
                        </div>
                        {/* Botão Buscar */}
                        <button type="submit" disabled={isLoadingAll || isSearching} className={`flex-shrink-0 w-full sm:w-auto h-10 px-5 py-2 rounded text-white font-semibold flex items-center justify-center gap-2 transition-opacity ${isLoadingAll || isSearching ? 'bg-sky-800 cursor-not-allowed opacity-70' : 'bg-sky-600 hover:bg-sky-700'}`}>
                            <Search size={18}/> {isSearching ? 'Buscando...' : (isLoadingAll ? 'Carregando Base...' : 'Buscar')}
                        </button>
                    </form>
                </div>

                {/* Loading Inicial */}
                {isLoadingAll && <p className="text-center text-sky-300 py-10">Carregando dados base de peças...</p>}

                {/* Erro */}
                {error && ( <div className="relative max-w-3xl mx-auto mb-6 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500 text-sm" role="alert"><MdErrorOutline className="inline mr-2" />{error}<button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar">&times;</button></div> )}

                {/* Resultados da Busca */}
                {!isLoadingAll && buscaRealizada && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4 text-center text-sky-300">Resultados da Busca</h2>
                        {isSearching ? (
                            <div className='flex justify-center items-center py-10'><Loader2 className="h-8 w-8 animate-spin text-sky-400" /><span className='ml-3 text-sky-300'>Filtrando...</span></div>
                        ) : resultadosBusca.length === 0 ? (
                            <p className="text-center text-slate-400 py-10 bg-slate-800/50 rounded-lg shadow-xl flex items-center justify-center gap-2"><ListX size={20}/> Nenhuma peça encontrada para "{termoBusca}" em "{tipoBusca}".</p>
                        ) : (
                            // Grid de Cards (igual à listagem)
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {resultadosBusca.map((peca) => (
                                    <div key={peca.id} className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20 transition-shadow duration-300">
                                        {/* Header */}
                                        <div className="bg-slate-700 p-3 flex justify-between items-center text-sm">
                                            <span className="flex items-center gap-1 font-semibold text-sky-300"> <Hash size={16} /> ID: {peca.id} </span>
                                            <span className="flex items-center gap-1 text-slate-400 uppercase text-xs font-medium tracking-wider"> <Car size={16} /> {peca.tipoVeiculo} </span>
                                        </div>
                                        {/* Corpo */}
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
                                        {/* Footer */}
                                        <div className="bg-slate-900 p-3 mt-auto border-t border-slate-700 flex justify-end gap-2">
                                            <Link href={`/pecas/alterar/${peca.id}`}> <button className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-xs font-medium gap-1" title="Editar Peça"><Edit3 size={14} /> Editar</button> </Link>
                                            <button onClick={() => handleDelete(peca.id)} className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium gap-1" title="Deletar Peça"><Trash2 size={14} /> Deletar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Mensagem inicial antes da busca */}
                {!isLoadingAll && !buscaRealizada && (
                    <div className="text-center text-slate-400 mt-10 bg-slate-800/50 p-6 rounded-lg max-w-md mx-auto border border-slate-700">
                        <Search size={40} className="mx-auto mb-4 text-sky-500" />
                        <p>Utilize os filtros acima para buscar peças específicas no catálogo.</p>
                    </div>
                )}

                {/* Botão Voltar */}
                <div className="mt-10 text-center">
                    <Link href="/pecas/listar">
                        <button className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md shadow flex items-center justify-center gap-2 mx-auto">
                            <ArrowLeft size={18} /> Voltar para Lista Completa
                        </button>
                    </Link>
                </div>

            </main>
        </>
    );
}