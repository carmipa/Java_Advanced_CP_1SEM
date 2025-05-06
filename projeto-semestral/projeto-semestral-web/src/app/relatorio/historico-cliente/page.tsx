// app/relatorio/historico-cliente/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import NavBar from '@/components/nav-bar';
import { useRouter } from 'next/navigation';

// --- Ícones Lucide (Verifique se ListChecks está aqui) ---
import {
    History, Search, User, ScanSearch, Hash, CalendarDays, ClipboardList, Car,
    ListFilter, AlertCircle, Loader2, UserCheck, ListChecks, // <<< CONFIRME QUE ESTÁ AQUI
    ListX
} from 'lucide-react';
import { MdErrorOutline } from 'react-icons/md'; // Mantido para erro

// --- Interfaces ---
interface ClienteInfoDTO {
    idCli: number;
    idEndereco: number;
    nome: string;
    sobrenome: string;
    numeroDocumento: string;
    getNomeCompleto?(): string;
}
interface HistoricoAgendamentoClienteDTO {
    dataAgendamento: string; // Formato YYYY-MM-DD da API
    observacao: string | null;
    veiculoPlaca: string | null;
}
interface AgendamentoHistorico { // Interface para dados formatados
    dataAgendamento: string; // Formatada DD/MM/YYYY ou 'N/A'
    observacao: string;
    veiculoPlaca: string;
}
type TipoBuscaCliente = 'nome' | 'documento' | 'idCliente';

// Helper para adicionar getNomeCompleto
const addGetNomeCompleto = (cliente: ClienteInfoDTO): ClienteInfoDTO => ({
    ...cliente,
    getNomeCompleto() { return `${this.nome} ${this.sobrenome}`.trim(); }
});

// Helper para formatar data
const formatarData = (dataString: string | null | undefined): string => {
    if (!dataString) return '-';
    try { return new Date(dataString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }); }
    catch (e) { console.error("Erro formatar data:", dataString, e); return 'Inválida'; }
};

// Helper para tratar erro fetch
const tratarErroFetch = (err: any): string => {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
        return "Não foi possível conectar ao servidor. Verifique a API e a rede.";
    }
    // Verifica se é um erro JSON vindo do throw new Error no try do fetch
    if (err.message && (err.message.startsWith("Erro HTTP") || err.message.includes("inválido"))) {
        return err.message; // Já formatado
    }
    if (err.message) {
        return err.message; // Outras mensagens de erro
    }
    return "Ocorreu um erro desconhecido.";
};


