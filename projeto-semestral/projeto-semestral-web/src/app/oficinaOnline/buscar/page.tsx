// app/oficinaOnline/buscar/page.tsx (VERSÃO COM CARDS NOS RESULTADOS)
"use client";

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';
import { // Ícones necessários para o formulário e cards
    MdSearch, MdFilterList, MdEdit, MdDelete, MdErrorOutline, MdFindInPage,
    MdCalendarToday, MdOutlineEditNote, MdOutlineReportProblem
} from 'react-icons/md';
import {
    Hash, Calendar, FileText, CheckCircle, Edit3, Trash2, ClipboardList, Stethoscope
} from 'lucide-react'; // Usando Lucide consistentemente
import { fetchAuthenticated } from '@/utils/apiService'; // <<< Import adicionado

// --- Interfaces (sem alterações) ---
interface OficinaParaLista {
    id: number;
    dataOficina: string;
    descricaoProblema: string;
    diagnostico: string;
    horasTrabalhadas: string;
}
interface OficinaApiResponseDto {
    id: number;
    dataOficina: string;
    descricaoProblema: string | null;
    diagnostico: string | null;
    partesAfetadas: string | null;
    horasTrabalhadas: string | null;
}
// ---------------------------------

type TipoBuscaOficina = 'id' | 'descricao' | 'diagnostico';

