// app/oficinaOnline/alterar/[id]/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { IMaskInput } from 'react-imask';
import { Calendar, AlertCircle, CheckCircle, Box, Clock, Save, ArrowLeft, FileText } from 'lucide-react';
import { fetchAuthenticated } from '@/utils/apiService'; // <<< Import adicionado

// Função auxiliar para limpar máscaras (se usar alguma)
const cleanMaskedValue = (value: string): string => value.replace(/\D/g, '');

interface OficinaApiResponseDto {
    id: number;
    dataOficina: string;
    descricaoProblema: string;
    diagnostico: string;
    partesAfetadas: string;
    horasTrabalhadas: string;
}

export default function AlterarOficinaPage() {
    const params = useParams();
    const router = useRouter();
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : null;

    const [dataOficina, setDataOficina] = useState('');
    const [descricaoProblema, setDescricaoProblema] = useState('');
    const [diagnostico, setDiagnostico] = useState('');
    const [partesAfetadas, setPartesAfetadas] = useState('');
    const [horasTrabalhadas, setHorasTrabalhadas] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError('ID inválido na URL.');
            setIsLoading(false);
            return;
        }
        (async () => {
            setIsLoading(true);
            setError(null);
            try {
                // <<< chamada substituída
                const res = await fetchAuthenticated(`/rest/oficina/${id}`);
                if (res.status === 404) throw new Error('Registro não encontrado.');
                if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
                const data: OficinaApiResponseDto = await res.json();
                setDataOficina(data.dataOficina.split('T')[0]);
                setDescricaoProblema(data.descricaoProblema || '');
                setDiagnostico(data.diagnostico || '');
                setPartesAfetadas(data.partesAfetadas || '');
                setHorasTrabalhadas(data.horasTrabalhadas || '');
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [id]);

    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsSaving(true);
        setError(null);
        setSuccess(null);
        const payload = { dataOficina, descricaoProblema, diagnostico, partesAfetadas, horasTrabalhadas };
        try {
            // <<< chamada substituída
            const res = await fetchAuthenticated(`/rest/oficina/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: res.statusText }));
                throw new Error(err.message);
            }
            setSuccess('Atualizado com sucesso!');
            setTimeout(() => setSuccess(null), 5000);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <>
            <NavBar active="oficinaOnline" />
            <main className="container mx-auto p-8 bg-[#012A46] min-h-screen text-white">
                <p className="text-center text-sky-300">Carregando dados...</p>
            </main>
        </>
    );

    if (error && !descricaoProblema) return (
        <>
            <NavBar active="oficinaOnline" />
            <main className="container mx-auto p-8 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 rounded-lg mx-auto max-w-md">
                    <h2 className="flex items-center text-2xl text-red-400 mb-4">
                        <AlertCircle className="mr-2" /> Erro
                    </h2>
                    <p className="mb-4">{error}</p>
                    <Link href="/oficinaOnline">
                        <button className="flex items-center px-4 py-2 bg-slate-600 text-white rounded-md">
                            <ArrowLeft className="mr-2" /> Voltar
                        </button>
                    </Link>
                </div>
            </main>
        </>
    );

    return (
        <>
            <NavBar active="oficinaOnline" />
            <main className="flex items-center justify-center p-8 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 rounded-lg max-w-2xl w-full">
                    <h2 className="flex items-center text-3xl mb-6">
                        <FileText className="mr-2 text-sky-400" /> Alterar Registro (ID: {id})
                    </h2>
                    <form onSubmit={handleUpdate}>
                        {error && (
                            <div className="mb-4 text-red-400 bg-red-900/50 p-4 rounded relative">
                                {error}
                                <button onClick={() => setError(null)} className="absolute top-2 right-2">&times;</button>
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="flex items-center mb-1">
                                <Calendar className="mr-2 text-sky-400" /> Data
                            </label>
                            <input
                                type="date"
                                value={dataOficina}
                                onChange={e => setDataOficina(e.target.value)}
                                className="w-full p-2 bg-slate-800 rounded border border-slate-700 focus:ring-2 focus:ring-sky-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center mb-1">
                                <AlertCircle className="mr-2 text-sky-400" /> Descrição
                            </label>
                            <textarea
                                value={descricaoProblema}
                                onChange={e => setDescricaoProblema(e.target.value)}
                                rows={4}
                                className="w-full p-2 bg-slate-800 rounded border border-slate-700 focus:ring-2 focus:ring-sky-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center mb-1">
                                <Box className="mr-2 text-sky-400" /> Partes Afetadas
                            </label>
                            <input
                                type="text"
                                value={partesAfetadas}
                                onChange={e => setPartesAfetadas(e.target.value)}
                                className="w-full p-2 bg-slate-800 rounded border border-slate-700 focus:ring-2 focus:ring-sky-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center mb-1">
                                <CheckCircle className="mr-2 text-sky-400" /> Diagnóstico
                            </label>
                            <textarea
                                value={diagnostico}
                                onChange={e => setDiagnostico(e.target.value)}
                                rows={4}
                                className="w-full p-2 bg-slate-800 rounded border border-slate-700 focus:ring-2 focus:ring-sky-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center mb-1">
                                <Clock className="mr-2 text-sky-400" /> Horas Trabalhadas
                            </label>
                            <input
                                type="text"
                                value={horasTrabalhadas}
                                onChange={e => setHorasTrabalhadas(e.target.value)}
                                className="w-full p-2 bg-slate-800 rounded border border-slate-700 focus:ring-2 focus:ring-sky-500"
                                placeholder="Ex: 2.5"
                                required
                            />
                        </div>
                        {success && <p className="text-green-400 mb-4">{success}</p>}
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center px-6 py-3 bg-green-600 rounded-md shadow hover:bg-green-700"
                            >
                                <Save className="mr-2" /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                            <Link href="/oficinaOnline">
                                <button className="inline-flex items-center px-6 py-3 bg-slate-600 rounded-md shadow hover:bg-slate-700">
                                    <ArrowLeft className="mr-2" /> Voltar
                                </button>
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
