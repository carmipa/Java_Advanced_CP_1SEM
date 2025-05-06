// src/app/orcamento/buscar/page.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import {
    MdSearch, MdFilterList, MdEdit, MdDelete, MdErrorOutline, MdCalendarToday,
    MdAttachMoney, MdArrowBack, MdPerson, MdDirectionsCar
} from 'react-icons/md';
import { FileText, Hash, CalendarDays, DollarSign, Edit3, Trash2, ListChecks, Loader2, AlertCircle, Search as SearchIcon } from 'lucide-react';

interface OrcamentoListDto {
    id: number;
    dataOrcamento: string;
    valorMaoDeObra: number;
    valorHora: number;
    quantidadeHoras: number;
    valorTotal: number;
    // clienteNome?: string;
    // veiculoPlaca?: string;
}

export default function BuscarOrcamentosPage() {
    const [resultadosBusca, setResultadosBusca] = useState<OrcamentoListDto[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [buscaRealizada, setBuscaRealizada] = useState(false);

    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');
    const [filtroClienteNome, setFiltroClienteNome] = useState('');
    const [filtroVeiculoPlaca, setFiltroVeiculoPlaca] = useState('');

    const formatCurrency = (value: number | null | undefined): string => { if (value === null || value === undefined) return 'R$ 0,00'; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
    const formatDate = (dateString: string | null | undefined): string => { if (!dateString) return 'N/A'; try { return new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }); } catch (e) { return dateString; }};

    const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSearching(true);
        setBuscaRealizada(true);
        setError(null);
        setResultadosBusca([]);

        try {
            const queryParams = new URLSearchParams();
            if (filtroDataInicio) queryParams.append('dataInicio', filtroDataInicio);
            if (filtroDataFim) queryParams.append('dataFim', filtroDataFim);
            if (filtroClienteNome) queryParams.append('clienteNome', filtroClienteNome);
            if (filtroVeiculoPlaca) queryParams.append('veiculoPlaca', filtroVeiculoPlaca);

            // Endpoint de busca no backend - PRECISA SER IMPLEMENTADO NO SEU BACKEND JAVA
            // Exemplo: /rest/orcamentos/buscar?dataInicio=...&clienteNome=...
            const response = await fetch(`http://localhost:8080/rest/orcamentos/buscar/filtrado?${queryParams.toString()}`);

            if (!response.ok) {
                if (response.status === 204) {
                    setResultadosBusca([]); // Nenhum resultado, mas não um erro
                    return;
                }
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}` }));
                throw new Error(errorData.message || `Falha ao buscar orçamentos`);
            }
            const data: OrcamentoListDto[] = await response.json();
            data.sort((a,b) => b.id - a.id);
            setResultadosBusca(data);
        } catch (err: any) {
            setError(err.message || "Erro ao buscar orçamentos. Verifique o console e a API.");
            console.error("Erro na busca de orçamentos:", err);
            setResultadosBusca([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleDelete = async (id: number) => {
        // Reutilizar o modal da página de listagem seria o ideal aqui
        if (!window.confirm(`Tem certeza que deseja excluir o orçamento ID ${id}? Esta ação não pode ser desfeita.`)) return;
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/rest/orcamentos/${id}`, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) throw new Error('Falha ao excluir');
            alert('Orçamento excluído com sucesso!');
            setResultadosBusca(prev => prev.filter(o => o.id !== id));
        } catch (err: any) {
            setError(err.message || 'Erro ao excluir orçamento.');
        }
    };

    return (
        <>
            <NavBar active="orcamento-buscar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="flex items-center justify-center gap-2 text-3xl font-bold mb-6 text-center">
                    <SearchIcon size={30} className="text-sky-400" /> Buscar Orçamentos
                </h1>

                <form onSubmit={handleSearch} className="mb-8 p-6 bg-slate-800 rounded-lg shadow-lg max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-end">
                        <div>
                            <label htmlFor="filtroDataInicio" className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1"><MdCalendarToday size={16}/> Data Início:</label>
                            <input type="date" id="filtroDataInicio" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md date-input-fix"/>
                        </div>
                        <div>
                            <label htmlFor="filtroDataFim" className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1"><MdCalendarToday size={16}/> Data Fim:</label>
                            <input type="date" id="filtroDataFim" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md date-input-fix"/>
                        </div>
                        <div>
                            <label htmlFor="filtroClienteNome" className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1"><MdPerson size={18}/> Nome do Cliente:</label>
                            <input type="text" id="filtroClienteNome" value={filtroClienteNome} onChange={e => setFiltroClienteNome(e.target.value)} placeholder="Parte do nome" className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="filtroVeiculoPlaca" className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1"><MdDirectionsCar size={18}/> Placa do Veículo:</label>
                            <input type="text" id="filtroVeiculoPlaca" value={filtroVeiculoPlaca} onChange={e => setFiltroVeiculoPlaca(e.target.value)} placeholder="AAA0X00" className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md"/>
                        </div>
                        <div className="md:col-span-2 flex justify-end pt-4">
                            <button type="submit" disabled={isSearching} className={`h-10 px-6 py-2 font-semibold rounded-md shadow flex items-center justify-center gap-2 ${isSearching ? 'bg-sky-800 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}>
                                <MdSearch size={20}/> {isSearching ? 'Buscando...' : 'Buscar Orçamentos'}
                            </button>
                        </div>
                    </div>
                </form>

                {isSearching && (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                        <span className="ml-3 text-sky-300">Buscando orçamentos...</span>
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-400 py-4 bg-red-900/30 border border-red-700 rounded-md p-3 max-w-2xl mx-auto my-6">
                        <p className="flex items-center justify-center gap-1"><AlertCircle size={20}/> {error}</p>
                    </div>
                )}

                {buscaRealizada && !isSearching && !error && resultadosBusca.length === 0 && (
                    <p className="text-center text-slate-400 py-10 bg-slate-800/50 rounded-lg shadow-xl">Nenhum orçamento encontrado para os critérios informados.</p>
                )}

                {resultadosBusca.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
                        {resultadosBusca.map((orc) => (
                            <div key={orc.id} className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20 transition-shadow duration-300">
                                <div className="bg-slate-700 p-3 flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-1 font-semibold text-sky-300"><Hash size={16} /> ID: {orc.id}</span>
                                    <span className="flex items-center gap-1 text-slate-400"><CalendarDays size={16} /> {formatDate(orc.dataOrcamento)}</span>
                                </div>
                                <div className="p-4 space-y-3 flex-grow">
                                    <div>
                                        <h3 className="flex items-center text-2xl font-bold text-green-400 gap-1">{formatCurrency(orc.valorTotal)}</h3>
                                        <p className="text-xs text-slate-400">Valor Total</p>
                                    </div>
                                    {/* <p className="text-sm text-slate-300">Cliente: {orc.clienteNome || 'N/A'}</p> */}
                                    {/* <p className="text-sm text-slate-300">Veículo: {orc.veiculoPlaca || 'N/A'}</p> */}
                                </div>
                                <div className="bg-slate-900 p-3 mt-auto border-t border-slate-700 flex justify-end gap-2">
                                    <Link href={`/orcamento/alterar/${orc.id}`}>
                                        <button className="inline-flex items-center px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-xs font-medium gap-1 shadow-sm" title="Alterar/Ver Detalhes">
                                            <Edit3 size={14} /> Detalhes/Alterar
                                        </button>
                                    </Link>
                                    <button onClick={() => handleDelete(orc.id)} className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium gap-1 shadow-sm" title="Deletar">
                                        <Trash2 size={14} /> Deletar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-10 text-center">
                    <Link href="/orcamento">
                        <button className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md shadow flex items-center justify-center gap-2 mx-auto">
                            <MdArrowBack /> Voltar ao Menu Orçamento
                        </button>
                    </Link>
                </div>
                <style jsx global>{`
                    .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
                `}</style>
            </main>
        </>
    );
}