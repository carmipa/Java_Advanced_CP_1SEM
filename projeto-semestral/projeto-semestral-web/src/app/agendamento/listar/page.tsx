// --- Arquivo: src/app/agendamento/listar/page.tsx (Refatorado com Cards e Ordenação por ID) ---
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';
import { fetchAuthenticated } from '@/utils/apiService'; // Import adicionado
// Importando Ícones (Lucide e Material Design)
import { Calendar, Hash, ClipboardList, Edit3, Trash2, CirclePlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { MdEventNote, MdAdd, MdErrorOutline } from 'react-icons/md';

// --- Interfaces ---
interface AgendamentoParaLista {
    id: number;
    dataAgendamento: string; // Já vem formatada ou '-'
    observacao: string;
    // Poderíamos adicionar cliente/veículo aqui se a API retornasse
}

interface PaginatedAgendaResponse {
    content: AgendamentoApiResponseDto[];
    totalPages: number;
    totalElements: number; // Não usado atualmente, mas pode ser útil
    number: number; // Número da página atual (base 0)
    size: number;   // Tamanho da página
}

interface AgendamentoApiResponseDto {
    id: number;
    dataAgendamento: string; // Esperado formato<ctrl3348>-MM-DD
    observacao: string | null;
    // Adicionar aqui os DTOs de cliente/veículo se o backend os retornar
}
// ------------------

export default function ListarAgendamentosPage() {
    const [agendamentos, setAgendamentos] = useState<AgendamentoParaLista[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(12); // Aumentado para preencher melhor o grid (3 colunas x 4 linhas)

    const router = useRouter();

    // Helper para formatar data
    const formatarData = (dataString: string | null | undefined): string => {
        if (!dataString) return '-';
        try { return new Date(dataString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }); }
        catch (e) { console.error("Erro formatar data Ag:", dataString, e); return 'Inválida'; }
    };

    // --- Fetch Agendamentos com Paginação e Ordenação por ID ---
    const fetchAgendamentos = async (page = 0) => {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
            page: page.toString(),
            size: pageSize.toString(),
            sort: 'id,asc' // <<< ORDENAÇÃO ALTERADA PARA ID ASCENDENTE >>>
        });
        const apiUrl = `/rest/agenda?${params.toString()}`;
        console.log("Buscando agendamentos:", apiUrl);

        try {
            const response = await fetchAuthenticated(apiUrl);
            if (!response.ok) {
                let errorMsg = `Erro HTTP ${response.status}: ${response.statusText}`;
                try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {}
                throw new Error(errorMsg);
            }

            if (response.status === 204) { // No Content
                setAgendamentos([]); setTotalPages(0); setCurrentPage(0);
                return;
            }

            const data: PaginatedAgendaResponse = await response.json();
            const agendamentosFormatados: AgendamentoParaLista[] = data.content.map(dto => ({
                id: dto.id,
                dataAgendamento: formatarData(dto.dataAgendamento), // Formata aqui
                observacao: dto.observacao || '',
                // Mapear cliente/veículo aqui se vierem da API
            }));

            setAgendamentos(agendamentosFormatados);
            setTotalPages(data.totalPages);
            setCurrentPage(data.number);

        } catch (err: any) {
            setError(err.message || "Falha ao carregar agendamentos.");
            setAgendamentos([]); setTotalPages(0); setCurrentPage(0); // Reseta em caso de erro
            console.error("Erro:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAgendamentos(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]); // Roda quando a página ou tamanho mudar

    // Funções de Paginação
    const handlePreviousPage = () => { if (currentPage > 0) { setCurrentPage(prev => prev - 1); } };
    const handleNextPage = () => { if (currentPage < totalPages - 1) { setCurrentPage(prev => prev + 1); } };

    // Função Delete (apenas navega, precisa da página /deletar ou modal)
    const navigateToDelete = (id: number) => {
        if (!id || isNaN(id)) { setError("ID inválido para exclusão."); return; }
        if (window.confirm(`Tem certeza que deseja excluir o Agendamento ID: ${id}?`)) {
            alert(`Exclusão do Agendamento ${id} não implementada neste exemplo.`);
            // Exemplo: router.push(`/agendamento/deletar/${id}`);
            // Ou chamar API de delete e refetch:
            // deleteAgendamento(id).then(() => fetchAgendamentos(currentPage));
        }
    };

    return (
        <>
            <NavBar active="agendamento" /> {/* Ajuste 'active' conforme nome na NavBar */}
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-center sm:text-left">
                        <MdEventNote className="text-4xl text-sky-400" /> Agendamentos Registrados
                    </h1>
                    <Link href="/agendamento/cadastrar">
                        <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500 whitespace-nowrap"> <MdAdd /> Novo Agendamento </button>
                    </Link>
                </div>

                {/* Mensagens */}
                {isLoading && <p className="text-center text-sky-300 py-10">Carregando agendamentos...</p>}
                {error && ( <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500 max-w-3xl mx-auto flex items-center gap-2"> <MdErrorOutline/> <span>{error}</span> <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-xl">&times;</span></button> </div> )}


                {/* <<< Lista de Cards >>> */}
                {!isLoading && !error && (
                    <div>
                        {agendamentos.length === 0 ? (
                            <p className="text-center text-slate-400 py-10">Nenhum agendamento encontrado.</p>
                        ) : (
                            // Grid Layout para os Cards
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {agendamentos.map((agendamento) => (
                                    // Card Individual
                                    <div key={agendamento.id} className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20 transition-shadow duration-300">
                                        {/* Header do Card */}
                                        <div className="bg-slate-700 p-3 flex justify-between items-center text-sm">
                                            <span className="flex items-center gap-1 font-semibold text-sky-300"> <Hash size={16} /> ID: {agendamento.id} </span>
                                            <span className="flex items-center gap-1 text-slate-400"> <Calendar size={16} /> {agendamento.dataAgendamento} </span>
                                        </div>
                                        {/* Corpo do Card */}
                                        <div className="p-4 space-y-3 flex-grow">
                                            <div>
                                                <h3 className="flex items-center text-base font-semibold mb-1 text-slate-200 gap-1"> <ClipboardList size={18} className="text-amber-400"/> Observação </h3>
                                                {/* Scroll se observação for muito longa */}
                                                <p className="text-sm text-slate-300 break-words max-h-28 overflow-y-auto pr-1">
                                                    {agendamento.observacao || '-'}
                                                </p>
                                                {/* Adicionar Cliente/Veículo aqui se disponível */}
                                                {/* Ex: <p><strong><User size={14}/> Cliente:</strong> {agendamento.nomeCliente || 'N/I'}</p> */}
                                                {/* Ex: <p><strong><Car size={14}/> Veículo:</strong> {agendamento.placaVeiculo || 'N/I'}</p> */}
                                            </div>
                                        </div>
                                        {/* Footer do Card (Ações) */}
                                        <div className="bg-slate-900 p-3 mt-auto border-t border-slate-700 flex justify-end gap-2">
                                            <Link href={`/agendamento/alterar/${agendamento.id}`}>
                                                <button className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-xs font-medium gap-1"> <Edit3 size={14} /> Editar </button>
                                            </Link>
                                            <button onClick={() => navigateToDelete(agendamento.id)} className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium gap-1"> <Trash2 size={14} /> Deletar </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {/* <<< Fim da Lista de Cards >>> */}


                {/* Controles de Paginação */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 gap-3"> {/* Aumentado margem superior */}
                        <button onClick={handlePreviousPage} disabled={currentPage === 0} className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                            <ChevronLeft size={18}/> Anterior
                        </button>
                        <span className="text-slate-300 text-sm"> Página {currentPage + 1} de {totalPages} </span>
                        <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1} className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                            Próxima <ChevronRight size={18}/>
                        </button>
                    </div>
                )}
            </main>
        </>
    );
}