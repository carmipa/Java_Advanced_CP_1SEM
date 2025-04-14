// app/agendamento/listar/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';

// --- Interfaces para Tipagem (Ajuste conforme sua API) ---
interface AgendamentoParaLista {
    id: number;
    dataAgendamento: string; // Data formatada
    observacao: string;
}
interface AgendamentoApiResponseDto {
    id: number;
    dataAgendamento: string; // Vem como yyyy-MM-dd
    observacao: string | null;
}
// -----------------------------

export default function ListarAgendamentosPage() {
    const [agendamentos, setAgendamentos] = useState<AgendamentoParaLista[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // const [success, setSuccess] = useState<string | null>(null); // Usaremos o modal de sucesso

    // --- Estados para o Modal de Deleção (GARANTA QUE ESTÃO AQUI) ---
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
    const [agendamentoParaDeletar, setAgendamentoParaDeletar] = useState<AgendamentoParaLista | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    // ---------------------------------------------------------------

    const router = useRouter();

    // --- Função para buscar e formatar os agendamentos ---
    const fetchAgendamentos = async () => {
        setIsLoading(true); setError(null);
        // Limpa estados dos modais ao recarregar a lista
        setShowDeleteConfirmModal(false); // <<< Chamada que estava dando erro
        setShowDeleteSuccessModal(false); // <<< Chamada que estava dando erro
        setAgendamentoParaDeletar(null);  // <<< Chamada que estava dando erro
        try {
            const response = await fetch("http://localhost:8080/rest/agenda/all"); // Endpoint GET Agenda
            if (!response.ok) { throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`); }
            const data: AgendamentoApiResponseDto[] = await response.json();

            const agendamentosFormatados: AgendamentoParaLista[] = data.map(dto => ({
                id: dto.id,
                dataAgendamento: dto.dataAgendamento ? new Date(dto.dataAgendamento + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A', // Adiciona UTC timezone
                observacao: dto.observacao || '',
            }));
            setAgendamentos(agendamentosFormatados);
        } catch (err: any) { setError(err.message || "Falha ao carregar agendamentos.");
        } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchAgendamentos(); }, []);

    // --- Funções para o fluxo de deleção com modal ---
    const handleDeleteClick = (agendamento: AgendamentoParaLista) => {
        setAgendamentoParaDeletar(agendamento); setShowDeleteModal(true); setError(null); };

    const confirmDelete = async () => {
        if (!agendamentoParaDeletar) return;
        setIsDeleting(true); setError(null);
        const { id } = agendamentoParaDeletar;
        try {
            const response = await fetch(`http://localhost:8080/rest/agenda/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorText = await response.text().catch(() => `Erro ${response.status}`);
                throw new Error(`Falha ao deletar agendamento: ${errorText || response.statusText}`); }
            setShowDeleteModal(false); setShowDeleteSuccessModal(true); // Abre modal de sucesso
            setAgendamentos(prev => prev.filter(a => a.id !== id)); // Remove da lista local
        } catch (err: any) { setError(err.message || "Falha ao excluir agendamento."); setShowDeleteModal(false);
        } finally { setIsDeleting(false); }
    };

    const cancelDelete = () => { setShowDeleteModal(false); setAgendamentoParaDeletar(null); };
    const closeSuccessModal = () => { setShowDeleteSuccessModal(false); setAgendamentoParaDeletar(null); };
    // ----------------------------------------------------

    return (
        <>
            <NavBar active="agendamento" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Agendamentos</h1>
                    <Link href="/agendamento/cadastrar">
                        <button className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500">
                            Novo Agendamento
                        </button>
                    </Link>
                </div>

                {/* Mensagens */}
                {isLoading && <p className="text-center text-sky-300 py-4">Carregando...</p>}
                {error && ( <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert"><span className="block sm:inline">{error}</span><button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-2xl" aria-hidden="true">&times;</span></button></div> )}

                {/* Tabela de Agendamentos */}
                {!isLoading && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Observação</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {agendamentos.length === 0 && !isLoading ? (
                                <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-400">Nenhum agendamento encontrado.</td></tr>
                            ) : (
                                agendamentos.map((agendamento) => (
                                    <tr key={agendamento.id} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{agendamento.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{agendamento.dataAgendamento}</td>
                                        <td className="px-6 py-4 whitespace-normal max-w-md truncate" title={agendamento.observacao}>{agendamento.observacao}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                            {(agendamento.id) ? ( <Link href={`/agendamento/alterar/${agendamento.id}`}><button className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded" disabled={isDeleting}>Editar</button></Link>
                                            ) : ( <button className="px-3 py-1 text-sm bg-gray-500 text-black rounded cursor-not-allowed" disabled>Editar</button> )}
                                            <button onClick={() => handleDeleteClick(agendamento)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded" disabled={isDeleting || !agendamento.id}>
                                                Deletar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Modal de Confirmação de Deleção */}
            {showDeleteConfirmModal && agendamentoParaDeletar && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4" onClick={cancelDelete}>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full z-50 border border-red-500" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-red-400 mb-4">Confirmar Exclusão</h3>
                        <p className="text-white mb-3">Tem certeza que deseja excluir o agendamento?</p>
                        <div className='text-slate-300 text-sm mb-6 border-l-2 border-red-500 pl-3'>
                            <p><strong>ID:</strong> {agendamentoParaDeletar.id}</p>
                            <p><strong>Data:</strong> {agendamentoParaDeletar.dataAgendamento}</p>
                            <p><strong>Obs:</strong> {agendamentoParaDeletar.observacao}</p>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button type="button" className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md" onClick={cancelDelete} disabled={isDeleting}>Não</button>
                            <button type="button" className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={confirmDelete} disabled={isDeleting}>
                                {isDeleting ? 'Excluindo...' : 'Sim'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Sucesso da Deleção */}
            {showDeleteSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4" onClick={closeSuccessModal}>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full z-50 border border-green-500" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-green-400 mb-4 text-center">Sucesso!</h3>
                        <p className="text-white mb-6 text-center">Agendamento excluído.</p>
                        <div className="flex justify-center">
                            <button type="button" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md" onClick={closeSuccessModal}>OK</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
