// app/clientes/listar/page.tsx
"use client";

import { fetchAuthenticated } from '@/utils/apiService'; // <<< Adicionado import
import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import {
    MdList,
    MdPerson,
    MdBadge,
    MdEmail,
    MdLocationOn,
    MdEdit,
    MdDelete,
    MdPersonAdd
} from 'react-icons/md';
// Interfaces
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
    endereco: { codigo: number; cidade: string; estado: string } | null;
    contato: { celular: string; email: string } | null;
}

export default function ListarClientesPage() {
    const [clientes, setClientes] = useState<ClienteParaLista[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    // Modal de delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [clienteParaDeletar, setClienteParaDeletar] = useState<ClienteParaLista | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Busca clientes
    const fetchClientes = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const resp = await fetchAuthenticated("/rest/clientes/all"); // <<< Alterado call
            if (!resp.ok) throw new Error(`Erro HTTP ${resp.status}: ${resp.statusText}`);
            const data: ClienteApiResponseDto[] = await resp.json();
            const formatados = data.map(dto => ({
                idCli: dto.idCli,
                idEndereco: dto.endereco?.codigo || 0,
                nomeCompleto: `${dto.nome} ${dto.sobrenome}`.trim(),
                documento: dto.numeroDocumento || 'N/A',
                email: dto.contato?.email || 'N/A',
                cidadeEstado: dto.endereco
                    ? `${dto.endereco.cidade} - ${dto.endereco.estado}`
                    : 'N/A'
            }));
            setClientes(formatados);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchClientes();
    }, []);
    // Abre modal
    const handleDeleteClick = (cliente: ClienteParaLista) => {
        setClienteParaDeletar(cliente);
        setShowDeleteModal(true);
        setError(null);
        setSuccess(null);
    };

    // Cancela modal
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setClienteParaDeletar(null);
    };

    // Confirma deleção
    const confirmDelete = async () => {
        if (!clienteParaDeletar) return;
        setIsDeleting(true);
        setError(null);
        setSuccess(null);
        const { idCli, idEndereco } = clienteParaDeletar;
        try {
            const resp = await fetchAuthenticated(
                `/rest/clientes/${idCli}/${idEndereco}`, // <<< Alterado URL
                { method: 'DELETE' }
            );
            if (!resp.ok) {
                const txt = await resp.text().catch(() => resp.statusText);
                throw new Error(txt);
            }
            setSuccess("Cliente excluído com sucesso!");
            setClientes(prev => prev.filter(c => !(c.idCli === idCli && c.idEndereco === idEndereco)));
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setClienteParaDeletar(null);
        }
    };

    return (
        <>
            <NavBar active="clientes" />

            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Cabeçalho */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold flex items-center">
                        <MdList className="mr-2 text-4xl" />
                        Lista de Clientes
                    </h1>
                    <Link href="/clientes/cadastrar">
                        <button className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow flex items-center">
                            <MdPersonAdd className="mr-2" />
                            Cadastrar Novo Cliente
                        </button>
                    </Link>
                </div>

                {/* Feedback */}
                {isLoading && (
                    <p className="text-center text-sky-300 py-4">Carregando...</p>
                )}
                {error && (
                    <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 rounded border border-red-500">
                        <span>{error}</span>
                        <button
                            className="absolute top-0 right-0 px-4 py-3 text-red-400 hover:text-red-200"
                            onClick={() => setError(null)}
                        >
                            &times;
                        </button>
                    </div>
                )}
                {success && (
                    <div className="relative mb-4 text-green-400 bg-green-900/50 p-4 rounded border border-green-500">
                        <span>{success}</span>
                        <button
                            className="absolute top-0 right-0 px-4 py-3 text-green-400 hover:text-green-200"
                            onClick={() => setSuccess(null)}
                        >
                            &times;
                        </button>
                    </div>
                )}

                {/* Tabela */}
                {!isLoading && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center">
                                    <MdPerson className="mr-1" /> Nome Completo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center">
                                    <MdBadge className="mr-1" /> Documento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center">
                                    <MdEmail className="mr-1" /> Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center">
                                    <MdLocationOn className="mr-1" /> Cidade/UF
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {clientes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-slate-400">
                                        Nenhum cliente cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                clientes.map(c => (
                                    <tr key={`${c.idCli}-${c.idEndereco}`} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{c.nomeCompleto}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{c.documento}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{c.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{c.cidadeEstado}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                            <Link href={`/clientes/alterar/${c.idCli}/${c.idEndereco}`}>
                                                <button className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center">
                                                    <MdEdit className="mr-1" />
                                                    Editar
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(c)}
                                                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded flex items-center"
                                            >
                                                <MdDelete className="mr-1" />
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

            {/* Modal de confirmação */}
            {showDeleteModal && clienteParaDeletar && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center">
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full border border-red-500">
                        <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center">
                            <MdDelete className="mr-2 text-2xl" />
                            Confirmar Exclusão
                        </h3>
                        <p className="text-white mb-3">
                            Tem certeza que deseja excluir o cliente abaixo?
                        </p>
                        <div className="text-slate-300 text-sm mb-6 border-l-2 border-red-500 pl-3">
                            <p><strong>ID:</strong> {clienteParaDeletar.idCli} / Endereço ID: {clienteParaDeletar.idEndereco}</p>
                            <p><strong>Nome:</strong> {clienteParaDeletar.nomeCompleto}</p>
                            <p><strong>Documento:</strong> {clienteParaDeletar.documento}</p>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md focus:outline-none"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md focus:outline-none ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isDeleting}
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