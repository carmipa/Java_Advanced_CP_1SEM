// app/clientes/buscar/page.tsx
"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';

// Interfaces (mantidas da versão anterior)
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
    endereco: { codigo: number; cidade: string; estado: string; } | null;
    contato: { celular: string; email: string; } | null;
}

// Define os tipos de busca possíveis
type TipoBusca = 'nome' | 'id' | 'doc';

export default function BuscarClientesPage() {
    const [todosClientes, setTodosClientes] = useState<ClienteParaLista[]>([]);
    const [resultadosBusca, setResultadosBusca] = useState<ClienteParaLista[]>([]);
    const [tipoBusca, setTipoBusca] = useState<TipoBusca>('nome'); // <<< Novo estado: tipo de busca (padrão: nome)
    const [termoBusca, setTermoBusca] = useState(''); // <<< Novo estado: termo único de busca
    // const [termoBuscaNome, setTermoBuscaNome] = useState(''); // Removido
    // const [termoBuscaDoc, setTermoBuscaDoc] = useState(''); // Removido
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [buscaRealizada, setBuscaRealizada] = useState(false);

    // --- Função para buscar TODOS os clientes (mantida) ---
    const fetchTodosClientes = async () => {
        if (todosClientes.length > 0) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("http://localhost:8080/rest/clientes/all");
            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }
            const data: ClienteApiResponseDto[] = await response.json();
            const clientesFormatados: ClienteParaLista[] = data.map(dto => ({
                idCli: dto.idCli,
                idEndereco: dto.endereco?.codigo || 0,
                nomeCompleto: `${dto.nome || ''} ${dto.sobrenome || ''}`.trim(),
                documento: dto.numeroDocumento || 'N/A',
                email: dto.contato?.email || 'N/A',
                cidadeEstado: dto.endereco ? `${dto.endereco.cidade || 'N/A'} - ${dto.endereco.estado || 'N/A'}` : 'N/A',
            }));
            setTodosClientes(clientesFormatados);
        } catch (err: any) {
            console.error("Erro ao buscar dados da API:", err);
            setError(err.message || "Falha ao carregar dados base dos clientes.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Busca inicial (mantida) ---
    useEffect(() => {
        fetchTodosClientes();
    }, []);

    // --- Função para realizar a busca/filtro (CLIENT-SIDE - MODIFICADA) ---
    const handleSearch = (event?: FormEvent<HTMLFormElement>) => {
        if (event) event.preventDefault();
        setIsSearching(true);
        setBuscaRealizada(true);

        const query = termoBusca.trim().toLowerCase(); // Termo de busca geral
        if (!query) { // Se a busca for vazia, mostra todos ou nenhum? Vamos mostrar nenhum.
            setResultadosBusca([]);
            setIsSearching(false);
            return;
        }

        let resultados: ClienteParaLista[] = [];

        // Filtra baseado no tipo de busca selecionado
        switch (tipoBusca) {
            case 'nome':
                resultados = todosClientes.filter(cliente =>
                    cliente.nomeCompleto.toLowerCase().includes(query)
                );
                break;
            case 'id':
                // Filtra por ID do cliente (idCli) - compara como string
                resultados = todosClientes.filter(cliente =>
                    cliente.idCli.toString() === query.replace(/\D/g, '') // Compara ID como string, remove não-dígitos da busca
                );
                break;
            case 'doc':
                // Filtra por documento (CPF/CNPJ) - remove não-dígitos de ambos para comparar
                const docQuery = query.replace(/\D/g, '');
                resultados = todosClientes.filter(cliente =>
                    cliente.documento.replace(/\D/g, '').includes(docQuery)
                );
                break;
            default:
                resultados = []; // Tipo de busca desconhecido
        }

        setResultadosBusca(resultados);
        setIsSearching(false);
    };

    // --- Função para deletar cliente (mantida) ---
    const handleDelete = async (idCliente: number, idEndereco: number) => {
        if (!idCliente || !idEndereco) {
            setError("ID inválido para exclusão."); return;
        }
        if (!window.confirm(`Tem certeza que deseja excluir o cliente ID ${idCliente} (Endereço ID ${idEndereco})?`)) {
            return;
        }
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/rest/clientes/${idCliente}/${idEndereco}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorText = await response.text().catch(() => `Erro ${response.status}`);
                throw new Error(`Falha ao deletar cliente: ${errorText || response.statusText}`);
            }
            alert("Cliente excluído com sucesso!");
            setTodosClientes(prev => prev.filter(c => !(c.idCli === idCliente && c.idEndereco === idEndereco)));
            setResultadosBusca(prev => prev.filter(c => !(c.idCli === idCliente && c.idEndereco === idEndereco)));
        } catch (err: any) {
            console.error("Erro ao deletar cliente:", err);
            setError(err.message || "Falha ao excluir cliente.");
        } finally {
            // Lógica de loading aqui se necessário
        }
    };

    // Define placeholder dinâmico para o input de busca
    const getPlaceholder = (): string => {
        switch (tipoBusca) {
            case 'nome': return 'Digite parte do nome...';
            case 'id': return 'Digite o Código do Cliente (ID)...';
            case 'doc': return 'Digite parte do CPF ou CNPJ...';
            default: return 'Digite o termo de busca...';
        }
    }

    return (
        <>
            <NavBar active="clientes" />

            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="text-3xl font-bold mb-6 text-center">Buscar Clientes</h1>

                {/* Formulário de Busca Modificado */}
                <form onSubmit={handleSearch} className="mb-8 p-6 bg-slate-800 rounded-lg shadow-lg flex flex-col md:flex-row gap-4 items-end">
                    {/* <<< Select para escolher o tipo de busca >>> */}
                    <div className="w-full md:w-auto">
                        <label htmlFor="tipoBusca" className="block text-sm font-medium mb-1 text-slate-300">Buscar por:</label>
                        <select
                            id="tipoBusca"
                            name="tipoBusca"
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            value={tipoBusca}
                            onChange={(e) => {
                                setTipoBusca(e.target.value as TipoBusca);
                                setTermoBusca(''); // Limpa termo ao trocar tipo
                                setResultadosBusca([]); // Limpa resultados anteriores
                                setBuscaRealizada(false);
                            }}
                        >
                            <option value="nome">Nome</option>
                            <option value="id">Código Cliente</option>
                            <option value="doc">Documento (CPF/CNPJ)</option>
                        </select>
                    </div>

                    {/* <<< Input único para o termo de busca >>> */}
                    <div className="flex-1 min-w-0">
                        <label htmlFor="termoBusca" className="block text-sm font-medium mb-1 text-slate-300">Termo de Busca:</label>
                        <input
                            type={tipoBusca === 'id' ? 'number' : 'text'} // Muda para number se busca for por ID
                            id="termoBusca"
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            placeholder={getPlaceholder()} // Placeholder dinâmico
                            required // Torna o campo obrigatório para buscar
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500 whitespace-nowrap"
                        disabled={isLoading || isSearching}
                    >
                        {isSearching ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>

                {/* Exibição de Loading Inicial e Erro */}
                {isLoading && <p className="text-center text-sky-300 py-4">Carregando dados base...</p>}
                {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500">{error}</p>}

                {/* Tabela de Resultados da Busca (lógica mantida) */}
                {!isLoading && !error && buscaRealizada && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow mt-6">
                        <h2 className="text-xl font-semibold p-4 bg-slate-800 rounded-t-lg">Resultados da Busca</h2>
                        <table className="min-w-full table-auto">
                            {/* Cabeçalho da Tabela (thead) ... */}
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
                            {isSearching ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400">Buscando...</td></tr>
                            ) : resultadosBusca.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400">Nenhum cliente encontrado com os critérios informados.</td></tr>
                            ) : (
                                // Corpo da Tabela (tbody) com map e botões (igual anterior) ...
                                resultadosBusca.map((cliente) => (
                                    <tr key={`${cliente.idCli}-${cliente.idEndereco}`} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.nomeCompleto}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.documento}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{cliente.cidadeEstado}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                            {(cliente.idCli && cliente.idEndereco) ? (
                                                <Link href={`/clientes/alterar/${cliente.idCli}/${cliente.idEndereco}`}>
                                                    <button className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded">Alterar</button>
                                                </Link>
                                            ) : (
                                                <button className="px-3 py-1 text-sm bg-gray-500 text-black rounded cursor-not-allowed" disabled>Alterar</button>
                                            )}
                                            <button onClick={() => handleDelete(cliente.idCli, cliente.idEndereco)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded" disabled={isLoading || !cliente.idCli || !cliente.idEndereco}>
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
