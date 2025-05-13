// src/app/oficinaOnline/cadastrar/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import NavBar from '@/components/nav-bar';
import { IMaskInput } from 'react-imask';
import {
    Calendar,
    AlertCircle,
    Cpu,
    CheckCircle,
    Box,
    Clock,
    Save,
    Wrench
} from 'lucide-react';
import { fetchAuthenticated } from '@/utils/apiService'; // <<< Import adicionado

// Auxiliar para limpar máscaras
const cleanMaskedValue = (value: string): string =>
    value.replace(/\D/g, '');

export default function CadastrarOficinaPage() {
    const today = new Date().toISOString().split('T')[0];
    const initialState = {
        dataOficina: today,
        descricaoProblema: "",
        diagnostico: "",
        partesAfetadas: "",
        horasTrabalhadas: ""
    };

    const [dataOficina, setDataOficina] = useState(initialState.dataOficina);
    const [descricaoProblema, setDescricaoProblema] = useState(initialState.descricaoProblema);
    const [diagnostico, setDiagnostico] = useState(initialState.diagnostico);
    const [partesAfetadas, setPartesAfetadas] = useState(initialState.partesAfetadas);
    const [horasTrabalhadas, setHorasTrabalhadas] = useState(initialState.horasTrabalhadas);

    const [isSaving, setIsSaving] = useState(false);
    const [isIaLoading, setIsIaLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [diagnosticoIa, setDiagnosticoIa] = useState<string | null>(null);

    const resetForm = () => {
        setDataOficina(initialState.dataOficina);
        setDescricaoProblema(initialState.descricaoProblema);
        setDiagnostico(initialState.diagnostico);
        setPartesAfetadas(initialState.partesAfetadas);
        setHorasTrabalhadas(initialState.horasTrabalhadas);
        setError(null);
        setDiagnosticoIa(null);
    };

    const handleBuscaIa = async () => {
        if (!descricaoProblema.trim()) {
            setError("Descreva o problema antes de buscar na IA.");
            return;
        }
        setIsIaLoading(true);
        setError(null);
        setDiagnosticoIa(null);
        setSuccess(null);

        try {
            const query = encodeURIComponent(descricaoProblema);
            // <<< chamada substituída
            const response = await fetchAuthenticated(`/rest/ia/diagnostico?descricao=${query}`);
            if (!response.ok) {
                const errorText = await response.text().catch(() => `Erro ${response.status}`);
                throw new Error(`IA: ${errorText}`);
            }
            const diag = await response.text();
            setDiagnosticoIa(diag);
            setDiagnostico(diag);
        } catch (err: any) {
            setError(err.message);
            setDiagnosticoIa("Falha ao obter diagnóstico.");
        } finally {
            setIsIaLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        const oficinaData = { dataOficina, descricaoProblema, diagnostico, partesAfetadas, horasTrabalhadas };

        try {
            // <<< chamada substituída
            const resp = await fetchAuthenticated(`/rest/oficina`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(oficinaData),
            });
            if (!resp.ok) {
                const errJson = await resp.json().catch(() => ({ message: resp.statusText }));
                throw new Error(errJson.message);
            }
            setSuccess("Registro salvo com sucesso!");
            resetForm();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const formattedDate = new Date(dataOficina + 'T00:00:00')
        .toLocaleDateString('pt-BR');

    return (
        <>
            <NavBar active="oficinaOnline" />

            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
                <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-2xl">
                    <h2 className="flex items-center text-3xl font-bold mb-6 justify-center">
                        <Wrench className="mr-2 text-4xl text-sky-400" />
                        Diagnóstico do veículo!
                    </h2>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 rounded border border-red-500">
                                <span>{error}</span>
                                <button
                                    type="button"
                                    className="absolute top-0 right-0 px-4 py-3"
                                    onClick={() => setError(null)}
                                    aria-label="Fechar"
                                >
                                    &times;
                                </button>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="flex items-center mb-1">
                                <Calendar className="mr-2 text-sky-400" />
                                Data do Registro:
                            </label>
                            <p className="w-full p-2 rounded bg-slate-700 border border-slate-600">
                                {formattedDate}
                            </p>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="descricaoProblema" className="flex items-center mb-1">
                                <AlertCircle className="mr-2 text-sky-400" />
                                Descrição do Problema:
                            </label>
                            <textarea
                                id="descricaoProblema"
                                rows={4}
                                required
                                className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-sky-500"
                                value={descricaoProblema}
                                onChange={e => setDescricaoProblema(e.target.value)}
                            />
                        </div>

                        <div className="mb-6 text-center">
                            <button
                                type="button"
                                onClick={handleBuscaIa}
                                disabled={isIaLoading}
                                className={`inline-flex items-center px-5 py-2 bg-indigo-600 rounded-md shadow hover:bg-indigo-700 transition ${isIaLoading ? 'opacity-50' : ''}`}
                            >
                                <Cpu className="mr-2" />
                                {isIaLoading ? 'Buscando na IA...' : 'Buscar Diagnóstico IA'}
                            </button>
                        </div>

                        {diagnosticoIa && (
                            <div className="mb-4 p-4 bg-slate-800 border border-slate-700 rounded">
                                <label className="flex items-center mb-2 text-sky-300 font-semibold">
                                    <Cpu className="mr-2" />
                                    Resultado IA:
                                </label>
                                <pre className="whitespace-pre-wrap">{diagnosticoIa}</pre>
                            </div>
                        )}

                        <div className="mb-4">
                            <label htmlFor="diagnostico" className="flex items-center mb-1">
                                <CheckCircle className="mr-2 text-sky-400" />
                                Diagnóstico Final:
                            </label>
                            <textarea
                                id="diagnostico"
                                rows={4}
                                required
                                className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-sky-500"
                                value={diagnostico}
                                onChange={e => setDiagnostico(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="partesAfetadas" className="flex items-center mb-1">
                                <Box className="mr-2 text-sky-400" />
                                Partes Afetadas:
                            </label>
                            <input
                                id="partesAfetadas"
                                type="text"
                                required
                                className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-sky-500"
                                value={partesAfetadas}
                                onChange={e => setPartesAfetadas(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="horasTrabalhadas" className="flex items-center mb-1">
                                <Clock className="mr-2 text-sky-400" />
                                Tempo (h):
                            </label>
                            <input
                                id="horasTrabalhadas"
                                type="text"
                                required
                                placeholder="Ex: 2.5"
                                className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-sky-500"
                                value={horasTrabalhadas}
                                onChange={e => setHorasTrabalhadas(e.target.value)}
                            />
                        </div>

                        {success && (
                            <p className="text-center text-green-400 mb-4">{success}</p>
                        )}

                        <div className="flex justify-center">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`inline-flex items-center px-6 py-3 bg-sky-600 rounded-md shadow hover:bg-sky-700 transition ${isSaving ? 'opacity-50' : ''}`}
                            >
                                <Save className="mr-2" />
                                {isSaving ? 'Salvando...' : 'Salvar Registro'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
