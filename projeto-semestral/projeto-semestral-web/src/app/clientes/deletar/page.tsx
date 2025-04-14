// app/clientes/listar/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';

// Interfaces (ajuste conforme sua API)
interface ClienteParaLista {
    idCli: number; idEndereco: number; nomeCompleto: string;
    documento: string; email: string; cidadeEstado: string;
}
interface ClienteApiResponseDto {
    idCli: number; nome: string; sobrenome: string; tipoCliente: string; numeroDocumento: string;
    endereco: { codigo: number; cidade: string; estado: string; } | null;
    contato: { celular: string; email: string; } | null;
}

export default function ListarClientesPage() {
    const [clientes, setClientes] = useState<ClienteParaLista[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null); // Estado para mensagem de sucesso/delete

    // --- Estados para o Modal de Deleção ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [clienteParaDeletar, setClienteParaDeletar] = useState<ClienteParaLista | null>(null);
    const [isDeleting, setIsDeleting] = useState(false); // Loading específico para delete
    // -----------------------------------------

    const fetchClientes = async () => {
        setIsLoading(true); setError(null); setSuccess(null); // Limpa sucesso ao recarregar
        try {
            const response = await fetch("http://localhost:8080/rest/clientes/all"); // Endpoint GET all
            if (!response.ok) { throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`); }
            const data: ClienteApiResponseDto[] = await response.json();
            const clientesFormatados: ClienteParaLista[] = data.map(dto => ({
                idCli: dto.idCli,
                idEndereco: dto.endereco?.codigo || 0, // Pega o ID do endereço
                nomeCompleto: `${dto.nome || ''} ${dto.sobrenome || ''}`.trim(),
                documento: dto.numeroDocumento || 'N/A',
                email: dto.contato?.email || 'N/A',
                cidadeEstado: dto.endereco ? `${dto.endereco.cidade || 'N/A'} - ${dto.endereco.estado || 'N/A'}` : 'N/A',
            }));
            setClientes(clientesFormatados);
        } catch (err: any) { setError(err.message || "Falha ao carregar dados.");
        } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchClientes(); }, []);

    // --- Função para ABRIR o modal de confirmação ---
    const handleDeleteClick = (cliente: ClienteParaLista) => {
        setClienteParaDeletar(cliente); // Guarda o cliente a ser deletado
        setShowDeleteModal(true);      // Abre o modal
        setError(null);                // Limpa erros anteriores
        setSuccess(null);              // Limpa sucessos anteriores
    };

    // --- Função para CONFIRMAR a deleção (chamada pelo modal) ---
    const confirmDelete = async () => {
        if (!clienteParaDeletar) return;

        setIsDeleting(true); // Ativa loading do delete
        setError(null);
        setSuccess(null);

        const { idCli, idEndereco } = clienteParaDeletar;

        try {
            const response = await fetch(`http://localhost:8080/rest/clientes/${idCli}/${idEndereco}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorText = await response.text().catch(() => `Erro ${response.status}`);
                throw new Error(`Falha ao deletar cliente: ${errorText || response.statusText}`);
            }

            // Sucesso! Define a mensagem e remove da lista local
            setSuccess("Cliente excluído com sucesso!"); // <<< Usa setSuccess
            setClientes(prev => prev.filter(c => !(c.idCli === idCli && c.idEndereco === idEndereco)));

            // Limpa a mensagem de sucesso após alguns segundos
            setTimeout(() => { setSuccess(null); }, 5000); // 5 segundos

        } catch (err: any) {
            console.error("Erro ao deletar cliente:", err);
            setError(err.message || "Falha ao excluir cliente.");
        } finally {
            setIsDeleting(false); // Desativa loading do delete
            setShowDeleteModal(false); // Fecha o modal
            setClienteParaDeletar(null); // Limpa cliente selecionado
        }
    };

    // --- Função para CANCELAR a deleção (chamada pelo modal) ---
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setClienteParaDeletar(null);
    };

    return (
        <>
            <NavBar active="clientes" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Título e botão Cadastrar */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Lista de Clientes</h1>
                    <Link href="/clientes/cadastrar">
                        <button className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500">
                            Cadastrar Novo Cliente
                        </button>
                    </Link>
                </div>

                {/* Mensagens de Loading, Erro e Sucesso */}
                {isLoading && <p className="text-center text-sky-300 py-4">Carregando...</p>}
                {error && (
                    <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                        <span className="block sm:inline">{error}</span>
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar">
                            <span className="text-2xl" aria-hidden="true">&times;</span>
                        </button>
                    </div>
                )}
                {success && (
                    <div className="relative mb-4 text-green-400 bg-green-900/50 p-4 pr-10 rounded border border-green-500" role="alert">
                        <span className="block sm:inline">{success}</span>
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-green-400 hover:text-green-200" onClick={() => setSuccess(null)} aria-label="Fechar">
                            <span className="text-2xl" aria-hidden="true">&times;</span>
                        </button>
                    </div>
                )}

                {/* Tabela de Clientes */}
                {!isLoading && ( // Remove !error daqui para mostrar tabela mesmo com erro de delete
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Nome Completo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Documento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Cidade/UF</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {clientes.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400">Nenhum cliente cadastrado.</td></tr>
                            ) : (
                                clientes.map((cliente) => (
                                    <tr key={`${cliente.idCli}-${cliente.idEndereco}`} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.nomeCompleto}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.documento}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.cidadeEstado}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                            {/* Botão Editar */}
                                            {(cliente.idCli && cliente.idEndereco) ? ( <Link href={`/clientes/alterar/${cliente.idCli}/${cliente.idEndereco}`}><button className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded" disabled={isDeleting}>Editar</button></Link>
                                            ) : ( <button className="px-3 py-1 text-sm bg-gray-500 text-black rounded cursor-not-allowed" disabled>Editar</button> )}
                                            {/* Botão Deletar agora abre o modal */}
                                            <button
                                                onClick={() => handleDeleteClick(cliente)} // <<< Chama handleDeleteClick
                                                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                                                disabled={isDeleting || !cliente.idCli || !cliente.idEndereco}
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
            {showDeleteModal && clienteParaDeletar && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4"> {/* Overlay */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full z-50 border border-red-500"> {/* Caixa do Modal */}
                        <h3 className="text-xl font-semibold text-red-400 mb-4">Confirmar Exclusão</h3>
                        <p className="text-white mb-3">Tem certeza que deseja excluir o cliente?</p>
                        {/* Mostra alguns dados do cliente para confirmação */}
                        <div className='text-slate-300 text-sm mb-6 border-l-2 border-red-500 pl-3'>
                            <p><strong>ID:</strong> {clienteParaDeletar.idCli} / End. ID: {clienteParaDeletar.idEndereco}</p>
                            <p><strong>Nome:</strong> {clienteParaDeletar.nomeCompleto}</p>
                            <p><strong>Documento:</strong> {clienteParaDeletar.documento}</p>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                                onClick={cancelDelete} // Chama a função de cancelar
                                disabled={isDeleting} // Desabilita enquanto deleta
                            >
                                Não, cancelar
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={confirmDelete} // Chama a função que realmente deleta
                                disabled={isDeleting} // Desabilita enquanto deleta
                            >
                                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
