// --- Arquivo: src/app/clientes/buscar/page.tsx (Refatorado com Cards e Ordenação por ID) ---
"use client";
import { fetchAuthenticated } from '@/utils/apiService'; // <<< Adicionado import
import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
// Importando Ícones
import { User, Mail, MapPin, Edit3, Trash2, Hash, Search as SearchIcon, Filter } from 'lucide-react';
// Usando mais Lucide
import { MdSearch, MdFilterList, MdPerson, MdBadge, MdLocationOn, MdEdit, MdDelete, MdErrorOutline } from 'react-icons/md';
// Mantendo alguns Md

// --- Interfaces ---
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
// ------------------

// Tipos de busca
type TipoBusca = 'nome' | 'id' | 'doc';
export default function BuscarClientesPage() {
    const [todosClientes, setTodosClientes] = useState<ClienteParaLista[]>([]);
    const [resultadosBusca, setResultadosBusca] = useState<ClienteParaLista[]>([]);
    const [tipoBusca, setTipoBusca] = useState<TipoBusca>('nome');
    const [termoBusca, setTermoBusca] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Loading inicial
    const [isSearching, setIsSearching] = useState(false);
    // Loading da busca
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [buscaRealizada, setBuscaRealizada] = useState(false);
    // Carrega todos os clientes uma única vez
    useEffect(() => {
        const fetchTodosClientes = async () => {
            // Evita refetch desnecessário se já carregou e não está em loading
            if (todosClientes.length > 0 && !isLoading) return;
            setIsLoading(true); setError(null);
            try {
                const resp = await fetchAuthenticated("/rest/clientes/all"); // <<< Alterado call
                if (!resp.ok) { let errorMsg = `Erro HTTP ${resp.status}: ${resp.statusText}`; try { const errorData = await resp.json(); errorMsg = errorData.message || errorMsg; } catch (e) {} throw new Error(errorMsg); }
                if (resp.status === 204) { setTodosClientes([]); return; } // Trata No Content
                const data: ClienteApiResponseDto[] = await resp.json();
                const formatados = (data || []).map(dto => ({
                    idCli: dto.idCli,
                    idEndereco: dto.endereco?.codigo || 0,
                    nomeCompleto: `${dto.nome || ''} ${dto.sobrenome || ''}`.trim(),
                    documento: dto.numeroDocumento || 'N/A',
                    email: dto.contato?.email || 'N/A',
                    cidadeEstado: dto.endereco ? `${dto.endereco.cidade || 'N/A'} / ${dto.endereco.estado || 'N/A'}` : 'N/A',
                }));
                setTodosClientes(formatados);
                console.log(`Carregados ${formatados.length} clientes para busca local.`);
            } catch (err: any) { setError(err.message || "Falha ao carregar dados base de clientes."); console.error("Erro:", err); setTodosClientes([]);
            } finally { setIsLoading(false);
            }
        };
        fetchTodosClientes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Dependência vazia para rodar só na montagem

    // Placeholder dinâmico
    const getPlaceholder = () => {
        switch (tipoBusca) {
            case 'nome': return 'Digite parte do nome...';
            case 'id':   return 'Digite o Código ID exato...';
            case 'doc':  return 'Digite parte do CPF/CNPJ...';
            default:     return '';
        }
    };
    // Executa a busca client-side com ordenação
    const handleSearch = (e?: FormEvent) => {
        if (e) e.preventDefault();
        setIsSearching(true);
        setBuscaRealizada(true);
        setError(null);

        // Garante que temos dados base antes de filtrar
        if (todosClientes.length === 0 && !isLoading) {
            setError("Dados base não carregados. Tente recarregar.");
            setResultadosBusca([]);
            setIsSearching(false);
            return;
        }

        const q = termoBusca.trim().toLowerCase();
        if (!q) {
            setResultadosBusca([]); setIsSearching(false); return;
        }

        let resultados: ClienteParaLista[] = [];
        try {
            switch (tipoBusca) {
                case 'nome':
                    resultados = todosClientes.filter(c => c.nomeCompleto.toLowerCase().includes(q));
                    break;
                case 'id':
                    const idNum = parseInt(q.replace(/\D/g, ''), 10);
                    // Pega só números
                    resultados = isNaN(idNum) ? [] : todosClientes.filter(c => c.idCli === idNum);
                    break;
                case 'doc':
                    const docQ = q.replace(/\D/g, '');
                    // Pega só números do termo
                    resultados = todosClientes.filter(c => c.documento?.replace(/\D/g, '').includes(docQ));
                    // Compara só números
                    break;
                default:
                    resultados = [];
            }

            // <<< ORDENAÇÃO POR ID_CLI DOS RESULTADOS >>>
            resultados.sort((a, b) => a.idCli - b.idCli);
        } catch(err) {
            console.error("Erro durante o filtro:", err);
            setError("Ocorreu um erro ao filtrar os dados.");
        } finally {
            setResultadosBusca(resultados);
            setIsSearching(false);
        }
    };

    // Exclui cliente (sem alterações na lógica, mas adiciona feedback)
    const handleDelete = async (idCli: number, idEnd: number) => {
        if (!idCli || isNaN(idCli) || !idEnd || isNaN(idEnd) || idEnd === 0) {
            setError("ID inválido ou endereço não associado corretamente para exclusão.");
            return;
        }
        if (!window.confirm(`Excluir cliente ID ${idCli} (End. ID ${idEnd})?`)) return;
        // Idealmente, teria um estado de loading específico para este item
        setError(null);
        try {
            const resp = await fetchAuthenticated(`/rest/clientes/${idCli}/${idEnd}`, { method: 'DELETE' }); // <<< Alterado call
            if (!resp.ok) { const errorText = await resp.text().catch(() => `Erro ${resp.status}`); throw new Error(`Falha: ${errorText}`);
            }
            // Remove das duas listas para consistência imediata
            setTodosClientes(prev => prev.filter(c => !(c.idCli === idCli && c.idEndereco === idEnd)));
            setResultadosBusca(prev => prev.filter(c => !(c.idCli === idCli && c.idEndereco === idEnd)));
            alert('Cliente excluído com sucesso!');
            // Trocar por um Toast/Snackbar seria melhor
        } catch (err: any) { setError(err.message);
        }
    };

    return (
        <>
            <NavBar active="clientes" /> {/* Ou "cliente-buscar" se tiver link direto */}
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                    <SearchIcon className="inline-block text-4xl text-sky-400" /> Buscar Clientes
                </h1>

                {/* Formulário de Busca */}
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg max-w-4xl mx-auto mb-8">
                    <form onSubmit={handleSearch}>
                        <div className="flex flex-wrap items-end gap-4">
                            {/* Select Tipo de Busca */}
                            <div className="flex-shrink-0 w-full sm:w-auto">
                                <label htmlFor="tipoBusca" className="flex items-center gap-1 block text-sm font-medium mb-1 text-slate-300"><Filter size={16}/>Buscar por:</label>
                                <select
                                    id="tipoBusca" name="tipoBusca" value={tipoBusca}
                                    onChange={e => { setTipoBusca(e.target.value as TipoBusca); setTermoBusca(''); setResultadosBusca([]); setBuscaRealizada(false); }}
                                    className="w-full sm:w-48 h-10 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value="nome">Nome</option>
                                    <option value="id">Código</option>
                                    <option value="doc">Documento</option>
                                </select>
                            </div>
                            {/* Input Termo de Busca */}
                            <div className="flex-grow min-w-[200px]">
                                <label htmlFor="termoBusca" className="block text-sm font-medium mb-1 text-slate-300">Termo:</label>
                                <input
                                    type={tipoBusca === 'id' ? 'number' : 'text'}
                                    id="termoBusca" name="termoBusca"
                                    value={termoBusca} onChange={e => setTermoBusca(e.target.value)}
                                    placeholder={getPlaceholder()} required
                                    className="w-full h-10 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            {/* Botão Buscar */}
                            <div className="flex-shrink-0">
                                <button type="submit" disabled={isLoading || isSearching} className={`h-10 px-5 py-2 font-semibold rounded-md shadow flex items-center justify-center ${isLoading || isSearching ? 'bg-sky-800 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}>
                                    <SearchIcon size={18} className="mr-2"/> {isSearching ? 'Buscando...' : 'Buscar'}
                                </button>
                            </div>
                        </div>
                        {error && ( <p className="mt-3 text-sm text-red-400 flex items-center gap-1"><MdErrorOutline/>{error}</p> )}
                    </form>
                </div>

                {/* Loading Inicial */}
                {isLoading && <p className="text-center text-sky-300 py-10">Carregando dados base...</p>}


                {/* <<< Área de Resultados com Cards >>> */}
                {!isLoading && buscaRealizada && !error && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4 text-center text-sky-300">Resultados da Busca</h2>
                        {isSearching ? (
                            <p className="text-center text-sky-300 py-10">Filtrando...</p>
                        ) : resultadosBusca.length === 0 ? (
                            <p className="text-center text-slate-400 py-10">Nenhum cliente encontrado para os critérios informados.</p>
                        ) : (
                            // Grid Layout para os Cards (Multi-coluna)
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {resultadosBusca.map((cliente) => { // Mapeia sobre resultadosBusca ORDENADOS
                                    const cardKey = `${cliente.idCli}-${cliente.idEndereco}`;
                                    const isIdValid = cliente.idCli !== null && cliente.idCli !== undefined && cliente.idEndereco !== 0;
                                    return (
                                        // Card Individual
                                        <div key={cardKey} className={`bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20 transition-shadow duration-300 ${!isIdValid ? 'opacity-50' : ''}`}>
                                            {/* Header do Card */}
                                            <div className="bg-slate-700 p-3 flex justify-between items-center text-sm">
                                                <span className="flex items-center gap-1 font-semibold text-sky-300"> <Hash size={16} /> ID: {isIdValid ? cliente.idCli : 'Inválido'} </span>
                                                {/* <span className="flex items-center gap-1 text-slate-400"> {cliente.tipoCliente || '-'} </span> */}
                                            </div>
                                            {/* Corpo do Card */}
                                            <div className="p-4 space-y-2 flex-grow text-sm">
                                                <p title={cliente.nomeCompleto}><strong><User size={16} className="inline -mt-1 mr-1"/> Nome:</strong> {cliente.nomeCompleto || '-'} </p>
                                                <p><strong><MdBadge className="inline -mt-1 mr-1"/> Documento:</strong> {cliente.documento || '-'} </p>
                                                <p title={cliente.email}><strong><Mail size={16} className="inline -mt-1 mr-1"/> Email:</strong> {cliente.email || '-'} </p>
                                                <p><strong><MapPin size={16} className="inline -mt-1 mr-1"/> Local:</strong> {cliente.cidadeEstado || '-'} </p>
                                            </div>
                                            {/* Footer do Card (Ações) */}
                                            <div className="bg-slate-900 p-3 mt-auto border-t border-slate-700 flex justify-end gap-2">
                                                {isIdValid ? (
                                                    <>
                                                        <Link href={`/clientes/alterar/${cliente.idCli}/${cliente.idEndereco}`}>
                                                            <button className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-xs font-medium gap-1"> <Edit3 size={14} /> Alterar </button>
                                                        </Link>
                                                        <button onClick={() => handleDelete(cliente.idCli, cliente.idEndereco)} className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium gap-1" disabled={isLoading}> <MdDelete size={16} /> Deletar </button>
                                                    </>
                                                ) : ( <span className="text-xs text-red-400 italic">IDs Inválidos</span> )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
                {/* <<< Fim da Área de Resultados >>> */}

                {/* Botão Voltar (Opcional) */}
                <div className="mt-8 text-center">
                    <Link href="/clientes/listar"> <button className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md shadow"> Voltar para Lista Completa </button> </Link>
                </div>

            </main>
        </>
    );
}