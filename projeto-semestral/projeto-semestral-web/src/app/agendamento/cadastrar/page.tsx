// app/agendamento/cadastrar/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdEventAvailable, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle } from 'react-icons/md'; // Ícones adicionados

export default function CadastrarAgendamentoPage() {
    const today = new Date().toISOString().split('T')[0];
    const initialState = {
        dataAgendamento: today,
        observacao: ""
    };

    // Estados do Formulário
    const [dataAgendamento, setDataAgendamento] = useState(initialState.dataAgendamento);
    const [observacao, setObservacao] = useState(initialState.observacao);

    // Estados de Controle
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Função para Limpar o Formulário
    const resetForm = () => {
        setDataAgendamento(initialState.dataAgendamento);
        setObservacao(initialState.observacao);
        setError(null);
    };

    // Função para Submeter o Formulário
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true); setError(null); setSuccess(null);

        const agendamentoData = { dataAgendamento, observacao };

        console.log('Salvando agendamento:', JSON.stringify(agendamentoData, null, 2));
        const apiUrl = "http://localhost:8080/rest/agenda";

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agendamentoData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}.` }));
                throw new Error(errorData.message || `Erro ${response.status}`);
            }

            const result = await response.json();
            console.log("Save Success:", result);
            setSuccess("Agendamento criado com sucesso!");
            resetForm();
            setTimeout(() => { setSuccess(null); }, 5000);

        } catch (err: any) {
            setError(err.message || "Falha ao criar agendamento.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <NavBar active="agendamento" />
            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
                <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg">
                    {/* Título com ícone */}
                    <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center">
                        <MdEventAvailable className="text-3xl" />
                        Novo Agendamento
                    </h2>

                    <form onSubmit={handleSubmit}>
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

                        {/* Campos do Formulário */}
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

                        {/* Botões de Ação */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                            <button
                                type="submit"
                                className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-sky-600 rounded-md shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Salvando...' : (<><MdSave /> Salvar Agendamento</>)}
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
