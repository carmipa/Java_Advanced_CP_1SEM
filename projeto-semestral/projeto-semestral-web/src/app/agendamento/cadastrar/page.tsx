// --- Arquivo: app/agendamento/cadastrar/page.tsx (Refatorado) ---
"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
// Importando Ícones (Md e Lucide)
import { MdEventAvailable, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { Calendar, ClipboardList } from 'lucide-react'; // Ícones para labels

export default function CadastrarAgendamentoPage() {
    const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const initialState = {
        dataAgendamento: today, // Inicia com hoje
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
        setDataAgendamento(initialState.dataAgendamento); // Volta para hoje
        setObservacao(initialState.observacao);
        setError(null);
        // Mantém a msg de sucesso visível por um tempo
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
            setSuccess("Agendamento criado com sucesso!"); // Define a mensagem de sucesso no estado
            resetForm(); // Limpa o formulário
            // A mensagem de sucesso some automaticamente se você tiver um setTimeout no JSX ou aqui
            setTimeout(() => { setSuccess(null); }, 5000); // Limpa a msg de sucesso após 5s

        } catch (err: any) {
            setError(err.message || "Falha ao criar agendamento.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <NavBar active="agendamento" />
            {/* Ajustado padding e alinhamento do main */}
            <main className="container mx-auto px-4 py-12 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto"> {/* Centraliza o card */}
                    {/* Título com ícone */}
                    <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-8 text-center"> {/* Aumentado mb */}
                        <MdEventAvailable className="text-3xl text-sky-400" /> {/* Ícone um pouco maior */}
                        Novo Agendamento
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5"> {/* Adicionado space-y */}
                        {/* Mensagens */}
                        {error && (
                            <div className="relative text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                                <div className="flex items-center gap-2"> <MdErrorOutline className="text-xl"/> <span>{error}</span> </div>
                                <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-xl">&times;</span></button>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center justify-center gap-2 text-green-400 p-3 rounded bg-green-900/30 border border-green-700">
                                <MdCheckCircle className="text-xl" /> <span>{success}</span>
                            </div>
                        )}

                        {/* Campos do Formulário */}
                        <div> {/* Removido mb-4, usando space-y do form */}
                            <label htmlFor="dataAgendamento" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <Calendar size={16} /> {/* Ícone adicionado */}
                                Data do Agendamento:
                            </label>
                            <input
                                type="date"
                                id="dataAgendamento"
                                name="dataAgendamento"
                                required
                                min={today} // <<< Adicionado min={today} para não permitir data passada
                                className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 date-input-fix"
                                value={dataAgendamento}
                                onChange={(e) => setDataAgendamento(e.target.value)}
                            />
                        </div>

                        <div> {/* Removido mb-6 */}
                            <label htmlFor="observacao" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <ClipboardList size={16} /> {/* Ícone adicionado */}
                                Observação:
                            </label>
                            <textarea
                                id="observacao"
                                name="observacao"
                                rows={5}
                                className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                value={observacao}
                                onChange={(e) => setObservacao(e.target.value)}
                                maxLength={400}
                                placeholder="Detalhes do serviço, solicitação do cliente, etc." // Adicionado placeholder
                            />
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"> {/* Adicionado pt-4 */}
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
                                <MdArrowBack /> Voltar para Lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>

            {/* Estilos Globais */}
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; } /* Melhorado cursor */
                /* Cor transparente para placeholder em data inválida/não preenchida */
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: white !important; }
                input[type="date"]::-webkit-datetime-edit { color: white; }
            `}</style>
        </>
    );
}