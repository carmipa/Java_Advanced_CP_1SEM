// app/oficinaOnline/alterar/[id]/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Hooks para params e navegação
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { IMaskInput } from 'react-imask'; // Importado caso precise (ex: horas)

// Função auxiliar para limpar máscaras (se usar alguma)
const cleanMaskedValue = (value: string): string => {
    return value.replace(/\D/g, '');
};

// Interface para a resposta da API (igual à da listagem)
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

    // Pega o ID da URL (vem como string ou string[])
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : null;

    // --- Estados do Formulário (iniciam vazios) ---
    const [dataOficina, setDataOficina] = useState(""); // Será preenchido pelo fetch
    const [descricaoProblema, setDescricaoProblema] = useState("");
    const [diagnostico, setDiagnostico] = useState("");
    const [partesAfetadas, setPartesAfetadas] = useState("");
    const [horasTrabalhadas, setHorasTrabalhadas] = useState("");

    // --- Estados de Controle ---
    const [isLoading, setIsLoading] = useState(true); // Loading inicial dos dados
    const [isSaving, setIsSaving] = useState(false); // Loading para salvar
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    // Não precisamos do estado diagnosticoIa aqui, pois o diagnóstico já existe

    // --- useEffect para buscar dados da oficina ao carregar ---
    useEffect(() => {
        if (id) { // Só busca se o ID for válido
            setIsLoading(true); setError(null); setSuccess(null);

            const fetchOficinaData = async () => {
                try {
                    const apiUrl = `http://localhost:8080/rest/oficina/${id}`; // Endpoint GET por ID
                    const response = await fetch(apiUrl);

                    if (response.status === 404) { throw new Error("Registro de oficina não encontrado."); }
                    if (!response.ok) { throw new Error(`Erro ao buscar dados: ${response.statusText}`); }

                    const data: OficinaApiResponseDto = await response.json();

                    // Preenche os estados com os dados recebidos
                    setDataOficina(data.dataOficina ? data.dataOficina.split('T')[0] : '');
                    setDescricaoProblema(data.descricaoProblema || '');
                    setDiagnostico(data.diagnostico || '');
                    setPartesAfetadas(data.partesAfetadas || '');
                    setHorasTrabalhadas(data.horasTrabalhadas || '');

                } catch (err: any) { setError(err.message || "Falha ao carregar dados para edição.");
                } finally { setIsLoading(false); }
            };
            fetchOficinaData();
        } else {
            setError("ID do registro inválido na URL."); setIsLoading(false);
        }
    }, [id]); // Roda quando o ID muda (só na primeira vez, geralmente)

    // --- Manipulador para SALVAR as alterações ---
    const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!id) { setError("ID inválido para salvar."); return; }

        setIsSaving(true); setError(null); setSuccess(null);

        // Monta o objeto com os dados atuais do formulário
        const oficinaData = {
            dataOficina, descricaoProblema, diagnostico,
            partesAfetadas, horasTrabalhadas
        };

        // Endpoint PUT para atualização
        const apiUrl = `http://localhost:8080/rest/oficina/${id}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'PUT', // <<< Método PUT
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(oficinaData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}.` }));
                throw new Error(errorData.message || `Erro ${response.status}`);
            }

            const result = await response.json();
            console.log("Update Success:", result);
            setSuccess("Registro de oficina atualizado com sucesso!"); // Mensagem de sucesso

            // Limpa a mensagem de sucesso após alguns segundos
            setTimeout(() => { setSuccess(null); }, 5000);

            // Não limpamos o formulário na edição

        } catch (err: any) { setError(err.message || "Falha ao salvar alterações.");
        } finally { setIsSaving(false); }
    };

    // --- Renderização ---
    if (isLoading) { /* ... código de loading ... */
        return (
            <>
                <NavBar active="oficinaOnline" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                    <p className="text-center text-sky-300 py-10">Carregando dados do registro...</p>
                </main>
            </>
        );
    }
    // Mostra erro fatal se não conseguiu carregar os dados iniciais
    if (error && !descricaoProblema) { // Verifica um campo que deveria ter sido carregado
        return (
            <>
                <NavBar active="oficinaOnline" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                    <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-4xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-red-400">Erro ao Carregar</h2>
                        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500 mb-6">{error}</p>
                        <div className="text-center">
                            <Link href="/oficinaOnline"> {/* Link para a lista principal */}
                                <button className="px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700">
                                    Voltar para Lista
                                </button>
                            </Link>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    // Renderiza o formulário de edição
    return (
        <>
            <NavBar active="oficinaOnline" />

            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
                <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-2xl">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
                        Alterar Registro de Oficina (ID: {id})
                    </h2>

                    {/* Formulário chama handleUpdate */}
                    <form onSubmit={handleUpdate}>

                        {/* Mensagem de Erro (para salvar ou buscar CEP) */}
                        {error && ( <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert"><span className="block sm:inline">{error}</span><button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-2xl" aria-hidden="true">&times;</span></button></div> )}
                        {/* Mensagem de sucesso será exibida acima dos botões */}

                        {/* Campos do Formulário - Reutiliza estrutura do cadastro */}
                        {/* Os values e onChanges estão ligados aos estados desta página */}
                        <div className="mb-4">
                            <label htmlFor="dataOficina" className="block mb-1">Data:</label>
                            <input type="date" id="dataOficina" name="dataOficina" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 date-input-fix" value={dataOficina} onChange={(e) => setDataOficina(e.target.value)} />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="descricaoProblema" className="block mb-1">Descrição do Problema (Cliente):</label>
                            <textarea id="descricaoProblema" name="descricaoProblema" rows={4} required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={descricaoProblema} onChange={(e) => setDescricaoProblema(e.target.value)} maxLength={500} />
                        </div>
                        {/* Não colocamos o botão de buscar IA aqui, pois o diagnóstico já existe */}
                        <div className="mb-4">
                            <label htmlFor="partesAfetadas" className="block mb-1">Partes Afetadas:</label>
                            <input type="text" id="partesAfetadas" name="partesAfetadas" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={partesAfetadas} onChange={(e) => setPartesAfetadas(e.target.value)} maxLength={500} />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="diagnostico" className="block mb-1">Diagnóstico:</label>
                            <textarea id="diagnostico" name="diagnostico" rows={4} required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} maxLength={4000} />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="horasTrabalhadas" className="block mb-1">Horas Trabalhadas (Texto):</label>
                            <input type="text" id="horasTrabalhadas" name="horasTrabalhadas" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={horasTrabalhadas} onChange={(e) => setHorasTrabalhadas(e.target.value)} maxLength={5} placeholder="Ex: 2.5" />
                            <p className="text-xs text-slate-400 mt-1">Nota: Campo definido como texto no backend.</p>
                        </div>

                        {/* Mensagem de Sucesso Simples */}
                        {success && (
                            <p className="text-center text-green-400 mb-4">{success}</p>
                        )}

                        {/* Botões de Ação */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                            <button type="submit" className={`px-6 py-3 font-semibold text-white bg-green-600 rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isSaving || isLoading}>
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                            {/* Link para voltar para a lista principal da oficina */}
                            <Link href="/oficinaOnline" className="px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                                Voltar para Lista
                            </Link>
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
