"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
// Importando ícones
import { MdPersonAdd, MdEdit, MdDelete, MdPeopleAlt } from 'react-icons/md';

interface ClienteParaLista {
    idCli: number;
    idEndereco: number;
    nomeCompleto: string;
    documento: string;
    email: string;
    cidadeEstado: string;
}

interface ClienteApiResponseDto {
    idCli: number;
    nome: string;
    sobrenome: string;
    tipoCliente: string;
    numeroDocumento: string;
    endereco: {
        codigo: number;
        cidade: string;
        estado: string;
    } | null;
    contato: {
        celular: string;
        email: string;
    } | null;
}

export default function ListarClientesPage() {
    const [clientes, setClientes] = useState<ClienteParaLista[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClientes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("http://localhost:8080/rest/clientes/all");
            if (!response.ok) throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            const data: ClienteApiResponseDto[] = await response.json();
            const clientesFormatados: ClienteParaLista[] = data.map(dto => ({
                idCli: dto.idCli,
                idEndereco: dto.endereco?.codigo || 0,
                nomeCompleto: `${dto.nome || ''} ${dto.sobrenome || ''}`.trim(),
                documento: dto.numeroDocumento || 'N/A',
                email: dto.contato?.email || 'N/A',
                cidadeEstado: dto.endereco ? `${dto.endereco.cidade || 'N/A'} - ${dto.endereco.estado || 'N/A'}` : 'N/A',
            }));
            setClientes(clientesFormatados);
        } catch (err: any) {
            console.error("Erro ao buscar clientes:", err);
            setError(err.message || "Falha ao carregar dados dos clientes.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handleDelete = async (idCliente: number, idEndereco: number) => {
        if (!idCliente || !idEndereco) {
            setError("ID inválido para exclusão.");
            return;
        }
        if (!window.confirm(`Tem certeza que deseja excluir o cliente ID ${idCliente} (Endereço ID ${idEndereco})?`)) {
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/rest/clientes/${idCliente}/${idEndereco}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => `Erro ${response.status}`);
                throw new Error(`Falha ao deletar cliente: ${errorText}`);
            }

            alert("Cliente excluído com sucesso!");
            setClientes(prev => prev.filter(c => !(c.idCli === idCliente && c.idEndereco === idEndereco)));

        } catch (err: any) {
            console.error("Erro ao deletar cliente:", err);
            setError(err.message || "Falha ao excluir cliente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <NavBar active="clientes" />

            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="flex items-center gap-2 text-3xl font-bold">
                        <MdPeopleAlt className="text-4xl" />
                        Lista de Clientes
                    </h1>
                    <Link href="/clientes/cadastrar">
                        <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500">
                            <MdPersonAdd />
                            Cadastrar Novo Cliente
                        </button>
                    </Link>
                </div>

                {isLoading && <p className="text-center text-sky-300 py-4">Carregando clientes...</p>}
                {error && (
                    <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500">{error}</p>
                )}

                {!isLoading && !error && (
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
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-slate-400">Nenhum cliente cadastrado.</td>
                                </tr>
                            ) : (
                                clientes.map(cliente => (
                                    <tr key={`${cliente.idCli}-${cliente.idEndereco}`} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.nomeCompleto}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.documento}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.cidadeEstado}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center gap-2">
                                                <Link href={`/clientes/alterar/${cliente.idCli}/${cliente.idEndereco}`}>
                                                    <button className="flex items-center gap-1 px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded">
                                                        <MdEdit />
                                                        Alterar
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(cliente.idCli, cliente.idEndereco)}
                                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                                                    disabled={isLoading}
                                                >
                                                    <MdDelete />
                                                    Deletar
                                                </button>
                                            </div>
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
