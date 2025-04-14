// app/oficinaOnline/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Para navegação programática se necessário
import NavBar from '@/components/nav-bar'; // Importa sua NavBar

// --- Interfaces para Tipagem ---
// Interface para representar os dados da oficina como exibidos na lista
// Ajuste conforme os campos que você quer mostrar e que sua API retorna
interface OficinaParaLista {
    id: number;
    dataOficina: string; // Exibir data formatada
    descricaoProblema: string;
    diagnostico: string;
    horasTrabalhadas: string;
}

// Interface para tipar a resposta esperada da API (baseado no seu OficinaResponseDto)
interface OficinaApiResponseDto {
    id: number;
    dataOficina: string; // API retorna como string? Ajustar se for LocalDate
    descricaoProblema: string;
    diagnostico: string;
    partesAfetadas: string; // Pode querer exibir também
    horasTrabalhadas: string;
}
// -----------------------------

export default function ListarOficinaPage() {
    const [oficinas, setOficinas] = useState<OficinaParaLista[]>([]); // Estado para a lista formatada
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null); // Para mensagens de sucesso (delete)

    // --- Estados para o Modal de Deleção ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [oficinaParaDeletar, setOficinaParaDeletar] = useState<OficinaParaLista | null>(null);
    const [isDeleting, setIsDeleting] = useState(false); // Loading específico para delete
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false); // Modal de sucesso pós-deleção
    // -----------------------------------------

    const router = useRouter();

    // --- Função para buscar e formatar os registros de oficina ---
    const fetchOficinas = async () => {
        setIsLoading(true); setError(null); setSuccess(null);
        try {
            const response = await fetch("http://localhost:8080/rest/oficina/all"); // Endpoint GET all Oficina
            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }
            const data: OficinaApiResponseDto[] = await response.json();

            // Mapeia os dados da API para o formato de exibição
            // *** ATENÇÃO: Ajuste este mapeamento e formatação de data ***
            const oficinasFormatadas: OficinaParaLista[] = data.map(dto => ({
                id: dto.id,
                // Formata a data (exemplo: DD/MM/YYYY) - instale 'date-fns' se precisar de formatação complexa
                dataOficina: dto.dataOficina ? new Date(dto.dataOficina + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A',
                descricaoProblema: dto.descricaoProblema || 'N/A',
                diagnostico: dto.diagnostico || 'Pendente', // Exemplo de valor padrão
                horasTrabalhadas: dto.horasTrabalhadas || 'N/A',
            }));

            setOficinas(oficinasFormatadas);

        } catch (err: any) {
            console.error("Erro ao buscar dados da API de Oficina:", err);
            setError(err.message || "Falha ao carregar dados da oficina.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- useEffect para buscar dados na montagem ---
    useEffect(() => {
        fetchOficinas();
    }, []); // Array vazio executa só uma vez

    // --- Funções para o fluxo de deleção com modal ---
    const handleDeleteClick = (oficina: OficinaParaLista) => {
        setOficinaParaDeletar(oficina); // Guarda o registro a ser deletado
        setShowDeleteModal(true);      // Abre o modal de confirmação
        setError(null);                // Limpa erros anteriores
        setSuccess(null);              // Limpa sucessos anteriores
    };

    const confirmDelete = async () => {
        if (!oficinaParaDeletar) return;

        setIsDeleting(true); // Ativa loading do delete
        setError(null);
        setSuccess(null);

        const { id } = oficinaParaDeletar; // ID simples para Oficina

        try {
            const response = await fetch(`http://localhost:8080/rest/oficina/${id}`, { method: 'DELETE' }); // Endpoint DELETE Oficina
            if (!response.ok) {
                const errorText = await response.text().catch(() => `Erro ${response.status}`);
                throw new Error(`Falha ao deletar registro: ${errorText || response.statusText}`);
            }

            // Sucesso na API!
            setShowDeleteModal(false); // Fecha modal de confirmação
            setShowDeleteSuccessModal(true); // <<< Abre modal de sucesso
            // Remove da lista local
            setOficinas(prev => prev.filter(o => o.id !== id));

        } catch (err: any) {
            console.error("Erro ao deletar registro:", err);
            setError(err.message || "Falha ao excluir registro.");
            setShowDeleteModal(false); // Fecha modal de confirmação mesmo com erro
        } finally {
            setIsDeleting(false); // Desativa loading do delete
            // Não limpa oficinaParaDeletar aqui, pode ser útil no modal de sucesso
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setOficinaParaDeletar(null);
    };

    // Fecha o modal de sucesso
    const closeSuccessModal = () => {
        setShowDeleteSuccessModal(false);
        setOficinaParaDeletar(null);
    };
    // ----------------------------------------------------

    return (
        <>
            {/* Passa a prop 'active' correta */}
            <NavBar active="oficinaOnline" />

            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Registros da Oficina Online</h1>
                    {/* Botão para ir para a página de cadastro/novo diagnóstico */}
                    <Link href="/oficinaOnline/cadastrar"> {/* Rota para o cadastro */}
                        <button className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500">
                            Novo Diagnóstico
                        </button>
                    </Link>
                </div>

                {/* Mensagens de Loading, Erro e Sucesso (para delete) */}
                {isLoading && <p className="text-center text-sky-300 py-4">Carregando registros...</p>}
                {error && ( <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert"><span className="block sm:inline">{error}</span><button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-2xl" aria-hidden="true">&times;</span></button></div> )}
                {/* Mensagem de sucesso não é mais necessária aqui, usamos o modal */}

                {/* Tabela de Registros */}
                {!isLoading && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                {/* Defina as colunas que fazem sentido para Oficina */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Descrição Problema</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Diagnóstico</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {oficinas.length === 0 && !isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400">Nenhum registro encontrado.</td></tr>
                            ) : (
                                oficinas.map((oficina) => (
                                    <tr key={oficina.id} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{oficina.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{oficina.dataOficina}</td>
                                        {/* Usar max-w-xs e truncate para limitar texto longo */}
                                        <td className="px-6 py-4 whitespace-normal max-w-xs truncate" title={oficina.descricaoProblema}>{oficina.descricaoProblema}</td>
                                        <td className="px-6 py-4 whitespace-normal max-w-xs truncate" title={oficina.diagnostico}>{oficina.diagnostico}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                            {/* Link para Edição/Detalhes */}
                                            <Link href={`/oficinaOnline/alterar/${oficina.id}`}> {/* Rota de edição/detalhes */}
                                                <button className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded" disabled={isDeleting}>Editar</button>
                                            </Link>
                                            {/* Botão Deletar */}
                                            <button
                                                onClick={() => handleDeleteClick(oficina)} // Chama função para abrir modal
                                                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                                                disabled={isDeleting || !oficina.id}
                                            >
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

            {/* --- Modal de Confirmação de Deleção --- */}
            {showDeleteModal && oficinaParaDeletar && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4 transition-opacity duration-300 ease-out" onClick={cancelDelete}>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full z-50 border border-red-500 transform transition-all duration-300 ease-out scale-100" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-red-400 mb-4">Confirmar Exclusão</h3>
                        <p className="text-white mb-3">Tem certeza que deseja excluir este registro?</p>
                        <div className='text-slate-300 text-sm mb-6 border-l-2 border-red-500 pl-3'>
                            <p><strong>ID:</strong> {oficinaParaDeletar.id}</p>
                            <p><strong>Data:</strong> {oficinaParaDeletar.dataOficina}</p>
                            <p><strong>Problema:</strong> {oficinaParaDeletar.descricaoProblema}</p>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button type="button" className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md" onClick={cancelDelete} disabled={isDeleting}>
                                Não, cancelar
                            </button>
                            <button type="button" className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={confirmDelete} disabled={isDeleting}>
                                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Modal de Sucesso da Deleção --- */}
            {showDeleteSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4 transition-opacity duration-300 ease-out" onClick={closeSuccessModal}>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full z-50 border border-green-500 transform transition-all duration-300 ease-out scale-100" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-green-400 mb-4 text-center">Sucesso!</h3>
                        <p className="text-white mb-6 text-center">Registro de oficina excluído.</p>
                        <div className="flex justify-center">
                            <button type="button" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md" onClick={closeSuccessModal}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
