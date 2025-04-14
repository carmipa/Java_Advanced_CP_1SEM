// app/oficinaOnline/cadastrar/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { IMaskInput } from 'react-imask';

// Função auxiliar para limpar máscaras (mantida, pode ser útil no futuro)
const cleanMaskedValue = (value: string): string => {
    return value.replace(/\D/g, '');
};

export default function CadastrarOficinaPage() {

    // Pega a data atual no formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    const initialState = {
        dataOficina: today, // <<< Data inicial é hoje
        descricaoProblema: "", diagnostico: "",
        partesAfetadas: "", horasTrabalhadas: ""
    };

    // Estados do Formulário
    const [dataOficina, setDataOficina] = useState(initialState.dataOficina); // <<< Estado da data
    const [descricaoProblema, setDescricaoProblema] = useState(initialState.descricaoProblema);
    const [diagnostico, setDiagnostico] = useState(initialState.diagnostico);
    const [partesAfetadas, setPartesAfetadas] = useState(initialState.partesAfetadas);
    const [horasTrabalhadas, setHorasTrabalhadas] = useState(initialState.horasTrabalhadas);

    // Estados de Controle
    const [isSaving, setIsSaving] = useState(false);
    const [isIaLoading, setIsIaLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [diagnosticoIa, setDiagnosticoIa] = useState<string | null>(null);

    // Função para Limpar o Formulário
    const resetForm = () => {
        setDataOficina(initialState.dataOficina); // <<< Reseta para data atual do carregamento
        setDescricaoProblema(initialState.descricaoProblema);
        setDiagnostico(initialState.diagnostico);
        setPartesAfetadas(initialState.partesAfetadas);
        setHorasTrabalhadas(initialState.horasTrabalhadas);
        setError(null);
        setDiagnosticoIa(null);
    };

    // Função para BUSCAR diagnóstico na IA (mantida)
    const handleBuscaIa = async () => {
        if (!descricaoProblema || descricaoProblema.trim() === '') {
            setError("Por favor, descreva o problema antes de buscar na IA."); return; }
        setIsIaLoading(true); setError(null); setDiagnosticoIa(null); setSuccess(null);
        try {
            const apiUrl = `/rest/ia/diagnostico?descricao=${encodeURIComponent(descricaoProblema)}`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorText = await response.text().catch(() => `Erro ${response.status}`);
                throw new Error(`Falha ao buscar diagnóstico IA: ${errorText || response.statusText}`);
            }
            const diagnosticoGerado = await response.text();
            setDiagnosticoIa(diagnosticoGerado);
            setDiagnostico(diagnosticoGerado);
        } catch (err: any) {
            setError(err.message || "Falha ao comunicar com o serviço de IA.");
            setDiagnosticoIa("Falha ao obter diagnóstico.");
        } finally { setIsIaLoading(false); }
    };

    // Função para SALVAR o registro completo (mantida)
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true); setError(null); setSuccess(null);

        const oficinaData = { // <<< O estado dataOficina já tem o valor correto
            dataOficina, descricaoProblema, diagnostico,
            partesAfetadas, horasTrabalhadas
        };

        console.log('Salvando registro no BD:', JSON.stringify(oficinaData, null, 2));
        const apiUrl = "http://localhost:8080/rest/oficina";

        try {
            const response = await fetch(apiUrl, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(oficinaData), });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}.` }));
                throw new Error(errorData.message || `Erro ${response.status}`); }
            const result = await response.json();
            console.log("Save Success:", result);
            setSuccess("Registro de oficina salvo com sucesso!");
            resetForm();
            setTimeout(() => { setSuccess(null); }, 5000);
        } catch (err: any) { setError(err.message || "Falha ao salvar registro de oficina.");
        } finally { setIsSaving(false); }
    };

    // Formata a data para exibição (DD/MM/YYYY)
    const formattedDate = new Date(dataOficina + 'T00:00:00').toLocaleDateString('pt-BR');

    return (
        <>
            <NavBar active="oficinaOnline" />

            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
                <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-2xl">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Novo Registro de Oficina / Diagnóstico</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Mensagens de Erro/Sucesso */}
                        {error && ( <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert"><span className="block sm:inline">{error}</span><button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-2xl" aria-hidden="true">&times;</span></button></div> )}
                        {/* Mensagem de sucesso será exibida acima dos botões */}

                        {/* Campos do Formulário */}
                        {/* === CAMPO DE DATA ALTERADO === */}
                        <div className="mb-4">
                            <label htmlFor="dataOficinaDisplay" className="block mb-1">Data do Registro:</label>
                            <p
                                id="dataOficinaDisplay"
                                className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-slate-300" // Estilo para parecer "travado"
                            >
                                {formattedDate} {/* Exibe a data formatada */}
                            </p>
                            {/* O valor real vem do estado 'dataOficina' e é enviado no handleSubmit */}
                        </div>
                        {/* ============================== */}

                        <div className="mb-4">
                            <label htmlFor="descricaoProblema" className="block mb-1">Descrição do Problema (Cliente):</label>
                            <textarea id="descricaoProblema" name="descricaoProblema" rows={4} required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={descricaoProblema} onChange={(e) => setDescricaoProblema(e.target.value)} maxLength={500} />
                        </div>
                        <div className="mb-6 text-center">
                            <button type="button" onClick={handleBuscaIa} className={`px-5 py-2 font-semibold text-white bg-indigo-600 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isIaLoading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isIaLoading || !descricaoProblema}>
                                {isIaLoading ? 'Buscando na IA...' : 'Buscar Diagnóstico na IA'}
                            </button>
                        </div>
                        {diagnosticoIa !== null && (
                            <div className="mb-4 p-4 bg-slate-800 border border-slate-700 rounded">
                                <label className="block mb-2 font-semibold text-sky-300">Resultado da IA:</label>
                                <pre className="text-sm whitespace-pre-wrap break-words">{diagnosticoIa}</pre>
                            </div>
                        )}

                        <div className="mb-4">
                            <label htmlFor="diagnostico" className="block mb-1">Diagnóstico Final (Editável):</label>
                            <textarea id="diagnostico" name="diagnostico" rows={4} required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} maxLength={4000} />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="partesAfetadas" className="block mb-1">Partes Afetadas (Sugestão/Manual):</label>
                            <input type="text" id="partesAfetadas" name="partesAfetadas" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={partesAfetadas} onChange={(e) => setPartesAfetadas(e.target.value)} maxLength={500} />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="horasTrabalhadas" className="block mb-1">Tempo para gasto para solução: (Texto):</label>
                            <input type="text" id="horasTrabalhadas" name="horasTrabalhadas" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={horasTrabalhadas} onChange={(e) => setHorasTrabalhadas(e.target.value)} maxLength={5} placeholder="Ex: 2.5" />
                            <p className="text-xs text-slate-400 mt-1">Nota: Campo definido como texto no backend.</p>
                        </div>

                        {/* Mensagem de Sucesso Simples */}
                        {success && (
                            <p className="text-center text-green-400 mb-4">{success}</p>
                        )}

                        {/* Botão de Ação Único (Salvar) */}
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <button type="submit" className={`px-6 py-3 font-semibold text-white bg-sky-600 rounded-md shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isSaving || isIaLoading}>
                                {isSaving ? 'Salvando...' : 'Salvar Registro'}
                            </button>
                            {/* Botão Voltar Removido */}
                        </div>
                    </form>
                </div>
            </main>

            {/* Estilos CSS Globais */}
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: white !important; }
                input[type="date"]::-webkit-datetime-edit { color: white; }
            `}</style>
        </>
    );
}
