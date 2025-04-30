// app/oficinaOnline/listar/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';
import {
    Hash,
    Calendar,
    FileText,
    CheckCircle,
    Edit3,
    Trash2
} from 'lucide-react';

// --- Interfaces para Tipagem (Verifique se corresponde à sua API) ---
interface OficinaParaLista {
    id: number;
    dataOficina: string; // Data formatada
    descricaoProblema: string;
    diagnostico: string;
    horasTrabalhadas: string;
}
interface OficinaApiResponseDto {
    id: number;
    dataOficina: string; // Vem como YYYY-MM-DD
    descricaoProblema: string | null;
    diagnostico: string | null;
    partesAfetadas: string | null;
    horasTrabalhadas: string | null;
}
// --------------------------------------------------------------------

export default function ListarOficinaPage() {
    console.log("[Render] ListarOficinaPage - Iniciando renderização.");

    const [oficinas, setOficinas] = useState<OficinaParaLista[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
    const [oficinaParaDeletar, setOficinaParaDeletar] = useState<OficinaParaLista | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();
    console.log("[Render] Hooks useState e useRouter inicializados.");

    const fetchOficinas = async () => {
        console.log("[Fetch] Iniciando fetchOficinas...");
        setIsLoading(true);
        setError(null);
        setShowDeleteConfirmModal(false);
        setShowDeleteSuccessModal(false);
        setOficinaParaDeletar(null);

        const apiUrl = "http://localhost:8080/rest/oficina/all";
        console.log(`[Fetch] Buscando dados de: ${apiUrl}`);

        try {
            const response = await fetch(apiUrl);
            console.log(`[Fetch] Status: ${response.status}`);

            if (!response.ok) {
                let errorBody = '';
                try { errorBody = await response.text(); }
                catch {}
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}. ${errorBody}`);
            }

            if (response.status === 204) {
                setOficinas([]);
            } else {
                const data = await response.json() as OficinaApiResponseDto[];
                if (!Array.isArray(data)) {
                    throw new Error("Formato de resposta inválido.");
                }
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
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOficinas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            const deleteUrl = `http://localhost:8080/rest/oficina/${id}`;
            const response = await fetch(deleteUrl, { method: 'DELETE' });
            if (!response.ok) {
                const errText = await response.text().catch(() => response.statusText);
                throw new Error(`Erro ao deletar: ${errText}`);
            }
            setShowDeleteConfirmModal(false);
            setShowDeleteSuccessModal(true);
            setOficinas(prev => prev.filter(o => o.id !== id));
        } catch (err: any) {
            console.error("[Delete] Erro:", err);
            setError(err.message);
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

    return (
        <>
            <NavBar active="oficinaOnline" />

            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-[calc(100vh-80px)] text-white">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="flex items-center text-3xl font-bold">
                        <FileText className="mr-2 text-2xl text-sky-400" />
                        Registros da Oficina
                    </h1>
                    <Link href="/oficinaOnline/cadastrar">
                        <button className="flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md shadow">
                            <CheckCircle className="mr-2" />
                            Novo Diagnóstico
                        </button>
                    </Link>
                </div>

                {isLoading && (
                    <p className="text-center text-sky-300 py-4">Carregando...</p>
                )}
                {error && (
                    <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 rounded-md border border-red-500">
                        <strong className="font-bold">Erro: </strong>
                        <span>{error}</span>
                        <button
                            type="button"
                            className="absolute top-0 right-0 p-2"
                            onClick={() => setError(null)}
                        >
                            &times;
                        </button>
                    </div>
                )}

                {!isLoading && !error && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    <Hash className="inline mr-1" />
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    <Calendar className="inline mr-1" />
                                    Data
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    <FileText className="inline mr-1" />
                                    Descrição Problema
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    <CheckCircle className="inline mr-1" />
                                    Diagnóstico
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {oficinas.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-slate-400">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            ) : (
                                oficinas.map(oficina => (
                                    <tr key={oficina.id} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{oficina.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{oficina.dataOficina}</td>
                                        <td className="px-6 py-4 whitespace-normal max-w-xs truncate" title={oficina.descricaoProblema}>
                                            {oficina.descricaoProblema}
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal max-w-xs truncate" title={oficina.diagnostico}>
                                            {oficina.diagnostico}
                                        </td>
                                        <td className="px-6 py-4 text-center space-x-2">
                                            <Link href={`/oficinaOnline/alterar/${oficina.id}`}>
                                                <button className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-sm">
                                                    <Edit3 className="mr-1" />
                                                    Editar
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(oficina)}
                                                className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="mr-1" />
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

            {showDeleteConfirmModal && oficinaParaDeletar && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4" onClick={cancelDelete}>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full z-50 border border-red-500" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-red-400 mb-4">Confirmar Exclusão</h3>
                        <p className="text-white mb-3">Tem certeza que deseja excluir o registro?</p>
                        <div className="text-slate-300 text-sm mb-6 border-l-2 border-red-500 pl-3">
                            <p><strong>ID:</strong> {oficinaParaDeletar.id}</p>
                            <p><strong>Data:</strong> {oficinaParaDeletar.dataOficina}</p>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button onClick={cancelDelete} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md">Não</button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">
                                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4" onClick={closeSuccessModal}>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full z-50 border border-green-500" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-green-400 mb-4 text-center">Sucesso!</h3>
                        <p className="text-white mb-6 text-center">Registro excluído.</p>
                        <div className="flex justify-center">
                            <button onClick={closeSuccessModal} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
