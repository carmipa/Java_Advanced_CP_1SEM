"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';
// Ícones que adicionamos:
import { MdDeleteForever, MdCancel, MdErrorOutline, MdWarningAmber } from 'react-icons/md';

interface AgendamentoInfo {
    id: number;
    dataAgendamento: string;
    observacao: string | null;
}

export default function DeletarAgendamentoPage() {
    const params = useParams();
    const router = useRouter();
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : null;

    const [agendamentoInfo, setAgendamentoInfo] = useState<AgendamentoInfo | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            setIsLoadingInfo(true);
            setError(null);
            const fetchAgendamentoData = async () => {
                try {
                    const apiUrl = `http://localhost:8080/rest/agenda/${id}`;
                    const response = await fetch(apiUrl);
                    if (response.status === 404) throw new Error("Agendamento não encontrado para confirmar exclusão.");
                    if (!response.ok) throw new Error(`Erro ao buscar dados: ${response.statusText}`);
                    const data: AgendamentoInfo = await response.json();
                    setAgendamentoInfo(data);
                } catch (err: any) {
                    setError(err.message || "Falha ao carregar dados do agendamento para exclusão.");
                    setAgendamentoInfo(null);
                } finally {
                    setIsLoadingInfo(false);
                }
            };
            fetchAgendamentoData();
        } else {
            setError("ID do agendamento inválido na URL.");
            setIsLoadingInfo(false);
        }
    }, [id]);

    const handleConfirmDelete = async () => {
        if (!id) {
            setError("Não é possível excluir: ID inválido.");
            return;
        }
        setIsDeleting(true);
        setError(null);

        try {
            const apiUrl = `http://localhost:8080/rest/agenda/${id}`;
            const response = await fetch(apiUrl, { method: 'DELETE' });

            if (!response.ok) {
                const errorText = await response.text().catch(() => `Erro ${response.status}`);
                throw new Error(`Falha ao excluir agendamento: ${errorText || response.statusText}`);
            }
            console.log(`Agendamento ID ${id} excluído com sucesso.`);
            router.push('/agendamento/listar');
        } catch (err: any) {
            setError(err.message || "Falha ao excluir agendamento.");
            setIsDeleting(false);
        }
    };

    const handleCancel = () => {
        router.push('/agendamento/listar');
    };

    if (isLoadingInfo) {
        return (
            <>
                <NavBar active="agendamento" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                    <p className="text-center text-sky-300 py-10">Carregando dados para confirmação...</p>
                </main>
            </>
        );
    }

    if (error || !id) {
        return (
            <>
                <NavBar active="agendamento" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                    <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg mx-auto">
                        <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center text-red-400">
                            <MdErrorOutline className="text-3xl" />
                            Erro
                        </h2>
                        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500 mb-6">{error || "ID não fornecido."}</p>
                        <div className="text-center">
                            <button onClick={handleCancel} className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700">
                                <MdCancel /> Voltar
                            </button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (!agendamentoInfo) {
        return (
            <>
                <NavBar active="agendamento" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                    <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg mx-auto">
                        <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center text-yellow-400">
                            <MdWarningAmber className="text-3xl" />
                            Agendamento Não Encontrado
                        </h2>
                        <p className="text-center text-yellow-400 bg-yellow-900/50 p-3 rounded border border-yellow-500 mb-6">
                            O agendamento ID {id} não foi encontrado ou pode já ter sido excluído.
                        </p>
                        <div className="text-center">
                            <button onClick={handleCancel} className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700">
                                <MdCancel /> Voltar
                            </button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <NavBar active="agendamento" />
            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
                <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg border border-red-500">
                    <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-4 text-center text-red-400">
                        <MdDeleteForever className="text-3xl" />
                        Confirmar Exclusão
                    </h2>
                    <p className="text-center mb-6">Tem certeza que deseja excluir o seguinte agendamento?</p>

                    <div className="text-slate-300 text-sm mb-8 border-l-2 border-red-500 pl-4 bg-slate-800 p-4 rounded">
                        <p><strong>ID:</strong> {agendamentoInfo.id}</p>
                        <p><strong>Data:</strong> {new Date(agendamentoInfo.dataAgendamento + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                        <p><strong>Observação:</strong> {agendamentoInfo.observacao || '-'}</p>
                    </div>

                    {error && (
                        <p className="text-center text-red-400 mb-4">{error}</p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                        <button
                            onClick={handleConfirmDelete}
                            className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-red-600 rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Excluindo...' : (<><MdDeleteForever /> Sim, Excluir</>)}
                        </button>

                        <button
                            onClick={handleCancel}
                            className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                            disabled={isDeleting}
                        >
                            <MdCancel /> Não, Cancelar
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}
