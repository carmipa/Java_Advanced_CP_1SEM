// app/clientes/buscar/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import {
    MdSearch,
    MdFilterList,
    MdPerson,
    MdBadge,
    MdEmail,
    MdLocationOn,
    MdEdit,
    MdDelete
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

// Tipos de busca
type TipoBusca = 'nome' | 'id' | 'doc';

export default function BuscarClientesPage() {
    const [todosClientes, setTodosClientes] = useState<ClienteParaLista[]>([]);
    const [resultadosBusca, setResultadosBusca] = useState<ClienteParaLista[]>([]);
    const [tipoBusca, setTipoBusca] = useState<TipoBusca>('nome');
    const [termoBusca, setTermoBusca] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [buscaRealizada, setBuscaRealizada] = useState(false);

    // Carrega todos os clientes uma única vez
    useEffect(() => {
        const fetchTodosClientes = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const resp = await fetch("http://localhost:8080/rest/clientes/all");
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
                setTodosClientes(formatados);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTodosClientes();
    }, []);

    // Placeholder dinâmico
    const getPlaceholder = () => {
        switch (tipoBusca) {
            case 'nome': return 'Digite parte do nome...';
            case 'id':   return 'Digite o Código do Cliente...';
            case 'doc':  return 'Digite parte do CPF ou CNPJ...';
            default:     return '';
        }
    };

    // Executa a busca client-side
    const handleSearch = (e?: FormEvent) => {
        if (e) e.preventDefault();
        setIsSearching(true);
        setBuscaRealizada(true);

        const q = termoBusca.trim().toLowerCase();
        if (!q) {
            setResultadosBusca([]);
            setIsSearching(false);
            return;
        }

        let resultados: ClienteParaLista[] = [];
        switch (tipoBusca) {
            case 'nome':
                resultados = todosClientes.filter(c =>
                    c.nomeCompleto.toLowerCase().includes(q)
                );
                break;
            case 'id':
                resultados = todosClientes.filter(c =>
                    c.idCli.toString() === q.replace(/\D/g, '')
                );
                break;
            case 'doc':
                const docQ = q.replace(/\D/g, '');
                resultados = todosClientes.filter(c =>
                    c.documento.replace(/\D/g, '').includes(docQ)
                );
                break;
        }

        setResultadosBusca(resultados);
        setIsSearching(false);
    };

    // Exclui cliente
    const handleDelete = async (idCli: number, idEnd: number) => {
        if (!window.confirm(`Excluir cliente ID ${idCli}?`)) return;
        try {
            const resp = await fetch(
                `http://localhost:8080/rest/clientes/${idCli}/${idEnd}`,
                { method: 'DELETE' }
            );
            if (!resp.ok) throw new Error(`Falha: ${resp.statusText}`);
            setTodosClientes(prev =>
                prev.filter(c => !(c.idCli === idCli && c.idEndereco === idEnd))
            );
            setResultadosBusca(prev =>
                prev.filter(c => !(c.idCli === idCli && c.idEndereco === idEnd))
            );
            alert('Cliente excluído com sucesso!');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <>
            <NavBar active="clientes" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center">
                    <MdSearch className="inline-block mr-2 text-4xl" />
                    Buscar Clientes
                </h1>

                <form
                    onSubmit={handleSearch}
                    className="mb-8 p-6 bg-slate-800 rounded-lg shadow-lg flex flex-col md:flex-row gap-4 items-end"
                >
                    <div className="w-full md:w-auto">
                        <label htmlFor="tipoBusca" className="block text-sm font-medium mb-1 text-slate-300 flex items-center">
                            <MdFilterList className="mr-2" />
                            Buscar por:
                        </label>
                        <select
                            id="tipoBusca"
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"
                            value={tipoBusca}
                            onChange={e => {
                                setTipoBusca(e.target.value as TipoBusca);
                                setTermoBusca('');
                                setResultadosBusca([]);
                                setBuscaRealizada(false);
                            }}
                        >
                            <option value="nome">Nome</option>
                            <option value="id">Código</option>
                            <option value="doc">Documento</option>
                        </select>
                    </div>

                    <div className="flex-1">
                        <label htmlFor="termoBusca" className="block text-sm font-medium mb-1 text-slate-300 flex items-center">
                            <MdSearch className="mr-2" />
                            Termo de busca:
                        </label>
                        <input
                            type={tipoBusca === 'id' ? 'number' : 'text'}
                            id="termoBusca"
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"
                            value={termoBusca}
                            onChange={e => setTermoBusca(e.target.value)}
                            placeholder={getPlaceholder()}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || isSearching}
                        className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:ring-2 focus:ring-sky-500 flex items-center"
                    >
                        {isSearching
                            ? 'Buscando...'
                            : (
                                <>
                                    <MdSearch className="mr-2" />
                                    Buscar
                                </>
                            )}
                    </button>
                </form>

                {isLoading && (
                    <p className="text-center text-sky-300 py-4">Carregando dados base...</p>
                )}
                {error && (
                    <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500">
                        {error}
                    </p>
                )}

                {!isLoading && !error && buscaRealizada && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow mt-6">
                        <h2 className="text-xl font-semibold p-4 bg-slate-800 rounded-t-lg flex items-center">
                            <MdSearch className="mr-2" />
                            Resultados da Busca
                        </h2>
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                    Nome
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                    Documento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                    E-mail
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                    Cidade/UF
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase">
                                    Ações
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {isSearching ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-slate-400">
                                        Buscando...
                                    </td>
                                </tr>
                            ) : resultadosBusca.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-slate-400">
                                        Nenhum cliente encontrado.
                                    </td>
                                </tr>
                            ) : (
                                resultadosBusca.map(c => (
                                    <tr key={`${c.idCli}-${c.idEndereco}`} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{c.nomeCompleto}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{c.documento}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{c.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{c.cidadeEstado}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                            <Link href={`/clientes/alterar/${c.idCli}/${c.idEndereco}`}>
                                                <button className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center">
                                                    <MdEdit className="mr-1" />
                                                    Alterar
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(c.idCli, c.idEndereco)}
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
        </>
    );
}
