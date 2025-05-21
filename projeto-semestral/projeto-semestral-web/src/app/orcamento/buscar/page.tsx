// src/app/orcamento/buscar/page.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import {
    MdSearch,
    MdEdit, // MdEdit não está sendo usado aqui, mas MdDelete sim.
    MdDelete,
    MdErrorOutline,
    MdCalendarToday,
    // MdAttachMoney, // Não usado diretamente nos campos de filtro, mas para display sim.
    MdArrowBack,
    MdPerson,
    MdDirectionsCar
} from 'react-icons/md';
import {
    FileText, // Usado no card de resultado
    Hash,
    CalendarDays,
    DollarSign,
    Edit3, // Usado no card de resultado
    Trash2,
    // ListChecks, // Não usado diretamente nos campos de filtro
    Loader2,
    AlertCircle,
    Search as SearchIcon // Ícone para o título e botão de busca
} from 'lucide-react';
import { fetchAuthenticated } from '@/utils/apiService';

interface OrcamentoListDto {
    id: number;
    dataOrcamento: string;
    valorMaoDeObra: number; // Campo existe no DTO mas não é usado na listagem simplificada. Mantido para consistência.
    valorHora: number;      // Campo existe no DTO mas não é usado na listagem simplificada.
    quantidadeHoras: number;// Campo existe no DTO mas não é usado na listagem simplificada.
    valorTotal: number;
    // Poderia adicionar clienteNome e veiculoPlaca aqui se o backend retornasse e você quisesse exibir
}