export default function RelatorioHistoricoClientePage() {
    // --- Estados ---
    const [tipoBusca, setTipoBusca] = useState<TipoBuscaCliente>('nome');
    const [termoBuscaCliente, setTermoBuscaCliente] = useState('');
    const [clientesEncontrados, setClientesEncontrados] = useState<ClienteInfoDTO[]>([]);
    const [isBuscandoCliente, setIsBuscandoCliente] = useState(false);
    const [clienteSelecionado, setClienteSelecionado] = useState<ClienteInfoDTO | null>(null);
    const [historico, setHistorico] = useState<AgendamentoHistorico[]>([]);
    const [isLoadingHistorico, setIsLoadingHistorico] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    // --------------------------------

    // Placeholder
    const getPlaceholder = (): string => {
        switch (tipoBusca) {
            case 'nome': return 'Digite nome ou sobrenome…';
            case 'documento': return 'Digite CPF ou CNPJ…';
            case 'idCliente': return 'Digite Código do Cliente…';
            default: return '';
        }
    };

    // --- buscarClientes ---
    const buscarClientes = async (e: FormEvent) => {
        e.preventDefault();
        setIsBuscandoCliente(true);
        setError(null);
        setClientesEncontrados([]);
        setClienteSelecionado(null);
        setHistorico([]);

        if (!termoBuscaCliente.trim()) {
            setError("Insira um termo para busca.");
            setIsBuscandoCliente(false);
            return;
        }

        const params = new URLSearchParams();
        // Usar nome correto do parâmetro da API
        if (tipoBusca === 'idCliente') {
            params.append('idCliente', termoBuscaCliente.trim());
        } else if (tipoBusca === 'documento') {
            params.append('documento', termoBuscaCliente.trim());
        } else {
            params.append('nome', termoBuscaCliente.trim());
        }

        const apiUrl = `http://localhost:8080/rest/clientes/buscar?${params}`;
        console.info("Buscando clientes:", apiUrl);

        try {
            const resp = await fetch(apiUrl);
            if (!resp.ok) {
                if (resp.status === 400) throw new Error("Critério de busca inválido ou não fornecido.");
                if (resp.status === 404 || resp.status === 204) {
                    setError("Nenhum cliente encontrado para este critério.");
                    setClientesEncontrados([]);
                    return; // Sai da função se 204 ou 404
                }
                // Tenta ler corpo do erro para outras falhas
                let errorMsg = `Erro HTTP ${resp.status}`;
                try {
                    const errorData = await resp.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (jsonError) {
                    errorMsg = `${errorMsg}: ${resp.statusText || 'Erro desconhecido'}`;
                }
                throw new Error(errorMsg);
            }

            // Se OK (200), tenta ler JSON. Pode ser []
            const data: ClienteInfoDTO[] = await resp.json();
            setClientesEncontrados(data.map(addGetNomeCompleto));
            if (data.length === 0) {
                setError("Nenhum cliente encontrado para este critério.");
            }

        } catch (err: any) {
            setError(tratarErroFetch(err));
            setClientesEncontrados([]);
        } finally {
            setIsBuscandoCliente(false);
        }
    };

    // --- fetchHistorico (COM A CORREÇÃO DO .json()) ---
    const fetchHistorico = async (idCli: number, idEnd: number) => {
        setIsLoadingHistorico(true);
        setError(null); // Limpa erro anterior ao buscar histórico
        setHistorico([]);
        const apiUrl = `http://localhost:8080/rest/relatorios/historico-cliente/${idCli}/${idEnd}`;
        console.info("Buscando histórico em:", apiUrl);
        try {
            const resp = await fetch(apiUrl);

            if (!resp.ok) {
                if (resp.status === 404) throw new Error(`Cliente ID ${idCli}/${idEnd} não encontrado para histórico.`);
                if (resp.status === 400) throw new Error("ID inválido para buscar histórico.");
                let errorMsg = `Erro HTTP ${resp.status}`;
                try { const errorData = await resp.json(); errorMsg = errorData.message || errorMsg; } catch (jsonError) { errorMsg = `${errorMsg}: ${resp.statusText || 'Erro desconhecido'}`; }
                throw new Error(errorMsg);
            }

            const responseBody = await resp.text();

            if (!responseBody) {
                console.info("Nenhum histórico encontrado (corpo da resposta vazio).");
                setHistorico([]);
                return;
            }

            const data: HistoricoAgendamentoClienteDTO[] = JSON.parse(responseBody);

            data.sort((a, b) => (b.dataAgendamento || '').localeCompare(a.dataAgendamento || ''));

            const fmt = data.map(dto => ({
                dataAgendamento: formatarData(dto.dataAgendamento),
                observacao: dto.observacao || '-',
                veiculoPlaca: dto.veiculoPlaca || 'N/A'
            }));
            setHistorico(fmt);
        } catch (err: any) {
            if (err instanceof SyntaxError) { console.error("Erro ao parsear JSON:", err); setError("Formato de resposta inválido do servidor ao buscar histórico."); }
            else { setError(tratarErroFetch(err)); }
            setHistorico([]);
        } finally {
            setIsLoadingHistorico(false);
        }
    };

    // --- handleSelecionarCliente ---
    const handleSelecionarCliente = (c: ClienteInfoDTO) => {
        setError(null);
        setClienteSelecionado(c);
        setClientesEncontrados([]);
        fetchHistorico(c.idCli, c.idEndereco);
    };

    // --- JSX ---
    return (
        <>
            <NavBar active="relatorio-historico-cliente" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Título */}
                <h1 className="flex items-center justify-center text-2xl md:text-3xl font-bold mb-8 text-center gap-2">
                    <History className="h-8 w-8 text-sky-400" />
                    Relatório: Histórico de Agendamentos por Cliente
                </h1>

                {/* Formulário de Busca */}
                <form onSubmit={buscarClientes} className="mb-8 p-4 md:p-6 bg-slate-800 rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-end max-w-4xl mx-auto">
                    {/* Select Tipo Busca */}
                    <div className="flex-shrink-0 w-full sm:w-auto">
                        <label htmlFor="tipoBusca" className="block text-sm font-medium mb-1 text-slate-300 flex items-center gap-1">
                            <ListFilter size={16} /> Buscar por:
                        </label>
                        <select
                            id="tipoBusca" value={tipoBusca}
                            onChange={e => {
                                setTipoBusca(e.target.value as TipoBuscaCliente);
                                setTermoBuscaCliente(''); setClientesEncontrados([]);
                                setClienteSelecionado(null); setHistorico([]); setError(null);
                            }}
                            className="w-full sm:w-40 p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="nome">Nome</option>
                            <option value="documento">Documento</option>
                            <option value="idCliente">Código</option>
                        </select>
                    </div>
                    {/* Input Termo */}
                    <div className="flex-grow w-full">
                        <label htmlFor="termoBusca" className="block text-sm font-medium mb-1 text-slate-300 flex items-center gap-1">
                            {tipoBusca === 'nome' ? <User size={16} /> : tipoBusca === 'documento' ? <ScanSearch size={16} /> : <Hash size={16} />}
                            Termo:
                        </label>
                        <input
                            id="termoBusca" type={tipoBusca === 'idCliente' ? 'number' : 'text'}
                            value={termoBuscaCliente} onChange={e => setTermoBuscaCliente(e.target.value)}
                            placeholder={getPlaceholder()} required
                            className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    {/* Botão Buscar */}
                    <button type="submit" disabled={isBuscandoCliente} className={`flex-shrink-0 w-full sm:w-auto h-10 px-5 py-2 rounded text-white font-semibold flex items-center justify-center gap-2 transition-opacity ${isBuscandoCliente ? 'bg-sky-800 cursor-not-allowed opacity-70' : 'bg-sky-600 hover:bg-sky-700'}`}>
                        <Search size={18} />
                        {isBuscandoCliente ? 'Buscando...' : 'Buscar Cliente'}
                    </button>
                </form>

                {/* Mensagem de Erro Principal */}
                {error && !clienteSelecionado && (
                    <div className="relative max-w-3xl mx-auto mb-6 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                        <MdErrorOutline className="inline mr-2" />
                        {error}
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar">
                            <span className="text-xl" aria-hidden="true">&times;</span>
                        </button>
                    </div>
                )}

                {/* Loading da Busca de Clientes */}
                {isBuscandoCliente && <p className="text-center text-sky-300 py-4">Buscando clientes...</p>}

                {/* Lista de Seleção de Clientes */}
                {!isBuscandoCliente && clientesEncontrados.length > 0 && !clienteSelecionado && (
                    <div className="mb-8 max-w-3xl mx-auto bg-slate-700/80 backdrop-blur-sm p-4 rounded-lg shadow-md border border-slate-600">
                        <h3 className="text-lg mb-3 font-semibold text-white flex items-center gap-2">
                            {/* Ícone ListChecks agora deve funcionar */}
                            <ListChecks size={20}/> Selecione um Cliente Encontrado:
                        </h3>
                        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {clientesEncontrados.map(c => (
                                <li
                                    key={`${c.idCli}-${c.idEndereco}`}
                                    onClick={() => handleSelecionarCliente(c)}
                                    className="p-3 bg-slate-800 hover:bg-sky-700 cursor-pointer rounded flex justify-between items-center text-sm transition-colors duration-150 shadow-sm"
                                    title={`Clique para ver histórico (ID Cliente: ${c.idCli}, ID Endereço: ${c.idEndereco})`}
                                >
                                    <span className='flex items-center gap-2 text-slate-100'>
                                        <User size={16} className='text-slate-400'/>
                                        {c.getNomeCompleto?.()}
                                    </span>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                         <Hash size={14}/>{c.idCli} <span className='mx-1'>|</span> <ScanSearch size={14}/> {c.numeroDocumento}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Seção do Histórico */}
                {clienteSelecionado && (
                    <section className="mt-8 bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                        {/* Exibe o erro do histórico aqui se ocorrer */}
                        {error && (
                            <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                                <MdErrorOutline className="inline mr-2" />
                                Erro ao carregar histórico: {error}
                                <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar">
                                    <span className="text-xl" aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        )}

                        {/* Nome do Cliente Selecionado */}
                        <h2 className="flex items-center text-xl md:text-2xl font-semibold mb-5 text-sky-300 border-b border-slate-700 pb-3 gap-2">
                            <UserCheck size={24} /> Histórico de: <span className="text-white">{clienteSelecionado.getNomeCompleto?.()}</span> <span className="text-sm text-slate-400">(ID: {clienteSelecionado.idCli})</span>
                        </h2>

                        {/* Loading do Histórico */}
                        {isLoadingHistorico ? (
                            <div className='flex justify-center items-center py-10'>
                                <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                                <span className='ml-3 text-sky-300'>Carregando histórico...</span>
                            </div>
                        ) : (
                            <>
                                {/* Mensagem ou Grid de Cards */}
                                {historico.length === 0 && !error ? (
                                    <p className="text-center text-slate-400 py-6 flex items-center justify-center gap-2">
                                        <ListX size={20}/> Nenhum histórico de agendamento encontrado para este cliente.
                                    </p>
                                ) : (
                                    // Grid de Cards para Histórico
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 pb-2">
                                        {historico.map((item, idx) => (
                                            <div key={idx} className="bg-slate-800 rounded-lg shadow-md border border-slate-700 flex flex-col overflow-hidden hover:border-sky-600 transition-colors duration-200">
                                                {/* Header Card Histórico */}
                                                <div className="bg-slate-700/50 p-3 flex justify-between items-center text-xs border-b border-slate-600">
                                                    <span className="flex items-center gap-1 font-semibold text-sky-300">
                                                        <CalendarDays size={14} /> {item.dataAgendamento}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-slate-400 font-mono bg-slate-600 px-1.5 py-0.5 rounded">
                                                        <Car size={14} /> {item.veiculoPlaca}
                                                    </span>
                                                </div>
                                                {/* Corpo Card Histórico */}
                                                <div className="p-3 flex-grow">
                                                    <h4 className="flex items-center text-sm font-semibold mb-1 text-slate-200 gap-1">
                                                        <ClipboardList size={16} className="text-amber-400 flex-shrink-0"/> Observação
                                                    </h4>
                                                    <p className="text-xs text-slate-300 break-words">
                                                        {item.observacao}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                )}

                {/* Mensagem inicial */}
                {!clienteSelecionado && !isBuscandoCliente && !error && clientesEncontrados.length === 0 && (
                    <div className="text-center text-slate-400 mt-10 bg-slate-800/50 p-6 rounded-lg max-w-md mx-auto border border-slate-700">
                        <Search size={40} className="mx-auto mb-4 text-sky-500" />
                        <p>
                            Utilize a busca acima para encontrar um cliente e visualizar seu histórico de agendamentos.
                        </p>
                    </div>
                )}
            </main>
        </>
    );
}