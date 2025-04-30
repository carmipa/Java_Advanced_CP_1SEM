// app/relatorio/historico-cliente/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import NavBar from '@/components/nav-bar';
import { useRouter } from 'next/navigation';
import {
    MdHistory,
    MdSearch,
    MdPerson,
    MdDocumentScanner,
    MdFingerprint,
    MdCalendarToday,
    MdComment,
    MdDirectionsCar,
    MdList
} from 'react-icons/md';

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
    dataAgendamento: string;
    observacao: string | null;
    veiculoPlaca: string | null;
}
interface AgendamentoHistorico {
    dataAgendamento: string;
    observacao: string;
    veiculoPlaca: string;
}
type TipoBuscaCliente = 'nome' | 'documento' | 'idCliente';

const addGetNomeCompleto = (cliente: ClienteInfoDTO): ClienteInfoDTO => ({
    ...cliente,
    getNomeCompleto() {
        return `${this.nome} ${this.sobrenome}`.trim();
    }
});

export default function RelatorioHistoricoClientePage() {
    const [tipoBusca, setTipoBusca] = useState<TipoBuscaCliente>('nome');
    const [termoBuscaCliente, setTermoBuscaCliente] = useState('');
    const [clientesEncontrados, setClientesEncontrados] = useState<ClienteInfoDTO[]>([]);
    const [isBuscandoCliente, setIsBuscandoCliente] = useState(false);

    const [clienteSelecionado, setClienteSelecionado] = useState<ClienteInfoDTO | null>(null);
    const [historico, setHistorico] = useState<AgendamentoHistorico[]>([]);
    const [isLoadingHistorico, setIsLoadingHistorico] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const getPlaceholder = (): string => {
        switch (tipoBusca) {
            case 'nome': return 'Digite nome ou sobrenome…';
            case 'documento': return 'Digite CPF ou CNPJ…';
            case 'idCliente': return 'Digite Código do Cliente…';
            default: return '';
        }
    };

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
        params.append(tipoBusca, termoBuscaCliente.trim());
        const apiUrl = `http://localhost:8080/rest/clientes/buscar?${params}`;
        console.info("Buscando clientes:", apiUrl);

        try {
            const resp = await fetch(apiUrl);
            if (!resp.ok) {
                if (resp.status === 400) throw new Error("Critério de busca inválido.");
                if (resp.status === 404 || resp.status === 204) {
                    setClientesEncontrados([]);
                    return;
                }
                throw new Error(`Erro HTTP ${resp.status}`);
            }
            const text = await resp.text();
            if (!text) {
                setClientesEncontrados([]);
                return;
            }
            const data: ClienteInfoDTO[] = JSON.parse(text);
            setClientesEncontrados(data.map(addGetNomeCompleto));
        } catch (err: any) {
            setError(err instanceof TypeError
                ? "Falha ao conectar ao servidor."
                : err.message);
            setClientesEncontrados([]);
        } finally {
            setIsBuscandoCliente(false);
        }
    };

    const fetchHistorico = async (idCli: number, idEnd: number) => {
        setIsLoadingHistorico(true);
        setError(null);
        setHistorico([]);
        const apiUrl = `http://localhost:8080/rest/relatorios/historico-cliente/${idCli}/${idEnd}`;
        console.info("Buscando histórico em:", apiUrl);
        try {
            const resp = await fetch(apiUrl);
            if (!resp.ok) {
                if (resp.status === 404)
                    throw new Error("Histórico não encontrado (404).");
                if (resp.status === 400)
                    throw new Error("ID inválido para histórico.");
                if (resp.status === 204) return;
                throw new Error(`Erro HTTP ${resp.status}`);
            }
            const text = await resp.text();
            if (!text) return;
            const data: HistoricoAgendamentoClienteDTO[] = JSON.parse(text);
            const fmt = data.map(dto => ({
                dataAgendamento: dto.dataAgendamento
                    ? new Date(dto.dataAgendamento + 'T00:00:00')
                        .toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                    : 'N/A',
                observacao: dto.observacao || '-',
                veiculoPlaca: dto.veiculoPlaca || 'N/A'
            }));
            setHistorico(fmt);
        } catch (err: any) {
            setError(err instanceof TypeError
                ? "Falha ao conectar ao servidor."
                : err.message);
            setHistorico([]);
        } finally {
            setIsLoadingHistorico(false);
        }
    };

    const handleSelecionarCliente = (c: ClienteInfoDTO) => {
        setError(null);
        setClienteSelecionado(c);
        setClientesEncontrados([]);
        fetchHistorico(c.idCli, c.idEndereco);
    };

    return (
        <>
            <NavBar active="relatorio-historico-cliente" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="flex items-center justify-center text-3xl font-bold mb-6">
                    <MdHistory className="mr-2 text-4xl" />
                    Histórico por Cliente
                </h1>

                <form
                    onSubmit={buscarClientes}
                    className="mb-6 p-4 bg-slate-800 rounded-lg shadow flex flex-col sm:flex-row gap-3 items-end"
                >
                    <div className="flex-shrink-0">
                        <label htmlFor="tipoBusca" className="block text-sm mb-1 text-slate-300 flex items-center">
                            <MdPerson className="mr-1" />
                            Buscar por:
                        </label>
                        <select
                            id="tipoBusca"
                            value={tipoBusca}
                            onChange={e => {
                                setTipoBusca(e.target.value as TipoBuscaCliente);
                                setTermoBuscaCliente('');
                                setClientesEncontrados([]);
                                setClienteSelecionado(null);
                                setHistorico([]);
                                setError(null);
                            }}
                            className="w-full sm:w-auto p-2 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="nome">Nome</option>
                            <option value="documento">Documento</option>
                            <option value="idCliente">Código</option>
                        </select>
                    </div>

                    <div className="flex-grow">
                        <label htmlFor="termoBusca" className="block text-sm mb-1 text-slate-300 flex items-center">
                            {tipoBusca === 'nome' ? <MdPerson className="mr-1" /> :
                                tipoBusca === 'documento' ? <MdDocumentScanner className="mr-1" /> :
                                    <MdFingerprint className="mr-1" />}
                            Termo:
                        </label>
                        <input
                            id="termoBusca"
                            type={tipoBusca === 'idCliente' ? 'number' : 'text'}
                            value={termoBuscaCliente}
                            onChange={e => setTermoBuscaCliente(e.target.value)}
                            placeholder={getPlaceholder()}
                            required
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isBuscandoCliente}
                        className="px-5 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white flex items-center whitespace-nowrap font-semibold"
                    >
                        <MdSearch className="mr-2" />
                        {isBuscandoCliente ? 'Buscando...' : 'Buscar Cliente'}
                    </button>
                </form>

                {error && (
                    <p className="text-center text-red-400 mb-4 p-3 bg-red-900/50 rounded border border-red-500">
                        {error}
                    </p>
                )}

                {isBuscandoCliente && (
                    <p className="text-center text-sky-300">Buscando clientes...</p>
                )}

                {!isBuscandoCliente && clientesEncontrados.length > 0 && (
                    <div className="mb-6 bg-slate-700 p-4 rounded shadow">
                        <h3 className="text-lg mb-2 font-semibold text-white flex items-center">
                            <MdList className="mr-2" />
                            Selecione o Cliente
                        </h3>
                        <ul className="space-y-1 max-h-48 overflow-y-auto">
                            {clientesEncontrados.map(c => (
                                <li
                                    key={`${c.idCli}-${c.idEndereco}`}
                                    onClick={() => handleSelecionarCliente(c)}
                                    className="p-2 hover:bg-sky-600 cursor-pointer rounded flex justify-between items-center text-sm"
                                    title={`Endereço ID: ${c.idEndereco}`}
                                >
                  <span>
                    <MdPerson className="inline mr-1" />
                      {c.getNomeCompleto?.()} (ID {c.idCli})
                  </span>
                                    <span className="text-xs text-slate-400">
                    Doc: {c.numeroDocumento}
                  </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {clienteSelecionado && !error && (
                    <div className="mt-8">
                        <h2 className="flex items-center text-2xl font-semibold mb-4">
                            <MdHistory className="mr-2" />
                            Histórico de {clienteSelecionado.getNomeCompleto?.()}
                        </h2>
                        {isLoadingHistorico ? (
                            <p className="text-center text-sky-300 py-5">
                                Carregando histórico...
                            </p>
                        ) : (
                            <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                                <table className="min-w-full table-fixed">
                                    <thead className="bg-slate-800 border-b border-slate-700">
                                    <tr>
                                        <th className="w-1/4 px-6 py-3 flex items-center text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                            <MdCalendarToday className="mr-1" />
                                            Data
                                        </th>
                                        <th className="w-2/4 px-6 py-3 flex items-center text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                            <MdComment className="mr-1" />
                                            Observação
                                        </th>
                                        <th className="w-1/4 px-6 py-3 flex items-center text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                            <MdDirectionsCar className="mr-1" />
                                            Veículo
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                    {historico.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-center text-slate-400">
                                                Nenhum histórico encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        historico.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-800/50">
                                                <td className="px-6 py-4 whitespace-nowrap">{item.dataAgendamento}</td>
                                                <td className="px-6 py-4 whitespace-normal break-words">{item.observacao}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{item.veiculoPlaca}</td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {!clienteSelecionado && !isBuscandoCliente && !error && clientesEncontrados.length === 0 && (
                    <p className="text-center text-slate-400 mt-10">
                        Use a busca acima para encontrar um cliente.
                    </p>
                )}
            </main>
        </>
    );
}