export default function BuscarOficinaPage() {
    const [todasOficinas, setTodasOficinas] = useState<OficinaParaLista[]>([]);
    const [resultadosBusca, setResultadosBusca] = useState<OficinaParaLista[]>([]);
    const [tipoBusca, setTipoBusca] = useState<TipoBuscaOficina>('descricao');
    const [termoBusca, setTermoBusca] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [buscaRealizada, setBuscaRealizada] = useState(false);

    // Estados e Funções do Modal (sem alterações)
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [oficinaParaDeletar, setOficinaParaDeletar] = useState<OficinaParaLista | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);

    const router = useRouter();

    // Fetch inicial de todos os dados
    const fetchTodasOficinas = async () => {
        if (todasOficinas.length > 0 && !isLoading) return;
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // <<< chamada substituída
            const response = await fetchAuthenticated("/rest/oficina/all");
            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }
            if (response.status === 204) {
                setTodasOficinas([]);
                return;
            }
            const data: OficinaApiResponseDto[] = await response.json();
            if (!Array.isArray(data)) {
                throw new Error("Formato de resposta inválido.");
            }
            const oficinasFormatadas: OficinaParaLista[] = data.map(dto => ({
                id: dto.id,
                dataOficina: dto.dataOficina
                    ? new Date(dto.dataOficina + 'T00:00:00Z')
                        .toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                    : 'N/A',
                descricaoProblema: dto.descricaoProblema || 'N/A',
                diagnostico: dto.diagnostico || 'Pendente',
                horasTrabalhadas: dto.horasTrabalhadas || 'N/A',
            }));
            setTodasOficinas(oficinasFormatadas);
        } catch (err: any) {
            setError(err.message || "Falha ao carregar dados base da oficina.");
            setTodasOficinas([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTodasOficinas();
    }, []);

    // Handle da busca client-side (sem alterações na lógica)
    const handleSearch = (event?: FormEvent<HTMLFormElement>) => {
        if (event) event.preventDefault();
        setIsSearching(true);
        setBuscaRealizada(true);
        setSuccess(null);
        setError(null);

        const query = termoBusca.trim().toLowerCase();

        if (isLoading || todasOficinas.length === 0) {
            setResultadosBusca([]);
            setIsSearching(false);
            if (!isLoading) setError("Dados base não carregados. Tente recarregar a página.");
            return;
        }

        if (!query && tipoBusca !== 'id') {
            setResultadosBusca([]);
            setIsSearching(false);
            return;
        }

        let resultados: OficinaParaLista[] = [];
        switch (tipoBusca) {
            case 'id':
                const idNum = parseInt(query.replace(/\D/g, ''), 10);
                resultados = isNaN(idNum)
                    ? []
                    : todasOficinas.filter(o => o.id === idNum);
                break;
            case 'descricao':
                resultados = todasOficinas.filter(o =>
                    o.descricaoProblema.toLowerCase().includes(query)
                );
                break;
            case 'diagnostico':
                resultados = todasOficinas.filter(o =>
                    o.diagnostico.toLowerCase().includes(query)
                );
                break;
            default:
                resultados = [];
        }
        setResultadosBusca(resultados);
        setIsSearching(false);
    };

    // Funções de Deleção
    const handleDeleteClick = (oficina: OficinaParaLista) => {
        setOficinaParaDeletar(oficina);
        setShowDeleteModal(true);
        setError(null);
        setSuccess(null);
    };
    const confirmDelete = async () => {
        if (!oficinaParaDeletar) return;
        setIsDeleting(true);
        setError(null);
        setSuccess(null);
        const { id } = oficinaParaDeletar;
        try {
            // <<< chamada substituída
            const response = await fetchAuthenticated(`/rest/oficina/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorText = await response
                    .text()
                    .catch(() => `Erro ${response.status}`);
                throw new Error(`Falha ao deletar registro: ${errorText || response.statusText}`);
            }
            setShowDeleteModal(false);
            setShowDeleteSuccessModal(true);
            setTodasOficinas(prev => prev.filter(o => o.id !== id));
            setResultadosBusca(prev => prev.filter(o => o.id !== id));
        } catch (err: any) {
            setError(err.message || "Falha ao excluir registro.");
            setShowDeleteModal(false);
        } finally {
            setIsDeleting(false);
        }
    };
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setOficinaParaDeletar(null);
    };
    const closeSuccessModal = () => {
        setShowDeleteSuccessModal(false);
        setOficinaParaDeletar(null);
    };

    // Placeholder dinâmico
    const getPlaceholder = (): string => {
        switch (tipoBusca) {
            case 'id':
                return 'Digite o ID exato...';
            case 'descricao':
                return 'Digite parte da descrição...';
            case 'diagnostico':
                return 'Digite parte do diagnóstico...';
            default:
                return 'Digite o termo...';
        }
    };

    return (
        <>
            <NavBar active="oficinaOnline" />

            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Título */}
                <h1 className="flex items-center justify-center text-3xl font-bold mb-6 gap-2">
                    <MdFindInPage className="text-4xl text-sky-400" /> Buscar Registros da Oficina
                </h1>

                {/* Formulário de Busca */}
                <div className="bg-slate-800 p-4 md:p-6 rounded-lg shadow-lg max-w-3xl mx-auto mb-8">
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col md:flex-row gap-4 items-end"
                    >
                        <div className="w-full md:w-auto">
                            <label
                                htmlFor="tipoBusca"
                                className="flex items-center gap-1 block text-sm font-medium mb-1 text-slate-300"
                            >
                                <MdFilterList /> Buscar por:
                            </label>
                            <select
                                id="tipoBusca"
                                name="tipoBusca"
                                className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                value={tipoBusca}
                                onChange={e => {
                                    setTipoBusca(e.target.value as TipoBuscaOficina);
                                    setTermoBusca('');
                                    setResultadosBusca([]);
                                    setBuscaRealizada(false);
                                }}
                            >
                                <option value="descricao">Descrição Problema</option>
                                <option value="id">ID Registro</option>
                                <option value="diagnostico">Diagnóstico</option>
                            </select>
                        </div>
                        <div className="flex-grow w-full">
                            <label
                                htmlFor="termoBusca"
                                className="block text-sm font-medium mb-1 text-slate-300"
                            >
                                Termo:
                            </label>
                            <input
                                type={tipoBusca === 'id' ? 'number' : 'text'}
                                id="termoBusca"
                                className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                value={termoBusca}
                                onChange={e => setTermoBusca(e.target.value)}
                                placeholder={getPlaceholder()}
                                required={tipoBusca === 'id'}
                            />
                        </div>
                        <button
                            type="submit"
                            className="flex-shrink-0 w-full md:w-auto h-10 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500 flex items-center justify-center whitespace-nowrap"
                            disabled={isLoading || isSearching}
                        >
                            <MdSearch className="mr-2" />
                            {isSearching ? 'Buscando...' : 'Buscar'}
                        </button>
                    </form>
                </div>

                {/* Loading Inicial e Erros */}
                {isLoading && (
                    <p className="text-center text-sky-300 py-10">
                        Carregando dados base...
                    </p>
                )}
                {error && (
                    <div
                        className="relative max-w-3xl mx-auto mb-6 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500"
                        role="alert"
                    >
                        <MdErrorOutline className="inline mr-2" />
                        {error}
                        <button
                            type="button"
                            className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-red-200"
                            onClick={() => setError(null)}
                            aria-label="Fechar"
                        >
                            <span className="text-xl">&times;</span>
                        </button>
                    </div>
                )}

                {/* <<< ÁREA DE RESULTADOS: AGORA COM CARDS >>> */}
                {!isLoading && buscaRealizada && !error && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4 text-center text-sky-300">
                            Resultados da Busca
                        </h2>
                        {isSearching ? (
                            <p className="text-center text-sky-300 py-10">
                                Filtrando registros...
                            </p>
                        ) : resultadosBusca.length === 0 ? (
                            <p className="text-center text-slate-400 py-10">
                                Nenhum registro encontrado para os critérios informados.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {resultadosBusca.map(oficina => (
                                    <div
                                        key={oficina.id}
                                        className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20 transition-shadow duration-300"
                                    >
                                        <div className="bg-slate-700 p-3 flex justify-between items-center text-sm">
                                            <span className="flex items-center gap-1 font-semibold text-sky-300">
                                                <Hash size={16} /> ID: {oficina.id}
                                            </span>
                                            <span className="flex items-center gap-1 text-slate-400">
                                                <Calendar size={16} /> {oficina.dataOficina}
                                            </span>
                                        </div>
                                        <div className="p-4 space-y-3 flex-grow">
                                            <div>
                                                <h3 className="flex items-center text-base font-semibold mb-1 text-slate-200 gap-1">
                                                    <ClipboardList size={18} className="text-amber-400" /> Problema Descrito
                                                </h3>
                                                <p className="text-sm text-slate-300 break-words max-h-24 overflow-y-auto pr-1">
                                                    {oficina.descricaoProblema || '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="flex items-center text-base font-semibold mb-1 text-slate-200 gap-1">
                                                    <Stethoscope size={18} className="text-teal-400" /> Diagnóstico
                                                </h3>
                                                <p className="text-sm text-slate-300 break-words max-h-32 overflow-y-auto pr-1">
                                                    {oficina.diagnostico}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-900 p-3 mt-auto border-t border-slate-700 flex justify-end gap-2">
                                            <Link href={`/oficinaOnline/alterar/${oficina.id}`}>
                                                <button
                                                    className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-xs font-medium gap-1"
                                                    disabled={isDeleting}
                                                >
                                                    <Edit3 size={14} /> Editar
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(oficina)}
                                                className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium gap-1"
                                                disabled={isDeleting || !oficina.id}
                                            >
                                                <Trash2 size={14} /> Deletar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {/* <<< FIM DA ÁREA DE RESULTADOS >>> */}
            </main>

            {/* Modais */}
            {showDeleteModal && oficinaParaDeletar && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4"
                    onClick={cancelDelete}
                >
                    <div
                        className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full z-50 border border-red-500"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-semibold text-red-400 mb-4">
                            Confirmar Exclusão
                        </h3>
                        <p className="text-white mb-3">
                            Tem certeza que deseja excluir este registro?
                        </p>
                        <div className="text-slate-300 text-sm mb-6 border-l-2 border-red-500 pl-3">
                            <p><strong>ID:</strong> {oficinaParaDeletar.id}</p>
                            <p><strong>Data:</strong> {oficinaParaDeletar.dataOficina}</p>
                            <p><strong>Problema:</strong> {oficinaParaDeletar.descricaoProblema}</p>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md"
                                onClick={cancelDelete}
                                disabled={isDeleting}
                            >
                                Não, cancelar
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteSuccessModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
                    onClick={closeSuccessModal}
                >
                    <div
                        className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full z-50 border border-green-500"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-semibold text-green-400 mb-4 text-center">
                            Sucesso!
                        </h3>
                        <p className="text-white mb-6 text-center">
                            Registro de oficina excluído.
                        </p>
                        <div className="flex justify-center">
                            <button
                                type="button"
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md"
                                onClick={closeSuccessModal}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
