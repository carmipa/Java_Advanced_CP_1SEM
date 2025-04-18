// app/clientes/page.tsx
"use client"; // Necessário para Hooks (useState, useEffect)

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar'; // Importa sua NavBar

// --- Interfaces para Tipagem ---
// Interface para representar os dados do cliente como exibidos na lista
// Ajuste conforme os campos que você quer mostrar e que sua API retorna
interface ClienteParaLista {
    idCli: number;
    idEndereco: number; // Precisamos do ID do endereço para formar a chave composta para editar/deletar
    nomeCompleto: string;
    documento: string;
    email: string;
    cidadeEstado: string;
}

// Interface para tipar a resposta esperada da API (baseado no seu ClienteResponseDto)
// É uma boa prática ter isso, ajuste se seu DTO for diferente
interface ClienteApiResponseDto {
    idCli: number;
    nome: string;
    sobrenome: string;
    tipoCliente: string;
    numeroDocumento: string;
    endereco: {
        codigo: number; // ID do endereço
        cidade: string;
        estado: string;
        // outros campos de endereço se precisar
    } | null;
    contato: {
        celular: string;
        email: string;
        // outros campos de contato se precisar
    } | null;
    // outros campos do ClienteResponseDto
}
// -----------------------------

export default function ListarClientesPage() {
    const [clientes, setClientes] = useState<ClienteParaLista[]>([]); // Estado para a lista formatada
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Função para buscar e formatar os clientes ---
    const fetchClientes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("http://localhost:8080/rest/clientes/all"); // Endpoint GET all
            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }
            const data: ClienteApiResponseDto[] = await response.json(); // Tipando a resposta da API

            // Mapeia os dados da API para o formato que queremos exibir na tabela
            const clientesFormatados: ClienteParaLista[] = data.map(dto => ({
                idCli: dto.idCli,
                idEndereco: dto.endereco?.codigo || 0, // Pega o ID do endereço (ou 0 se for nulo)
                nomeCompleto: `${dto.nome || ''} ${dto.sobrenome || ''}`.trim(),
                documento: dto.numeroDocumento || 'N/A',
                email: dto.contato?.email || 'N/A', // Pega email do contato
                cidadeEstado: dto.endereco ? `${dto.endereco.cidade || 'N/A'} - ${dto.endereco.estado || 'N/A'}` : 'N/A',
            }));

            setClientes(clientesFormatados);

        } catch (err: any) {
            console.error("Erro ao buscar dados da API:", err);
            setError(err.message || "Falha ao carregar dados dos clientes.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- useEffect para buscar dados na montagem ---
    useEffect(() => {
        fetchClientes();
    }, []); // Array vazio executa só uma vez

    // --- Função para deletar cliente ---
    const handleDelete = async (idCliente: number, idEndereco: number) => {
        if (!idCliente || !idEndereco) {
            setError("ID inválido para exclusão.");
            return;
        }
        if (!window.confirm(`Tem certeza que deseja excluir o cliente ID ${idCliente} (Endereço ID ${idEndereco})?`)) {
            return;
        }

        setIsLoading(true); // Pode usar um loading específico para delete
        setError(null);
        try {
            // Endpoint DELETE da sua API Java usando a chave composta
            const response = await fetch(`http://localhost:8080/rest/clientes/${idCliente}/${idEndereco}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => `Erro ${response.status}`);
                throw new Error(`Falha ao deletar cliente: ${errorText}`);
            }

            // Se deletou com sucesso (status 204 No Content ou 200 OK)
            alert("Cliente excluído com sucesso!");
            // Remove o cliente da lista local para atualizar a UI imediatamente
            setClientes(prevClientes => prevClientes.filter(c => !(c.idCli === idCliente && c.idEndereco === idEndereco)));

        } catch (err: any) {
            console.error("Erro ao deletar cliente:", err);
            setError(err.message || "Falha ao excluir cliente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Passa a prop 'active' correta para a NavBar */}
            <NavBar active="clientes" />

            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Lista de Clientes</h1>
                    {/* Botão para ir para a página de cadastro */}
                    <Link href="/clientes/cadastrar">
                        <button className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500">
                            Cadastrar Novo Cliente
                        </button>
                    </Link>
                </div>

                {/* Exibição de Loading e Erro */}
                {isLoading && <p className="text-center text-sky-300 py-4">Carregando clientes...</p>}
                {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500">{error}</p>}

                {/* Tabela de Clientes */}
                {!isLoading && !error && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                {/* Ajuste as colunas conforme necessário */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Nome Completo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Documento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Cidade/UF</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {clientes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-slate-400">Nenhum cliente cadastrado.</td>
                                </tr>
                            ) : (
                                // Mapeia a lista de clientes formatados para linhas da tabela
                                clientes.map((cliente) => (
                                    <tr key={`${cliente.idCli}-${cliente.idEndereco}`} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.nomeCompleto}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.documento}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.cidadeEstado}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                            {/* Link para Edição (leva para a página que ainda será criada) */}
                                            <Link href={`/clientes/alterar/${cliente.idCli}/${cliente.idEndereco}`}>
                                                <button className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded">
                                                    Alterar
                                                </button>
                                            </Link>
                                            {/* Botão Deletar */}
                                            <button
                                                onClick={() => handleDelete(cliente.idCli, cliente.idEndereco)}
                                                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                                                disabled={isLoading} // Desabilita enquanto outra ação ocorre
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
        </>
    );
}
