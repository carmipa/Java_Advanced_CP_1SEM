// app/agendamento/buscar/page.tsx
"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';

// --- Interfaces para Tipagem ---
interface AgendamentoParaLista {
    id: number; dataAgendamento: string; observacao: string; }
interface AgendamentoApiResponseDto {
    id: number; dataAgendamento: string; observacao: string | null; }
// -----------------------------
type TipoBuscaAgendamento = 'id' | 'data' | 'observacao'; // Tipos de busca

export default function BuscarAgendamentosPage() {
    const [todosAgendamentos, setTodosAgendamentos] = useState<AgendamentoParaLista[]>([]);
    const [resultadosBusca, setResultadosBusca] = useState<AgendamentoParaLista[]>([]);
    const [tipoBusca, setTipoBusca] = useState<TipoBuscaAgendamento>('observacao'); // Padrão: observacao
    const [termoBusca, setTermoBusca] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [buscaRealizada, setBuscaRealizada] = useState(false);

    // --- Estados e Funções para Modal de Deleção ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [agendamentoParaDeletar, setAgendamentoParaDeletar] = useState<AgendamentoParaLista | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
    const router = useRouter();

    const fetchTodosAgendamentos = async () => { /* ... (igual listagem) ... */
        if (todosAgendamentos.length > 0) return;
        setIsLoading(true); setError(null); setSuccess(null);
        try {
            const response = await fetch("http://localhost:8080/rest/agenda/all");
            if (!response.ok) { throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`); }
            const data: AgendamentoApiResponseDto[] = await response.json();
            const agendamentosFormatados: AgendamentoParaLista[] = data.map(dto => ({
                id: dto.id,
                dataAgendamento: dto.dataAgendamento ? new Date(dto.dataAgendamento + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A',
                observacao: dto.observacao || '',
            }));
            setTodosAgendamentos(agendamentosFormatados);
        } catch (err: any) { setError(err.message || "Falha ao carregar dados base.");
        } finally { setIsLoading(false); }
    };
    useEffect(() => { fetchTodosAgendamentos(); }, []);

    const handleSearch = (event?: FormEvent<HTMLFormElement>) => { /* ... (lógica de filtro) ... */
        if (event) event.preventDefault();
        setIsSearching(true); setBuscaRealizada(true); setSuccess(null); setError(null);
        const query = termoBusca.trim().toLowerCase();
        if (!query) { setResultadosBusca([]); setIsSearching(false); return; }
        let resultados: AgendamentoParaLista[] = [];
        switch (tipoBusca) {
            case 'id':
                resultados = todosAgendamentos.filter(a => a.id.toString() === query.replace(/\D/g, '')); break;
            case 'data': // Busca simples por data formatada (DD/MM/YYYY)
                resultados = todosAgendamentos.filter(a => a.dataAgendamento.includes(query)); break;
            case 'observacao':
                resultados = todosAgendamentos.filter(a => a.observacao.toLowerCase().includes(query)); break;
            default: resultados = [];
        }
        setResultadosBusca(resultados); setIsSearching(false);
    };
    const handleDeleteClick = (agendamento: AgendamentoParaLista) => { /* ... (igual listagem) ... */
        setAgendamentoParaDeletar(agendamento); setShowDeleteModal(true); setError(null); setSuccess(null); };
    const confirmDelete = async () => { /* ... (igual listagem) ... */
        if (!agendamentoParaDeletar) return; setIsDeleting(true); setError(null); setSuccess(null);
        const { id } = agendamentoParaDeletar;
        try {
            const response = await fetch(`http://localhost:8080/rest/agenda/${id}`, { method: 'DELETE' });
            if (!response.ok) { const errorText = await response.text().catch(() => `Erro ${response.status}`); throw new Error(`Falha ao deletar: ${errorText || response.statusText}`); }
            setShowDeleteModal(false); setShowDeleteSuccessModal(true);
            setTodosAgendamentos(prev => prev.filter(a => a.id !== id));
            setResultadosBusca(prev => prev.filter(a => a.id !== id));
        } catch (err: any) { setError(err.message || "Falha ao excluir."); setShowDeleteModal(false);
        } finally { setIsDeleting(false); }
    };
    const cancelDelete = () => { /* ... (igual listagem) ... */
        setShowDeleteModal(false); setAgendamentoParaDeletar(null); };
    const closeSuccessModal = () => { /* ... (igual listagem) ... */
        setShowDeleteSuccessModal(false); setAgendamentoParaDeletar(null); };
    const getPlaceholder = (): string => { /* ... (adaptado) ... */
        switch (tipoBusca) {
            case 'id': return 'Digite o ID...';
            case 'data': return 'Digite a data (DD/MM/YYYY)...';
            case 'observacao': return 'Digite parte da observação...';
            default: return 'Digite o termo...';
        }
    }
    // -------------------------------------------------------------

    return (
        <>
            <NavBar active="agendamento" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="text-3xl font-bold mb-6 text-center">Buscar Agendamentos</h1>

                {/* Formulário de Busca */}
                <form onSubmit={handleSearch} className="mb-8 p-6 bg-slate-800 rounded-lg shadow-lg flex flex-col md:flex-row gap-4 items-end">
                    {/* Select para tipo de busca */}
                    <div className="w-full md:w-auto">
                        <label htmlFor="tipoBusca" className="block text-sm font-medium mb-1 text-slate-300">Buscar por:</label>
                        <select id="tipoBusca" name="tipoBusca" className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500" value={tipoBusca} onChange={(e) => { setTipoBusca(e.target.value as TipoBuscaAgendamento); setTermoBusca(''); setResultadosBusca([]); setBuscaRealizada(false); }}>
                            <option value="observacao">Observação</option>
                            <option value="id">ID</option>
                            <option value="data">Data (DD/MM/YYYY)</option>
                        </select>
                    </div>
                    {/* Input único para termo */}
                    <div className="flex-1 min-w-0">
                        <label htmlFor="termoBusca" className="block text-sm font-medium mb-1 text-slate-300">Termo de Busca:</label>
                        <input type={tipoBusca === 'id' ? 'number' : 'text'} id="termoBusca" className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} placeholder={getPlaceholder()} required />
                    </div>
                    <button type="submit" className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500 whitespace-nowrap" disabled={isLoading || isSearching}>
                        {isSearching ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>

                {/* Mensagens e Tabela de Resultados (lógica similar à listagem/busca cliente) */}
                {isLoading && <p className="text-center text-sky-300 py-4">Carregando...</p>}
                {error && ( <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert"><span className="block sm:inline">{error}</span><button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-2xl" aria-hidden="true">&times;</span></button></div> )}
                {/* Sucesso é modal */}

                {!isLoading && buscaRealizada && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow mt-6">
                        <h2 className="text-xl font-semibold p-4 bg-slate-800 rounded-t-lg">Resultados da Busca</h2>
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
                            {isSearching ? ( <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-400">Buscando...</td></tr>
                            ) : resultadosBusca.length === 0 ? ( <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-400">Nenhum agendamento encontrado.</td></tr>
                            ) : (
                                resultadosBusca.map((agendamento) => (
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

            {/* Modais de Deleção (iguais aos da listagem) */}
            {showDeleteModal && agendamentoParaDeletar && ( <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4" onClick={cancelDelete}><div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full z-50 border border-red-500" onClick={(e) => e.stopPropagation()}><h3 className="text-xl font-semibold text-red-400 mb-4">Confirmar Exclusão</h3><p className="text-white mb-3">Tem certeza?</p><div className='text-slate-300 text-sm mb-6 border-l-2 border-red-500 pl-3'><p><strong>ID:</strong> {agendamentoParaDeletar.id}</p><p><strong>Data:</strong> {agendamentoParaDeletar.dataAgendamento}</p><p><strong>Obs:</strong> {agendamentoParaDeletar.observacao}</p></div><div className="flex justify-end gap-4"><button type="button" className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md" onClick={cancelDelete} disabled={isDeleting}>Não</button><button type="button" className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? 'Excluindo...' : 'Sim'}</button></div></div></div> )}
            {showDeleteSuccessModal && ( <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4" onClick={closeSuccessModal}><div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full z-50 border border-green-500" onClick={(e) => e.stopPropagation()}><h3 className="text-xl font-semibold text-green-400 mb-4 text-center">Sucesso!</h3><p className="text-white mb-6 text-center">Agendamento excluído.</p><div className="flex justify-center"><button type="button" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md" onClick={closeSuccessModal}>OK</button></div></div></div> )}
        </>
    );
}
