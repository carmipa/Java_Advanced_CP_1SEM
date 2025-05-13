// app/agendamento/alterar/[id]/page.tsx
"use client";
import { fetchAuthenticated } from '@/utils/apiService';
import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
// Ícones adicionados:
import { MdEditCalendar, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle } from 'react-icons/md';

interface AgendamentoApiResponseDto {
    id: number;
    dataAgendamento: string;
    observacao: string | null;
}

export default function AlterarAgendamentoPage() {
    const params = useParams();
    const router = useRouter();
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : null;

    const [dataAgendamento, setDataAgendamento] = useState("");
    const [observacao, setObservacao] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            setIsLoading(true); setError(null); setSuccess(null);
            const fetchAgendamentoData = async () => {
                try {
                    const apiUrl = `http://localhost:8080/rest/agenda/${id}`;
                    const response = await fetch(apiUrl);
                    if (response.status === 404) throw new Error("Agendamento não encontrado.");
                    if (!response.ok) throw new Error(`Erro ao buscar dados: ${response.statusText}`);
                    const data: AgendamentoApiResponseDto = await response.json();

                    setDataAgendamento(data.dataAgendamento ? data.dataAgendamento.split('T')[0] : '');
                    setObservacao(data.observacao || '');

                } catch (err: any) {
                    setError(err.message || "Falha ao carregar dados para edição.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAgendamentoData();
        } else {
            setError("ID do agendamento inválido na URL.");
            setIsLoading(false);
        }
    }, [id]);

    const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!id) { setError("ID inválido para salvar."); return; }
        setIsSaving(true); setError(null); setSuccess(null);

        const agendamentoData = { dataAgendamento, observacao };
        const apiUrl = `http://localhost:8080/rest/agenda/${id}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agendamentoData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}.` }));
                throw new Error(errorData.message || `Erro ${response.status}`);
            }

            const result = await response.json();
            console.log("Update Success:", result);
            setSuccess("Agendamento atualizado com sucesso!");
            setTimeout(() => { setSuccess(null); }, 5000);

        } catch (err: any) {
            setError(err.message || "Falha ao salvar alterações.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <NavBar active="agendamento" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                    <p className="text-center text-sky-300 py-10">Carregando dados do agendamento...</p>
                </main>
            </>
        );
    }

    if (error && !isLoading) {
        return (
            <>
                <NavBar active="agendamento" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                    <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-4xl mx-auto">
                        <h2 className="flex items-center justify-center text-2xl md:text-3xl font-bold mb-6 text-center text-red-400">
                            <MdErrorOutline className="text-3xl mr-2" />
                            Erro ao Carregar
                        </h2>
                        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500 mb-6">{error}</p>
                        <div className="text-center">
                            <Link href="/agendamento/listar">
                                <button className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700">
                                    <MdArrowBack />
                                    Voltar para Lista
                                </button>
                            </Link>
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
                <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg">
                    <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center">
                        <MdEditCalendar className="text-3xl" />
                        Alterar Agendamento (ID: {id})
                    </h2>

                    <form onSubmit={handleUpdate}>
                        {/* Mensagens */}
                        {error && (
                            <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                                <div className="flex items-center gap-2">
                                    <MdErrorOutline className="text-2xl" />
                                    <span>{error}</span>
                                </div>
                                <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar">
                                    <span className="text-2xl" aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
                                <MdCheckCircle className="text-2xl" />
                                <span>{success}</span>
                            </div>
                        )}

                        {/* Campos */}
                        <div className="mb-4">
                            <label htmlFor="dataAgendamento" className="block mb-1">Data do Agendamento:</label>
                            <input
                                type="date"
                                id="dataAgendamento"
                                name="dataAgendamento"
                                required
                                className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 date-input-fix"
                                value={dataAgendamento}
                                onChange={(e) => setDataAgendamento(e.target.value)}
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="observacao" className="block mb-1">Observação:</label>
                            <textarea
                                id="observacao"
                                name="observacao"
                                rows={5}
                                className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                value={observacao}
                                onChange={(e) => setObservacao(e.target.value)}
                                maxLength={400}
                            />
                        </div>

                        {/* Botões */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                            <button
                                type="submit"
                                className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-green-600 rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSaving || isLoading}
                            >
                                {isSaving ? 'Salvando...' : (<><MdSave /> Salvar Alterações</>)}
                            </button>

                            <Link
                                href="/agendamento/listar"
                                className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                            >
                                <MdArrowBack />
                                Voltar para Lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>

            {/* Estilos Globais */}
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: white !important; }
                input[type="date"]::-webkit-datetime-edit { color: white; }
            `}</style>
        </>
    );
}