export default function BuscarOrcamentosPage() {
    const [resultadosBusca, setResultadosBusca] = useState<OrcamentoListDto[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [buscaRealizada, setBuscaRealizada] = useState(false);

    // Estados dos filtros
    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');
    const [filtroClienteNome, setFiltroClienteNome] = useState('');
    const [filtroVeiculoPlaca, setFiltroVeiculoPlaca] = useState('');

    const formatCurrency = (value?: number | null): string => {
        if (value == null) return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateString?: string | null): string => {
        if (!dateString) return 'N/A';
        try {
            // Verifica se a string já tem informações de T e Z (timezone/offset)
            return new Date(
                dateString.includes('T')
                    ? dateString
                    : dateString + 'T00:00:00Z' // Adiciona T00:00:00Z para tratar como UTC se for só data
            ).toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // Exibe em pt-BR
        } catch {
            return dateString; // Retorna a string original se houver erro de parse
        }
    };

    const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSearching(true);
        setBuscaRealizada(true);
        setError(null);
        setResultadosBusca([]); // Limpa resultados anteriores

        console.log("Iniciando busca com filtros:", { filtroDataInicio, filtroDataFim, filtroClienteNome, filtroVeiculoPlaca });

        try {
            const queryParams = new URLSearchParams();
            if (filtroDataInicio) queryParams.append('dataInicio', filtroDataInicio);
            if (filtroDataFim)    queryParams.append('dataFim', filtroDataFim);
            if (filtroClienteNome)queryParams.append('clienteNome', filtroClienteNome);
            if (filtroVeiculoPlaca)queryParams.append('veiculoPlaca', filtroVeiculoPlaca);

            const response = await fetchAuthenticated(
                `/rest/orcamentos/buscar/filtrado?${queryParams.toString()}`
            );

            console.log("Resposta da API:", response.status, response.statusText);

            if (!response.ok) {
                if (response.status === 204) { // No Content
                    console.log("Nenhum orçamento encontrado (204 No Content).");
                    setResultadosBusca([]); // Garante que está vazio
                    // Não precisa setar erro aqui, a UI tratará lista vazia.
                    return;
                }
                // Para outros erros (400, 401, 403, 500, etc.)
                const errorData = await response.json().catch(() => ({
                    message: `Erro ${response.status}: ${response.statusText || 'Falha ao buscar orçamentos'}`
                }));
                console.error("Erro ao buscar orçamentos:", errorData);
                throw new Error(errorData.message || 'Falha ao buscar orçamentos');
            }

            const data: OrcamentoListDto[] = await response.json();
            console.log("Dados recebidos:", data);
            data.sort((a, b) => b.id - a.id); // Ordena pelos mais recentes (maior ID primeiro)
            setResultadosBusca(data);

        } catch (err: any) {
            console.error("Erro na função handleSearch:", err);
            if (err.name === "AuthError") { // Se você tiver AuthError sendo lançado por fetchAuthenticated
                setError("Sua sessão expirou ou é inválida. Por favor, faça login novamente.");
                // Idealmente, aqui você também faria router.replace('/login');
            } else {
                setError(err.message || 'Erro ao conectar com a API ou processar a busca.');
            }
            setResultadosBusca([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Tem certeza que deseja excluir o orçamento ID ${id}? Esta ação não pode ser desfeita.`)) {
            return;
        }
        setError(null); // Limpa erros anteriores
        // Poderia adicionar um estado de isDeleting para o item específico
        try {
            const response = await fetchAuthenticated(`/rest/orcamentos/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok && response.status !== 204) { // 204 (No Content) é sucesso para DELETE
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status} ao excluir.` }));
                throw new Error(errorData.message || 'Falha ao excluir orçamento');
            }
            alert('Orçamento excluído com sucesso!');
            setResultadosBusca(prev => prev.filter(o => o.id !== id)); // Remove da lista local
        } catch (err: any) {
            console.error("Erro ao excluir orçamento:", err);
            if (err.name === "AuthError") {
                setError("Sua sessão expirou ou é inválida. Por favor, faça login novamente para realizar esta ação.");
            } else {
                setError(err.message || 'Erro ao excluir orçamento.');
            }
        }
    };

    return (
        <>
            <NavBar active="orcamento-buscar" /> {/* Confirme se 'orcamento-buscar' é a chave correta para a NavBar */}
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="flex items-center justify-center gap-2 text-3xl font-bold mb-6 text-center">
                    <SearchIcon size={30} className="text-sky-400" /> Buscar Orçamentos
                </h1>

                {/* Formulário de Busca */}
                <form
                    onSubmit={handleSearch}
                    className="mb-8 p-6 bg-slate-800 rounded-lg shadow-lg max-w-3xl mx-auto"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-end">
                        {/* Data Início */}
                        <div>
                            <label
                                htmlFor="filtroDataInicio"
                                className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1"
                            >
                                <MdCalendarToday size={16} /> Data Início:
                            </label>
                            <input
                                type="date"
                                id="filtroDataInicio"
                                value={filtroDataInicio}
                                onChange={e => setFiltroDataInicio(e.target.value)}
                                className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md date-input-fix"
                            />
                        </div>
                        {/* Data Fim */}
                        <div>
                            <label
                                htmlFor="filtroDataFim"
                                className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1"
                            >
                                <MdCalendarToday size={16} /> Data Fim:
                            </label>
                            <input
                                type="date"
                                id="filtroDataFim"
                                value={filtroDataFim}
                                onChange={e => setFiltroDataFim(e.target.value)}
                                className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md date-input-fix"
                            />
                        </div>
                        {/* Nome do Cliente */}
                        <div>
                            <label
                                htmlFor="filtroClienteNome"
                                className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1"
                            >
                                <MdPerson size={18} /> Nome do Cliente:
                            </label>
                            <input
                                type="text"
                                id="filtroClienteNome"
                                value={filtroClienteNome}
                                onChange={e => setFiltroClienteNome(e.target.value)}
                                placeholder="Parte do nome"
                                className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md"
                            />
                        </div>
                        {/* Placa do Veículo */}
                        <div>
                            <label
                                htmlFor="filtroVeiculoPlaca"
                                className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1"
                            >
                                <MdDirectionsCar size={18} /> Placa do Veículo:
                            </label>
                            <input
                                type="text"
                                id="filtroVeiculoPlaca"
                                value={filtroVeiculoPlaca}
                                onChange={e => setFiltroVeiculoPlaca(e.target.value)}
                                placeholder="AAA0X00"
                                className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md"
                            />
                        </div>
                        {/* Botão Buscar */}
                        <div className="md:col-span-2 flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSearching}
                                className={`h-10 px-6 py-2 font-semibold rounded-md shadow flex items-center justify-center gap-2 ${
                                    isSearching ? 'bg-sky-800 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'
                                }`}
                            >
                                <MdSearch size={20} /> {isSearching ? 'Buscando...' : 'Buscar Orçamentos'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Estado de Carregamento da Busca */}
                {isSearching && (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                        <span className="ml-3 text-sky-300">Buscando orçamentos...</span>
                    </div>
                )}

                {/* Exibição de Erro */}
                {error && !isSearching && ( // Só mostra erro se não estiver buscando
                    <div className="text-center text-red-400 py-4 bg-red-900/30 border border-red-700 rounded-md p-3 max-w-2xl mx-auto my-6">
                        <p className="flex items-center justify-center gap-1">
                            <AlertCircle size={20} /> {error}
                        </p>
                    </div>
                )}

                {/* Nenhum Resultado Encontrado */}
                {buscaRealizada && !isSearching && !error && resultadosBusca.length === 0 && (
                    <p className="text-center text-slate-400 py-10 bg-slate-800/50 rounded-lg shadow-xl">
                        Nenhum orçamento encontrado para os critérios informados.
                    </p>
                )}

                {/* Resultados da Busca (Cards) */}
                {resultadosBusca.length > 0 && !isSearching && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
                        {resultadosBusca.map(orc => (
                            <div
                                key={orc.id}
                                className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20 transition-shadow duration-300"
                            >
                                <div className="bg-slate-700 p-3 flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-1 font-semibold text-sky-300">
                                        <Hash size={16} /> ID: {orc.id}
                                    </span>
                                    <span className="flex items-center gap-1 text-slate-400">
                                        <CalendarDays size={16} /> {formatDate(orc.dataOrcamento)}
                                    </span>
                                </div>
                                <div className="p-4 space-y-3 flex-grow">
                                    <div>
                                        <h3 className="flex items-center text-2xl font-bold text-green-400 gap-1">
                                            {/* <DollarSign size={24} /> Icone Opcional */}
                                            {formatCurrency(orc.valorTotal)}
                                        </h3>
                                        <p className="text-xs text-slate-400">Valor Total</p>
                                    </div>
                                    {/* Poderia adicionar mais detalhes do orçamento aqui se o DTO retornasse */}
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
                                        onClick={() => handleDelete(orc.id)}
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

                {/* Botão Voltar */}
                <div className="mt-10 text-center">
                    <Link href="/orcamento/listar"> {/* Ou para a página principal de orçamento, se existir "/orcamento" */}
                        <button className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md shadow flex items-center justify-center gap-2 mx-auto">
                            <MdArrowBack /> Voltar ao Menu Orçamento
                        </button>
                    </Link>
                </div>

                {/* Estilos para o input de data */}
                <style jsx global>{`
                    .date-input-fix::-webkit-calendar-picker-indicator {
                        filter: invert(0.8); cursor: pointer;
                    }
                `}</style>
            </main>
        </>
    );
}