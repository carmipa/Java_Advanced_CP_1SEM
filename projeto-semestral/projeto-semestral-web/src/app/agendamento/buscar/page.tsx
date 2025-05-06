// --- Arquivo: app/agendamento/buscar/page.tsx (Refatorado SEM ID, COM Cards) ---
"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';
// Importando Ícones
import { Calendar, Hash, ClipboardList, Edit3, Trash2, Search as SearchIcon, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { MdSearch, MdEdit, MdDelete, MdErrorOutline, MdFindInPage } from 'react-icons/md';

// --- Interfaces ---
interface AgendamentoParaLista {
    id: number;
    dataAgendamento: string;
    observacao: string;
}

interface PaginatedAgendaResponse {
    content: AgendamentoApiResponseDto[];
    totalPages: number;
    totalElements: number; // Não usado, mas pode ser útil
    number: number; // Página atual (base 0)
    size: number;
}

interface AgendamentoApiResponseDto {
    id: number;
    dataAgendamento: string; // Esperado format<x_bin_438>-MM-DD
    observacao: string | null;
}
// ------------------

// <<< Tipo de busca ATUALIZADO (SEM 'id') >>>
type TipoBuscaAgendamento = 'observacao' | 'dataInicio' | 'dataFim';

export default function BuscarAgendamentosPage() {
    const [resultadosBusca, setResultadosBusca] = useState<AgendamentoParaLista[]>([]);
    // <<< Default voltou para 'observacao' >>>
    const [tipoBusca, setTipoBusca] = useState<TipoBuscaAgendamento>('observacao');
    const [termoBusca, setTermoBusca] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [buscaRealizada, setBuscaRealizada] = useState(false);

    // Estados de Paginação
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(12); // Ajustado para cards

    const router = useRouter();

    // Helper para formatar data
    const formatarData = (dataString: string | null | undefined): string => {
        if (!dataString) return '-';
        try { return new Date(dataString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }); }
        catch (e) { console.error("Erro formatar data:", dataString, e); return 'Inválida'; }
    };

    // --- Função de Busca ATUALIZADA (sem lógica de ID) ---
    const handleSearch = async (event?: FormEvent<HTMLFormElement>, page = 0) => {
        if (event) event.preventDefault();
        setIsSearching(true);
        setBuscaRealizada(true);
        setError(null);
        if (page === 0) { setResultadosBusca([]); setCurrentPage(0); }
        else { setCurrentPage(page); }

        const params = new URLSearchParams({
            page: page.toString(),
            size: pageSize.toString(),
            sort: 'dataAgendamento,desc' // <<< Voltando a ordenar por Data DESC (ou 'asc' se preferir) >>>
        });

        // Adiciona o parâmetro de filtro correto
        const termo = termoBusca.trim();
        if (termo) {
            if (tipoBusca === 'dataInicio' || tipoBusca === 'dataFim') {
                if (/^\d{4}-\d{2}-\d{2}$/.test(termo)) {
                    params.append(tipoBusca, termo);
                } else {
                    setError("Formato de data inválido. Use AAAA-MM-DD.");
                    setIsSearching(false); setBuscaRealizada(false); setResultadosBusca([]);
                    return;
                }
            } else if (tipoBusca === 'observacao') { // Agora trata observacao
                params.append('observacao', termo); // Envia parâmetro 'observacao'
            }
            // Lógica para 'id' removida
        } else if (tipoBusca !== 'observacao' && tipoBusca !== 'dataInicio' && tipoBusca !== 'dataFim') {
            // Adicionar validação se algum campo for obrigatório (nenhum é agora)
            // setError("Termo de busca é obrigatório para este tipo.");
            // setIsSearching(false); setBuscaRealizada(false); setResultadosBusca([]);
            // return;
        }

        const apiUrl = `http://localhost:8080/rest/agenda?${params.toString()}`;
        console.log("Buscando agendamentos:", apiUrl);

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                let errorMsg = `Erro HTTP ${response.status}: ${response.statusText}`;
                try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {}
                throw new Error(errorMsg);
            }

            if (response.status === 204) {
                setResultadosBusca([]); setTotalPages(0); setCurrentPage(page); return;
            }

            const data: PaginatedAgendaResponse = await response.json();
            // Ordenação feita pela API agora (sort=dataAgendamento,desc)
            const agendamentosFormatados: AgendamentoParaLista[] = data.content.map(dto => ({
                id: dto.id,
                dataAgendamento: formatarData(dto.dataAgendamento),
                observacao: dto.observacao || '',
            }));
            setResultadosBusca(agendamentosFormatados);
            setTotalPages(data.totalPages);
            setCurrentPage(data.number);

        } catch (err: any) {
            setError(err.message || "Falha ao buscar agendamentos.");
            setResultadosBusca([]); setTotalPages(0); setCurrentPage(0);
            console.error("Erro:", err);
        } finally {
            setIsSearching(false);
        }
    };

    // Funções de Paginação
    const handlePreviousPage = () => { if (currentPage > 0) handleSearch(undefined, currentPage - 1); };
    const handleNextPage = () => { if (currentPage < totalPages - 1) handleSearch(undefined, currentPage + 1); };

    // Placeholder dinâmico ATUALIZADO
    const getPlaceholder = () => {
        switch (tipoBusca) {
            // case 'id': return 'Digite o ID exato...'; // Removido
            case 'dataInicio': return 'Data Início (AAAA-MM-DD)...';
            case 'dataFim': return 'Data Fim (AAAA-MM-DD)...';
            case 'observacao': return 'Digite parte da observação...'; // Default agora é observação
            default: return '';
        }
    };

    // Navegação para delete (simulada)
    const navigateToDelete = (id: number) => {
        if (!id || isNaN(id)) { setError("ID inválido para exclusão."); return; }
        if (window.confirm(`Tem certeza que deseja excluir o Agendamento ID: ${id}?`)) {
            alert(`Exclusão do Agendamento ${id} não implementada.`);
        }
    };

    return (
        <>
            <NavBar active="agendamento" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="flex items-center justify-center gap-2 text-3xl font-bold mb-6 text-center">
                    <MdFindInPage className="text-4xl text-sky-400" /> Buscar Agendamentos
                </h1>

                {/* Formulário de Busca ATUALIZADO */}
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg max-w-4xl mx-auto mb-8">
                    <form onSubmit={handleSearch}>
                        <div className="flex flex-wrap items-end gap-4">
                            {/* Select Tipo de Busca ATUALIZADO */}
                            <div className="flex-shrink-0 w-full sm:w-auto">
                                <label htmlFor="tipoBusca" className="flex items-center gap-1 block text-sm font-medium mb-1 text-slate-300"><Filter size={16}/>Buscar por:</label>
                                <select
                                    id="tipoBusca" name="tipoBusca"
                                    className="w-full sm:w-48 h-10 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    value={tipoBusca}
                                    onChange={(e) => { setTipoBusca(e.target.value as TipoBuscaAgendamento); setTermoBusca(''); setResultadosBusca([]); setBuscaRealizada(false); setError(null); }}
                                >
                                    {/* <<< Opção ID Removida >>> */}
                                    <option value="observacao">Observação</option>
                                    <option value="dataInicio">Data Início</option>
                                    <option value="dataFim">Data Fim</option> {/* Mantido Data Fim */}
                                </select>
                            </div>
                            {/* Input Termo de Busca */}
                            <div className="flex-grow min-w-[200px]">
                                <label htmlFor="termoBusca" className="block text-sm font-medium mb-1 text-slate-300">Termo:</label>
                                <input
                                    // Muda tipo dinamicamente
                                    type={tipoBusca.includes('data') ? 'date' : 'text'}
                                    id="termoBusca" name="termoBusca"
                                    className="w-full h-10 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)}
                                    placeholder={getPlaceholder()}
                                    required // Agora todos os campos podem ser required
                                />
                            </div>
                            {/* Botão Buscar */}
                            <div className="flex-shrink-0">
                                <button type="submit" disabled={isSearching} className={`h-10 px-5 py-2 font-semibold rounded-md shadow flex items-center justify-center ${isSearching ? 'bg-sky-800 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}>
                                    <SearchIcon size={18} className="mr-2"/> {isSearching ? 'Buscando...' : 'Buscar'}
                                </button>
                            </div>
                        </div>
                        {error && ( <p className="mt-3 text-sm text-red-400 flex items-center gap-1"><MdErrorOutline/>{error}</p> )}
                    </form>
                </div>

                {/* Mensagem Loading Inicial (removida pois busca é ativa) */}

                {/* <<< Área de Resultados com Cards >>> */}
                {buscaRealizada && ( // Mostra resultados apenas após busca
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4 text-center text-sky-300">Resultados da Busca</h2>
                        {isSearching ? (
                            <p className="text-center text-sky-300 py-10">Buscando...</p>
                        ) : resultadosBusca.length === 0 ? (
                            <p className="text-center text-slate-400 py-10">Nenhum agendamento encontrado para os critérios informados.</p>
                        ) : (
                            // Grid Layout para os Cards
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {resultadosBusca.map((agendamento) => (
                                    <div key={agendamento.id} className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20 transition-shadow duration-300">
                                        {/* Header */}
                                        <div className="bg-slate-700 p-3 flex justify-between items-center text-sm"> <span className="flex items-center gap-1 font-semibold text-sky-300"> <Hash size={16} /> ID: {agendamento.id} </span> <span className="flex items-center gap-1 text-slate-400"> <Calendar size={16} /> {agendamento.dataAgendamento} </span> </div>
                                        {/* Corpo */}
                                        <div className="p-4 space-y-3 flex-grow"> <div> <h3 className="flex items-center text-base font-semibold mb-1 text-slate-200 gap-1"> <ClipboardList size={18} className="text-amber-400"/> Observação </h3> <p className="text-sm text-slate-300 break-words max-h-28 overflow-y-auto pr-1"> {agendamento.observacao || '-'} </p> </div> </div>
                                        {/* Footer */}
                                        <div className="bg-slate-900 p-3 mt-auto border-t border-slate-700 flex justify-end gap-2"> <Link href={`/agendamento/alterar/${agendamento.id}`}> <button className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-xs font-medium gap-1"> <Edit3 size={14} /> Editar </button> </Link> <button onClick={() => navigateToDelete(agendamento.id)} className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium gap-1"> <Trash2 size={14} /> Deletar </button> </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {/* <<< Fim da Área de Resultados >>> */}

                {/* Paginação */}
                {buscaRealizada && !isSearching && totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 gap-3">
                        <button onClick={handlePreviousPage} disabled={currentPage === 0} className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"> <ChevronLeft size={18}/> Anterior </button>
                        <span className="text-slate-300 text-sm"> Página {currentPage + 1} de {totalPages} </span>
                        <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1} className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"> Próxima <ChevronRight size={18}/> </button>
                    </div>
                )}

                {/* Botão Voltar */}
                <div className="mt-8 text-center"> <Link href="/agendamento/listar"> <button className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md shadow"> Voltar para Lista Completa </button> </Link> </div>

            </main>
        </>
    );
}