// app/oficinaOnline/buscar/page.tsx
"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';

// --- Interfaces para Tipagem (Reutilizadas/Adaptadas da Listagem) ---
interface OficinaParaLista {
    id: number;
    dataOficina: string;
    descricaoProblema: string;
    diagnostico: string;
    horasTrabalhadas: string; // Pode ser útil mostrar
}

interface OficinaApiResponseDto {
    id: number;
    dataOficina: string;
    descricaoProblema: string;
    diagnostico: string;
    partesAfetadas: string;
    horasTrabalhadas: string;
}
// --------------------------------------------------------------------

// Define os tipos de busca possíveis para Oficina
type TipoBuscaOficina = 'id' | 'descricao' | 'diagnostico';

export default function BuscarOficinaPage() {
    const [todasOficinas, setTodasOficinas] = useState<OficinaParaLista[]>([]); // Guarda todos os registros
    const [resultadosBusca, setResultadosBusca] = useState<OficinaParaLista[]>([]); // Guarda os resultados filtrados
    const [tipoBusca, setTipoBusca] = useState<TipoBuscaOficina>('descricao'); // <<< Padrão: buscar por descrição
    const [termoBusca, setTermoBusca] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Loading para fetch inicial
    const [isSearching, setIsSearching] = useState(false); // Loading para busca/filtro
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null); // Para msg de delete
    const [buscaRealizada, setBuscaRealizada] = useState(false);

    // --- Estados para o Modal de Deleção ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [oficinaParaDeletar, setOficinaParaDeletar] = useState<OficinaParaLista | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
    // -----------------------------------------

    const router = useRouter();

    // --- Função para buscar TODOS os registros da API (apenas uma vez) ---
    const fetchTodasOficinas = async () => {
        if (todasOficinas.length > 0) return;
        setIsLoading(true); setError(null); setSuccess(null);
        try {
            const response = await fetch("http://localhost:8080/rest/oficina/all");
            if (!response.ok) { throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`); }
            const data: OficinaApiResponseDto[] = await response.json();
            const oficinasFormatadas: OficinaParaLista[] = data.map(dto => ({
                id: dto.id,
                dataOficina: dto.dataOficina ? new Date(dto.dataOficina + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A',
                descricaoProblema: dto.descricaoProblema || 'N/A',
                diagnostico: dto.diagnostico || 'Pendente',
                horasTrabalhadas: dto.horasTrabalhadas || 'N/A',
            }));
            setTodasOficinas(oficinasFormatadas);
        } catch (err: any) { setError(err.message || "Falha ao carregar dados base da oficina.");
        } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchTodasOficinas(); }, []);

    // --- Função para realizar a busca/filtro (CLIENT-SIDE) ---
    const handleSearch = (event?: FormEvent<HTMLFormElement>) => {
        if (event) event.preventDefault();
        setIsSearching(true); setBuscaRealizada(true); setSuccess(null); setError(null);
        const query = termoBusca.trim().toLowerCase();
        if (!query) { setResultadosBusca([]); setIsSearching(false); return; }

        let resultados: OficinaParaLista[] = [];

        switch (tipoBusca) {
            case 'id':
                resultados = todasOficinas.filter(o => o.id.toString() === query.replace(/\D/g, ''));
                break;
            case 'descricao':
                resultados = todasOficinas.filter(o => o.descricaoProblema.toLowerCase().includes(query));
                break;
            case 'diagnostico':
                resultados = todasOficinas.filter(o => o.diagnostico.toLowerCase().includes(query));
                break;
            default:
                resultados = [];
        }
        setResultadosBusca(resultados);
        setIsSearching(false);
    };

    // --- Funções de Deleção com Modal (adaptadas para Oficina) ---
    const handleDeleteClick = (oficina: OficinaParaLista) => {
        setOficinaParaDeletar(oficina); setShowDeleteModal(true); setError(null); setSuccess(null); };

    const confirmDelete = async () => {
        if (!oficinaParaDeletar) return;
        setIsDeleting(true); setError(null); setSuccess(null);
        const { id } = oficinaParaDeletar;
        try {
            const response = await fetch(`http://localhost:8080/rest/oficina/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorText = await response.text().catch(() => `Erro ${response.status}`);
                throw new Error(`Falha ao deletar registro: ${errorText || response.statusText}`); }
            setShowDeleteModal(false); setShowDeleteSuccessModal(true);
            // Remove da lista completa E dos resultados da busca atual
            setTodasOficinas(prev => prev.filter(o => o.id !== id));
            setResultadosBusca(prev => prev.filter(o => o.id !== id));
        } catch (err: any) { setError(err.message || "Falha ao excluir registro."); setShowDeleteModal(false);
        } finally { setIsDeleting(false); }
    };

    const cancelDelete = () => { setShowDeleteModal(false); setOficinaParaDeletar(null); };
    const closeSuccessModal = () => { setShowDeleteSuccessModal(false); setOficinaParaDeletar(null); };
    // -------------------------------------------------------------

    // Define placeholder dinâmico
    const getPlaceholder = (): string => {
        switch (tipoBusca) {
            case 'id': return 'Digite o ID do Registro...';
            case 'descricao': return 'Digite parte da descrição do problema...';
            case 'diagnostico': return 'Digite parte do diagnóstico...';
            default: return 'Digite o termo de busca...';
        }
    }

    return (
        <>
            <NavBar active="oficinaOnline" /> {/* Define item ativo na NavBar */}

            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="text-3xl font-bold mb-6 text-center">Buscar Registros da Oficina</h1>

                {/* Formulário de Busca */}
                <form onSubmit={handleSearch} className="mb-8 p-6 bg-slate-800 rounded-lg shadow-lg flex flex-col md:flex-row gap-4 items-end">
                    {/* Select para escolher o tipo de busca */}
                    <div className="w-full md:w-auto">
                        <label htmlFor="tipoBusca" className="block text-sm font-medium mb-1 text-slate-300">Buscar por:</label>
                        <select
                            id="tipoBusca"
                            name="tipoBusca"
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            value={tipoBusca}
                            onChange={(e) => { setTipoBusca(e.target.value as TipoBuscaOficina); setTermoBusca(''); setResultadosBusca([]); setBuscaRealizada(false); }}
                        >
                            <option value="descricao">Descrição Problema</option>
                            <option value="id">ID Registro</option>
                            <option value="diagnostico">Diagnóstico</option>
                        </select>
                    </div>

                    {/* Input único para o termo de busca */}
                    <div className="flex-1 min-w-0">
                        <label htmlFor="termoBusca" className="block text-sm font-medium mb-1 text-slate-300">Termo de Busca:</label>
                        <input
                            type={tipoBusca === 'id' ? 'number' : 'text'}
                            id="termoBusca"
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            placeholder={getPlaceholder()}
                            required
                        />
                    </div>

                    <button type="submit" className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500 whitespace-nowrap" disabled={isLoading || isSearching}>
                        {isSearching ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>

                {/* Exibição de Loading Inicial e Erro/Sucesso (delete) */}
                {isLoading && <p className="text-center text-sky-300 py-4">Carregando dados base...</p>}
                {error && ( <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert"><span className="block sm:inline">{error}</span><button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-2xl" aria-hidden="true">&times;</span></button></div> )}
                {/* Mensagem de sucesso do delete será via modal */}

                {/* Tabela de Resultados da Busca */}
                {!isLoading && buscaRealizada && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow mt-6">
                        <h2 className="text-xl font-semibold p-4 bg-slate-800 rounded-t-lg">Resultados da Busca</h2>
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Descrição Problema</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Diagnóstico</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {isSearching ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400">Buscando...</td></tr>
                            ) : resultadosBusca.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400">Nenhum registro encontrado.</td></tr>
                            ) : (
                                resultadosBusca.map((oficina) => (
                                    <tr key={oficina.id} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{oficina.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{oficina.dataOficina}</td>
                                        <td className="px-6 py-4 whitespace-normal max-w-xs truncate" title={oficina.descricaoProblema}>{oficina.descricaoProblema}</td>
                                        <td className="px-6 py-4 whitespace-normal max-w-xs truncate" title={oficina.diagnostico}>{oficina.diagnostico}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                            {/* Link para Edição */}
                                            {oficina.id ? (
                                                <Link href={`/oficinaOnline/alterar/${oficina.id}`}>
                                                    <button className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded" disabled={isDeleting}>Alterar</button>
                                                </Link>
                                            ) : ( <button className="px-3 py-1 text-sm bg-gray-500 text-black rounded cursor-not-allowed" disabled>Editar</button> )}
                                            {/* Botão Deletar */}
                                            <button onClick={() => handleDeleteClick(oficina)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded" disabled={isDeleting || !oficina.id}>
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
            {showDeleteModal && oficinaParaDeletar && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4" onClick={cancelDelete}>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full z-50 border border-red-500" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-red-400 mb-4">Confirmar Exclusão</h3>
                        <p className="text-white mb-3">Tem certeza que deseja excluir este registro?</p>
                        <div className='text-slate-300 text-sm mb-6 border-l-2 border-red-500 pl-3'>
                            <p><strong>ID:</strong> {oficinaParaDeletar.id}</p>
                            <p><strong>Data:</strong> {oficinaParaDeletar.dataOficina}</p>
                            <p><strong>Problema:</strong> {oficinaParaDeletar.descricaoProblema}</p>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button type="button" className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md" onClick={cancelDelete} disabled={isDeleting}>
                                Não, cancelar
                            </button>
                            <button type="button" className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={confirmDelete} disabled={isDeleting}>
                                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
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
                        <p className="text-white mb-6 text-center">Registro de oficina excluído.</p>
                        <div className="flex justify-center">
                            <button type="button" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md" onClick={closeSuccessModal}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
