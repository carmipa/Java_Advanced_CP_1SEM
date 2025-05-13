// app/oficinaOnline/listar/page.tsx (COM ORDENAÇÃO POR ID ASCENDENTE)
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/navigation'; // Removido se não usar
import NavBar from '@/components/nav-bar';
import { // Ícones
    Hash, Calendar, FileText, CheckCircle, Edit3, Trash2, ClipboardList, Stethoscope
} from 'lucide-react';
import { MdErrorOutline } from 'react-icons/md'; // Para erro
import { fetchAuthenticated } from '@/utils/apiService'; // <<< Import adicionado

// --- Interfaces (sem alterações) ---
interface OficinaParaLista { id: number; dataOficina: string; descricaoProblema: string; diagnostico: string; horasTrabalhadas: string; }
interface OficinaApiResponseDto { id: number; dataOficina: string; descricaoProblema: string | null; diagnostico: string | null; partesAfetadas: string | null; horasTrabalhadas: string | null; }
// ------------------------------------

export default function ListarOficinaPage() {
    console.log("[Render] ListarOficinaPage - Iniciando renderização.");

    const [oficinas, setOficinas] = useState<OficinaParaLista[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados e Funções do Modal (sem alterações)
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
    const [oficinaParaDeletar, setOficinaParaDeletar] = useState<OficinaParaLista | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // const router = useRouter();

    const fetchOficinas = async () => {
        console.log("[Fetch] Iniciando fetchOficinas...");
        setIsLoading(true);
        setError(null);
        setShowDeleteConfirmModal(false);
        setShowDeleteSuccessModal(false);
        setOficinaParaDeletar(null);

        console.log("[Fetch] Buscando dados de: /rest/oficina/all");
        try {
            // <<< chamada substituída
            const response = await fetchAuthenticated("/rest/oficina/all");
            console.log(`[Fetch] Status: ${response.status}`);
            if (!response.ok) {
                const errorBody = await response.text().catch(() => '');
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}. ${errorBody}`);
            }

            if (response.status === 204) {
                setOficinas([]);
            } else {
                const data = await response.json() as OficinaApiResponseDto[];
                if (!Array.isArray(data)) throw new Error("Formato de resposta inválido.");

                // <<< ORDENAÇÃO ALTERADA PARA ASCENDENTE (a.id - b.id) >>>
                data.sort((a, b) => a.id - b.id);

                const formatted = data.map(dto => ({
                    id: dto.id,
                    dataOficina: dto.dataOficina
                        ? new Date(dto.dataOficina + 'T00:00:00Z')
                            .toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                        : 'N/A',
                    descricaoProblema: dto.descricaoProblema || '',
                    diagnostico: dto.diagnostico || 'Pendente',
                    horasTrabalhadas: dto.horasTrabalhadas || '',
                }));
                setOficinas(formatted);
            }
        } catch (err: any) {
            console.error("[Fetch] Erro:", err);
            setError(err.message || "Falha ao carregar registros.");
            setOficinas([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOficinas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Funções do Modal (sem alterações, exceto DELETE)
    const handleDeleteClick = (oficina: OficinaParaLista) => {
        setOficinaParaDeletar(oficina);
        setShowDeleteConfirmModal(true);
        setError(null);
    };
    const confirmDelete = async () => {
        if (!oficinaParaDeletar) return;
        const { id } = oficinaParaDeletar;
        setIsDeleting(true);
        setError(null);
        try {
            // <<< chamada substituída
            const response = await fetchAuthenticated(`/rest/oficina/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errText = await response.text().catch(() => response.statusText);
                throw new Error(`Erro ao deletar: ${errText}`);
            }
            setShowDeleteConfirmModal(false);
            setShowDeleteSuccessModal(true);
            setOficinas(prev => prev.filter(o => o.id !== id));
        } catch (err: any) {
            console.error("[Delete] Erro:", err);
            setError(err.message || "Falha ao excluir registro.");
            setShowDeleteConfirmModal(false);
        } finally {
            setIsDeleting(false);
        }
    };
    const cancelDelete = () => {
        setShowDeleteConfirmModal(false);
        setOficinaParaDeletar(null);
    };
    const closeSuccessModal = () => {
        setShowDeleteSuccessModal(false);
        setOficinaParaDeletar(null);
    };
    // ------------------------------------------

    // Helper para formatar data
    const formatarData = (dataString: string | null | undefined): string => {
        if (!dataString || dataString === 'N/A') return '-';
        try {
            return new Date(dataString + 'T00:00:00Z')
                .toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch (e) {
            console.error("Erro formatar data:", dataString, e);
            return 'Inválida';
        }
    };

    return (
        <>
            <NavBar active="oficinaOnline" />

            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-[calc(100vh-80px)] text-white">
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="flex items-center text-2xl md:text-3xl font-bold gap-2">
                        <FileText className="text-3xl text-sky-400" /> Registros da Oficina
                    </h1>
                    <Link href="/oficinaOnline/cadastrar">
                        <button className="flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow gap-2">
                            <CheckCircle /> Novo Diagnóstico
                        </button>
                    </Link>
                </div>

                {/* Mensagens de Loading e Erro */}
                {isLoading && (
                    <p className="text-center text-sky-300 py-10">
                        Carregando registros...
                    </p>
                )}
                {error && (
                    <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 rounded-md border border-red-500 max-w-3xl mx-auto flex items-center gap-2">
                        <MdErrorOutline /> <span>{error}</span>
                        <button
                            type="button"
                            className="absolute top-1 right-1 p-2 leading-none"
                            onClick={() => setError(null)}
                        >
                            &times;
                        </button>
                    </div>
                )}

                {/* <<< AREA PRINCIPAL COM CARDS >>> */}
                {!isLoading && !error && (
                    <div>
                        {oficinas.length === 0 ? (
                            <p className="text-center text-slate-400 py-10">
                                Nenhum registro encontrado.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {oficinas.map(oficina => (
                                    <div
                                        key={oficina.id}
                                        className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20 transition-shadow duration-300"
                                    >
                                        <div className="bg-slate-700 p-3 flex justify-between items-center text-sm">
                                            <span className="flex items-center gap-1 font-semibold text-sky-300">
                                                <Hash size={16} /> ID: {oficina.id}
                                            </span>
                                            <span className="flex items-center gap-1 text-slate-400">
                                                <Calendar size={16} /> {formatarData(oficina.dataOficina)}
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
                                                disabled={isDeleting}
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
                {/* <<< FIM DA AREA PRINCIPAL >>> */}
            </main>

            {/* Modal de Confirmação de Deleção */}
            {showDeleteConfirmModal && oficinaParaDeletar && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4" onClick={cancelDelete}>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full z-50 border border-red-500" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-red-400 mb-4">Confirmar Exclusão</h3>
                        <p className="text-white mb-3">Tem certeza que deseja excluir o registro?</p>
                        <div className="text-slate-300 text-sm mb-6 border-l-2 border-red-500 pl-3">
                            <p><strong>ID:</strong> {oficinaParaDeletar.id}</p>
                            <p><strong>Data:</strong> {formatarData(oficinaParaDeletar.dataOficina)}</p>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button onClick={cancelDelete} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md" disabled={isDeleting}>Não</button>
                            <button onClick={confirmDelete} className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isDeleting}>
                                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Sucesso da Deleção */}
            {showDeleteSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4" onClick={closeSuccessModal}>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full z-50 border border-green-500" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-green-400 mb-4 text-center">Sucesso!</h3>
                        <p className="text-white mb-6 text-center">Registro excluído.</p>
                        <div className="flex justify-center">
                            <button onClick={closeSuccessModal} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">OK</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
