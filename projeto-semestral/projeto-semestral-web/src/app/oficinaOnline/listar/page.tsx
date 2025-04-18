// app/oficinaOnline/listar/page.tsx (Código Original Revisado com Logs Extras)
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';

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
    partesAfetadas: string | null; // Campo existe na API, mas não usado na lista
    horasTrabalhadas: string | null;
}
// --------------------------------------------------------------------

export default function ListarOficinaPage() {
    // Log Inicial - Fora de hooks/funções
    console.log("[Render] ListarOficinaPage - Iniciando renderização/re-renderização do componente.");

    const [oficinas, setOficinas] = useState<OficinaParaLista[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Estados para o Modal de Deleção ---
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
    const [oficinaParaDeletar, setOficinaParaDeletar] = useState<OficinaParaLista | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    // -----------------------------------------

    // Hooks devem ser chamados no nível superior
    const router = useRouter();
    console.log("[Render] Hooks useState e useRouter inicializados.");

    // --- Função para buscar e formatar os registros ---
    const fetchOficinas = async () => {
        console.log("[Fetch] Iniciando fetchOficinas...");
        setIsLoading(true); // Garante que isLoading é true ao iniciar
        setError(null);
        setShowDeleteConfirmModal(false);
        setShowDeleteSuccessModal(false);
        setOficinaParaDeletar(null);

        const apiUrl = "http://localhost:8080/rest/oficina/all";
        console.log(`[Fetch] Tentando buscar dados de: ${apiUrl}`);

        try {
            console.log("[Fetch] Antes do 'await fetch(apiUrl)'...");
            const response = await fetch(apiUrl);
            console.log(`[Fetch] Resposta recebida. Status: ${response.status}, OK: ${response.ok}`);

            if (!response.ok) {
                let errorBody = null;
                try {
                    errorBody = await response.text();
                    console.error("[Fetch] Corpo do erro da API (status não OK):", errorBody);
                } catch (e) {
                    console.warn("[Fetch] Não foi possível ler o corpo do erro da API (status não OK).");
                }
                // Joga um erro mais descritivo
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}. ${errorBody || '(Sem corpo de erro)'}`);
            }

            // Trata caso de 204 No Content (sem corpo JSON)
            if (response.status === 204) {
                console.log("[Fetch] Recebido status 204 (No Content). Definindo lista como vazia.");
                setOficinas([]);
            } else {
                console.log("[Fetch] Antes do 'await response.json()'...");
                const data: OficinaApiResponseDto[] | any = await response.json(); // Use 'any' temporariamente para verificar
                console.log('[Fetch] Dados brutos recebidos (após .json()):', data);

                // Verificação mais robusta se é um array
                if (!Array.isArray(data)) {
                    console.error("[Fetch] ERRO CRÍTICO: Resposta da API não é um array.", data);
                    throw new Error("Formato de resposta da API inválido (não é um array).");
                }

                console.log("[Fetch] Antes do 'data.map(...)'...");
                const oficinasFormatadas: OficinaParaLista[] = data.map((dto, index) => {
                    console.log(`[Fetch][Map] Mapeando item ${index}, ID: ${dto?.id}`); // Log para cada item
                    if (!dto || typeof dto !== 'object') {
                        console.warn(`[Fetch][Map] Item ${index} inválido encontrado: `, dto);
                        // Retorna um objeto inválido ou pula, dependendo da sua necessidade
                        // Aqui vamos pular para evitar erros, mas idealmente a API não deveria retornar isso
                        return null;
                    }
                    // Validação básica se o ID existe antes de prosseguir
                    if (dto.id === undefined || dto.id === null) {
                        console.warn(`[Fetch][Map] Item ${index} sem ID: `, dto);
                        return null; // Pula item sem ID
                    }
                    try {
                        const dataFormatada = dto.dataOficina
                            ? new Date(dto.dataOficina + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) // Adicionado Z para UTC explícito
                            : 'N/A';

                        return {
                            id: dto.id,
                            dataOficina: dataFormatada,
                            descricaoProblema: dto.descricaoProblema || '',
                            diagnostico: dto.diagnostico || 'Pendente',
                            horasTrabalhadas: dto.horasTrabalhadas || '',
                        };
                    } catch(mapError: any) {
                        console.error(`[Fetch][Map] Erro ao mapear item ${index} (ID: ${dto.id}):`, mapError, "DTO Original:", dto);
                        return null; // Retorna null se houver erro no mapeamento individual
                    }

                }).filter(item => item !== null) as OficinaParaLista[]; // Filtra itens que falharam no map

                console.log('[Fetch] Dados formatados para lista (após .map e .filter):', oficinasFormatadas);

                console.log("[Fetch] Antes do 'setOficinas(...)'...");
                setOficinas(oficinasFormatadas);
                console.log("[Fetch] Estado 'oficinas' atualizado com sucesso.");
            }

        } catch (err: any) {
            // Log aprimorado do erro capturado
            console.error("!!!!!!!! ERRO CAPTURADO NO BLOCO CATCH DO fetchOficinas !!!!!!!");
            console.error("[Fetch] Objeto de Erro Completo:", err); // Loga o objeto de erro inteiro
            console.error("[Fetch] Mensagem de Erro:", err.message);
            console.error("[Fetch] Stack Trace (se disponível):", err.stack);
            setError(err.message || "Falha ao carregar dados da oficina. Verifique o console."); // Mensagem mais genérica na UI
        } finally {
            console.log("[Fetch] Antes do 'setIsLoading(false)'...");
            setIsLoading(false);
            console.log("[Fetch] fetchOficinas finalizado (bloco finally executado).");
        }
    };

    useEffect(() => {
        console.log("[Effect] useEffect executando. Chamando fetchOficinas...");
        fetchOficinas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Roda apenas uma vez ao montar o componente

    // --- Funções de Deleção (sem alterações, mas com logs adicionados) ---
    const handleDeleteClick = (oficina: OficinaParaLista) => {
        console.log(`[Delete] Botão deletar clicado para ID: ${oficina.id}`);
        setOficinaParaDeletar(oficina); setShowDeleteConfirmModal(true); setError(null); };
    const confirmDelete = async () => {
        if (!oficinaParaDeletar) return;
        const { id } = oficinaParaDeletar;
        console.log(`[Delete] Confirmando exclusão para ID: ${id}`);
        setIsDeleting(true); setError(null);
        try {
            const deleteUrl = `http://localhost:8080/rest/oficina/${id}`;
            console.log(`[Delete] Tentando fetch DELETE para: ${deleteUrl}`);
            const response = await fetch(deleteUrl, { method: 'DELETE' });
            console.log(`[Delete] Resposta recebida. Status: ${response.status}, OK: ${response.ok}`);
            if (!response.ok) {
                const errorText = await response.text().catch(() => `Erro ${response.status}`);
                throw new Error(`Falha ao deletar registro: ${errorText || response.statusText}`); }
            setShowDeleteConfirmModal(false); setShowDeleteSuccessModal(true);
            console.log(`[Delete] Antes do 'setOficinas()' para remover ID: ${id}`);
            setOficinas(prev => prev.filter(o => o.id !== id));
            console.log(`[Delete] Registro ID ${id} removido do estado local 'oficinas'.`);
        } catch (err: any) {
            console.error("!!!!!!!! ERRO CAPTURADO NO confirmDelete !!!!!!!", err);
            setError(err.message || "Falha ao excluir registro.");
            setShowDeleteConfirmModal(false);
        } finally {
            console.log(`[Delete] Finalizando confirmDelete para ID: ${id} (bloco finally).`);
            setIsDeleting(false);
        }
    };
    const cancelDelete = () => { setShowDeleteConfirmModal(false); setOficinaParaDeletar(null); };
    const closeSuccessModal = () => { setShowDeleteSuccessModal(false); setOficinaParaDeletar(null); };
    // ----------------------------------------------------

    // Log de estado antes do return
    console.log(`[Render] Renderizando JSX... Estado atual: isLoading=${isLoading}, error='${error}', oficinas.length=${oficinas.length}`);

    return (
        <>
            {/* NavBar fora do main para ficar no topo */}
            <NavBar active="oficinaOnline" />

            {/* Conteúdo principal da página */}
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-[calc(100vh-var(--navbar-height,80px))] text-white"> {/* Ajuste min-h se necessário */}
                {console.log("[Render JSX] Renderizando <main>...")}

                {/* Cabeçalho da Página */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Registros da Oficina Online</h1>
                    <Link href="/oficinaOnline/cadastrar">
                        <button className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500">
                            Novo Diagnóstico
                        </button>
                    </Link>
                </div>

                {/* Mensagens de Loading e Erro */}
                {isLoading && (
                    <>
                        {console.log("[Render JSX] Renderizando mensagem 'Carregando...'")}
                        <p className="text-center text-sky-300 py-4">Carregando...</p>
                    </>
                )}
                {error && (
                    <>
                        {console.error(`[Render JSX] Renderizando mensagem de ERRO: ${error}`)}
                        <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                            <strong className="font-bold">Erro: </strong>
                            <span className="block sm:inline">{error}</span>
                            <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar">
                                <span className="text-2xl" aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    </>
                )}

                {/* Tabela de Registros - Só renderiza se não estiver carregando E não houver erro */}
                {!isLoading && !error && (
                    <>
                        {console.log("[Render JSX] Renderizando DIV da tabela...")}
                        <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                            <table className="min-w-full table-auto">
                                <thead className="bg-slate-800 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Descrição Problema</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Diagnóstico</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                {console.log(`[Render Table Body] Condição: oficinas.length === 0 ? ${oficinas.length === 0}`)}
                                {oficinas.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400">Nenhum registro encontrado.</td></tr>
                                ) : (
                                    oficinas.map((oficina, index) => {
                                        // Adicionado log dentro do map para cada linha
                                        console.log(`[Render Table Map] Renderizando linha ${index}, ID: ${oficina?.id}`);
                                        if (!oficina) { // Verificação extra
                                            console.warn(`[Render Table Map] Item 'oficina' inválido no índice ${index}`);
                                            return null; // Não renderiza linha se o item for inválido
                                        }
                                        return (
                                            <tr key={oficina.id} className="hover:bg-slate-800/50">
                                                <td className="px-6 py-4 whitespace-nowrap">{oficina.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{oficina.dataOficina}</td>
                                                <td className="px-6 py-4 whitespace-normal max-w-xs truncate" title={oficina.descricaoProblema}>{oficina.descricaoProblema}</td>
                                                <td className="px-6 py-4 whitespace-normal max-w-xs truncate" title={oficina.diagnostico}>{oficina.diagnostico}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                                    {(oficina.id) ? ( <Link href={`/oficinaOnline/alterar/${oficina.id}`}><button className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded" disabled={isDeleting}>Editar</button></Link>
                                                    ) : ( <button className="px-3 py-1 text-sm bg-gray-500 text-black rounded cursor-not-allowed" disabled>Editar</button> )}
                                                    <button onClick={() => handleDeleteClick(oficina)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded" disabled={isDeleting || !oficina.id}>
                                                        Deletar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                {console.log("[Render] Fim da renderização do componente ListarOficinaPage")}
            </main>

            {/* Modais de Deleção (sem alterações) */}
            {showDeleteConfirmModal && oficinaParaDeletar && ( <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4" onClick={cancelDelete}><div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full z-50 border border-red-500" onClick={(e) => e.stopPropagation()}><h3 className="text-xl font-semibold text-red-400 mb-4">Confirmar Exclusão</h3><p className="text-white mb-3">Tem certeza?</p><div className='text-slate-300 text-sm mb-6 border-l-2 border-red-500 pl-3'><p><strong>ID:</strong> {oficinaParaDeletar.id}</p><p><strong>Data:</strong> {oficinaParaDeletar.dataOficina}</p><p><strong>Problema:</strong> {oficinaParaDeletar.descricaoProblema}</p></div><div className="flex justify-end gap-4"><button type="button" className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md" onClick={cancelDelete} disabled={isDeleting}>Não</button><button type="button" className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? 'Excluindo...' : 'Sim'}</button></div></div></div> )}
            {showDeleteSuccessModal && ( <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4" onClick={closeSuccessModal}><div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full z-50 border border-green-500" onClick={(e) => e.stopPropagation()}><h3 className="text-xl font-semibold text-green-400 mb-4 text-center">Sucesso!</h3><p className="text-white mb-6 text-center">Registro excluído.</p><div className="flex justify-center"><button type="button" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md" onClick={closeSuccessModal}>OK</button></div></div></div> )}
        </>
    );
}