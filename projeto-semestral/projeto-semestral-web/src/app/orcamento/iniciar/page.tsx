// src/app/orcamento/iniciar/page.tsx
"use client";

import React, { useState, useEffect, FormEvent, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavBar from "@/components/nav-bar";
import {
    Search,
    User,
    ScanSearch,
    Hash,
    Car,
    UserCheck,
    CircleArrowRight,
    Loader2,
    AlertCircle,
    ListFilter,
    ListChecks,
    History,
    ShieldCheck,
} from "lucide-react";
import { MdErrorOutline } from "react-icons/md";

// <<< NOVO IMPORT – fetch autenticado >>>
import { fetchAuthenticated } from "@/utils/apiService";

// -----------------------------------------------------------------------------
// Interfaces & Tipos
// -----------------------------------------------------------------------------
interface ClienteInfoDTO {
    idCli: number;
    idEndereco: number;
    nome: string;
    sobrenome: string;
    numeroDocumento: string;
    getNomeCompleto?(): string;
}
interface VeiculoResponseDto {
    id: number;
    tipoVeiculo?: string;
    placa?: string;
    modelo?: string;
    montadora?: string;
    cor?: string;
    anoFabricacao?: string;
}
type TipoBuscaCliente = "nome" | "documento" | "idCliente";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
const addGetNomeCompleto = (cliente: ClienteInfoDTO): ClienteInfoDTO => ({
    ...cliente,
    getNomeCompleto() {
        return `${this.nome || ""} ${this.sobrenome || ""}`.trim();
    },
});

const tratarErroFetch = (err: any, context?: string): string => {
    const prefix = context ? `${context}: ` : "";
    if (err instanceof TypeError && err.message === "Failed to fetch") {
        return `${prefix}Não foi possível conectar ao servidor. Verifique a API e a rede.`;
    }
    if (err.message && err.message.includes('message":')) {
        try {
            const errorJson = JSON.parse(err.message.substring(err.message.indexOf("{")));
            if (errorJson.message) return `${prefix}${errorJson.message}`;
        } catch (_) {}
    }
    if (
        err.message &&
        (err.message.startsWith("Erro HTTP") ||
            err.message.includes("inválido") ||
            err.message.includes("não encontrado"))
    ) {
        return `${prefix}${err.message}`;
    }
    return `${prefix}${err.message || "Ocorreu um erro desconhecido."}`;
};

const extrairAno = (dataString: string | null | undefined): string => {
    if (!dataString) return "-";
    try {
        if (dataString.length >= 4 && /^\d{4}/.test(dataString)) {
            return dataString.substring(0, 4);
        }
        return new Date(dataString + "T00:00:00Z").getFullYear().toString();
    } catch (e) {
        console.error("Erro ao extrair ano:", dataString, e);
        return "Inválido";
    }
};

// -----------------------------------------------------------------------------
// Componente
// -----------------------------------------------------------------------------
export default function IniciarOrcamentoPage() {
    const router = useRouter();

    const [tipoBuscaCliente, setTipoBuscaCliente] =
        useState<TipoBuscaCliente>("nome");
    const [termoBuscaCliente, setTermoBuscaCliente] = useState("");
    const [clientesEncontrados, setClientesEncontrados] = useState<
        ClienteInfoDTO[]
    >([]);
    const [isBuscandoCliente, setIsBuscandoCliente] = useState(false);
    const [clienteSelecionado, setClienteSelecionado] =
        useState<ClienteInfoDTO | null>(null);
    const [veiculosDoCliente, setVeiculosDoCliente] = useState<
        VeiculoResponseDto[]
    >([]);
    const [isLoadingVeiculos, setIsLoadingVeiculos] = useState(false);
    const [veiculoSelecionado, setVeiculoSelecionado] =
        useState<VeiculoResponseDto | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ---------------------------------------------------------------------------
    // Placeholder dinâmico
    // ---------------------------------------------------------------------------
    const getPlaceholderCliente = (): string => {
        switch (tipoBuscaCliente) {
            case "nome":
                return "Digite nome ou sobrenome…";
            case "documento":
                return "Digite CPF ou CNPJ…";
            case "idCliente":
                return "Digite Código do Cliente…";
            default:
                return "";
        }
    };

    // ---------------------------------------------------------------------------
    // Buscar clientes
    // ---------------------------------------------------------------------------
    const buscarClientes = useCallback(
        async (e?: FormEvent) => {
            if (e) e.preventDefault();
            setIsBuscandoCliente(true);
            setError(null);
            setClientesEncontrados([]);
            setClienteSelecionado(null);
            setVeiculosDoCliente([]);
            setVeiculoSelecionado(null);

            if (!termoBuscaCliente.trim()) {
                setError("Insira um termo para busca.");
                setIsBuscandoCliente(false);
                return;
            }

            const params = new URLSearchParams();
            if (tipoBuscaCliente === "idCliente")
                params.append("idCliente", termoBuscaCliente.trim());
            else if (tipoBuscaCliente === "documento")
                params.append("documento", termoBuscaCliente.trim());
            else params.append("nome", termoBuscaCliente.trim());

            try {
                // >>> ALTERADO: fetchAuthenticated <<<
                const resp = await fetchAuthenticated(
                    `/rest/clientes/buscar?${params.toString()}`
                );

                if (!resp.ok) {
                    if (resp.status === 400) throw new Error("Critério de busca inválido.");
                    if (resp.status === 404 || resp.status === 204) {
                        setError("Nenhum cliente encontrado para este critério.");
                        setClientesEncontrados([]);
                        return;
                    }
                    let errorMsg = `Erro HTTP ${resp.status}`;
                    try {
                        const errorData = await resp.json();
                        errorMsg = errorData.message || errorMsg;
                    } catch {
                        errorMsg = `${errorMsg}: ${resp.statusText || "Erro desconhecido"}`;
                    }
                    throw new Error(errorMsg);
                }

                const data: ClienteInfoDTO[] = await resp.json();
                if (data.length === 0) {
                    setError("Nenhum cliente encontrado para este critério.");
                }
                setClientesEncontrados(data.map(addGetNomeCompleto));
            } catch (err: any) {
                setError(tratarErroFetch(err, "Busca Cliente"));
                setClientesEncontrados([]);
            } finally {
                setIsBuscandoCliente(false);
            }
        },
        [termoBuscaCliente, tipoBuscaCliente]
    );

    // ---------------------------------------------------------------------------
    // Buscar veículos do cliente
    // ---------------------------------------------------------------------------
    const fetchVeiculosDoCliente = useCallback(
        async (cliente: ClienteInfoDTO | null) => {
            if (!cliente) return;

            setIsLoadingVeiculos(true);
            setError(null);
            setVeiculosDoCliente([]);
            setVeiculoSelecionado(null);

            const { idCli, idEndereco } = cliente;
            if (!idCli || !idEndereco) {
                setError("Erro interno: ID do cliente ou endereço inválido.");
                setIsLoadingVeiculos(false);
                return;
            }

            try {
                // >>> ALTERADO: fetchAuthenticated <<<
                const resp = await fetchAuthenticated(
                    `/rest/clientes/${idCli}/${idEndereco}/veiculos`
                );

                if (!resp.ok) {
                    if (resp.status === 404) {
                        setError(`Cliente ID ${idCli}/${idEndereco} não encontrado.`);
                        setVeiculosDoCliente([]);
                        return;
                    }
                    let errorMsg = `Erro HTTP ${resp.status}`;
                    try {
                        const errorData = await resp.json();
                        errorMsg = errorData.message || errorMsg;
                    } catch {
                        errorMsg = `${errorMsg}: ${resp.statusText || "Erro desconhecido"}`;
                    }
                    throw new Error(errorMsg);
                }

                if (resp.status === 204) {
                    setVeiculosDoCliente([]);
                    return;
                }

                const data: VeiculoResponseDto[] = await resp.json();
                setVeiculosDoCliente(data || []);
            } catch (err: any) {
                setError(tratarErroFetch(err, "Busca Veículos"));
                setVeiculosDoCliente([]);
            } finally {
                setIsLoadingVeiculos(false);
            }
        },
        []
    );

    // ---------------------------------------------------------------------------
    // Seleções e navegação
    // ---------------------------------------------------------------------------
    const handleSelecionarCliente = useCallback(
        (cliente: ClienteInfoDTO) => {
            if (!cliente || !cliente.idCli || !cliente.idEndereco) {
                setError("Erro ao processar dados do cliente selecionado.");
                return;
            }
            setClienteSelecionado(cliente);
            setClientesEncontrados([]);
            fetchVeiculosDoCliente(cliente);
        },
        [fetchVeiculosDoCliente]
    );

    const resetSelecaoCliente = useCallback(() => {
        setClienteSelecionado(null);
        setVeiculosDoCliente([]);
        setVeiculoSelecionado(null);
        setTermoBuscaCliente("");
        setError(null);
        setClientesEncontrados([]);
    }, []);

    const handleSelecionarVeiculo = useCallback((veiculo: VeiculoResponseDto) => {
        setVeiculoSelecionado(veiculo);
    }, []);

    const iniciarGeracaoOrcamento = useCallback(() => {
        if (!clienteSelecionado || !veiculoSelecionado) {
            setError("Erro interno: Selecione um cliente e um veículo primeiro.");
            return;
        }
        const cliIdStr = clienteSelecionado.idCli?.toString();
        const endIdStr = clienteSelecionado.idEndereco?.toString();
        const veiIdStr = veiculoSelecionado.id?.toString();
        if (!cliIdStr || !endIdStr || !veiIdStr) {
            setError("Erro interno: IDs inválidos no cliente ou veículo.");
            return;
        }
        const queryParams = new URLSearchParams({
            cliId: cliIdStr,
            endId: endIdStr,
            veiId: veiIdStr,
        }).toString();
        router.push(`/orcamento/gerar?${queryParams}`);
    }, [clienteSelecionado, veiculoSelecionado, router]);

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
        <>
            <NavBar active="orcamento-gerar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="flex items-center justify-center text-2xl md:text-3xl font-bold mb-6 text-center gap-2">
                    <ShieldCheck size={30} className="text-sky-400" /> Iniciar Geração de
                    Orçamento
                </h1>

                {/* 1. Busca Cliente --------------------------------------------------- */}
                {!clienteSelecionado && (
                    <section className="mb-8 p-4 md:p-6 bg-slate-800 rounded-lg shadow-lg max-w-4xl mx-auto border border-slate-600">
                        <h2 className="text-xl font-semibold text-sky-300 mb-4 pb-2 border-b border-slate-700">
                            1. Buscar Cliente
                        </h2>

                        <form
                            onSubmit={buscarClientes}
                            className="flex flex-col sm:flex-row gap-4 items-end"
                        >
                            <div className="flex-shrink-0 w-full sm:w-auto">
                                <label
                                    htmlFor="tipoBuscaCliente"
                                    className="block text-sm font-medium mb-1 text-slate-300 flex items-center gap-1"
                                >
                                    <ListFilter size={16} /> Buscar por:
                                </label>
                                <select
                                    id="tipoBuscaCliente"
                                    value={tipoBuscaCliente}
                                    onChange={(e) =>
                                        setTipoBuscaCliente(e.target.value as TipoBuscaCliente)
                                    }
                                    className="w-full sm:w-40 p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value="nome">Nome</option>
                                    <option value="documento">Documento</option>
                                    <option value="idCliente">Código</option>
                                </select>
                            </div>

                            <div className="flex-grow w-full">
                                <label
                                    htmlFor="termoBuscaCliente"
                                    className="block text-sm font-medium mb-1 text-slate-300 flex items-center gap-1"
                                >
                                    {tipoBuscaCliente === "nome" ? (
                                        <User size={16} />
                                    ) : tipoBuscaCliente === "documento" ? (
                                        <ScanSearch size={16} />
                                    ) : (
                                        <Hash size={16} />
                                    )}{" "}
                                    Termo:
                                </label>
                                <input
                                    id="termoBuscaCliente"
                                    type={tipoBuscaCliente === "idCliente" ? "number" : "text"}
                                    value={termoBuscaCliente}
                                    onChange={(e) => setTermoBuscaCliente(e.target.value)}
                                    placeholder={getPlaceholderCliente()}
                                    required
                                    className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isBuscandoCliente}
                                className={`flex-shrink-0 w-full sm:w-auto h-10 px-5 py-2 rounded text-white font-semibold flex items-center justify-center gap-2 transition-opacity ${
                                    isBuscandoCliente
                                        ? "bg-sky-800 cursor-not-allowed opacity-70"
                                        : "bg-sky-600 hover:bg-sky-700"
                                }`}
                            >
                                <Search size={18} /> {isBuscandoCliente ? "Buscando..." : "Buscar Cliente"}
                            </button>
                        </form>

                        {error && !isBuscandoCliente && (
                            <p className="mt-4 text-sm text-red-400 flex items-center gap-1">
                                <MdErrorOutline />
                                {error}
                            </p>
                        )}

                        {!isBuscandoCliente && clientesEncontrados.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-md mb-2 font-semibold text-slate-200">
                                    Clientes encontrados:
                                </h3>
                                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {clientesEncontrados.map((c) => (
                                        <li
                                            key={`${c.idCli}-${c.idEndereco}`}
                                            onClick={() => handleSelecionarCliente(c)}
                                            className="p-3 bg-slate-700 hover:bg-sky-700 cursor-pointer rounded flex justify-between items-center text-sm transition-colors duration-150 shadow-sm"
                                            title={`Selecionar Cliente (ID: ${c.idCli})`}
                                        >
                      <span className="flex items-center gap-2 text-slate-100">
                        <User size={16} className="text-slate-400" />
                          {c.getNomeCompleto?.()}
                      </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Hash size={14} />
                                                {c.idCli} | <ScanSearch size={14} />{" "}
                                                {c.numeroDocumento}
                      </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                )}

                {/* 2 & 3. Seleção veículo + botão ------------------------------------ */}
                {clienteSelecionado && (
                    <section className="mb-6 p-4 md:p-6 bg-slate-800 rounded-lg shadow-lg max-w-4xl mx-auto border border-slate-600">
                        <div className="mb-4 pb-3 border-b border-slate-700 flex flex-wrap justify-between items-center gap-2">
                            <h2 className="text-xl font-semibold text-sky-300 flex items-center gap-2">
                                <UserCheck size={22} />
                                Cliente:
                                <span className="text-white font-bold">
                  {clienteSelecionado.getNomeCompleto?.()}
                </span>
                            </h2>
                            <button
                                onClick={resetSelecaoCliente}
                                className="text-xs text-sky-400 hover:text-sky-200 underline"
                            >
                                Trocar Cliente
                            </button>
                        </div>

                        {error && (
                            <p className="mb-4 text-sm text-red-400 flex items-center gap-1">
                                <MdErrorOutline />
                                {error}
                            </p>
                        )}

                        {isLoadingVeiculos && (
                            <div className="flex justify-center items-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
                                <span className="ml-3 text-sky-300">Carregando veículos...</span>
                            </div>
                        )}

                        {!isLoadingVeiculos && !error && (
                            <>
                                <h3 className="text-lg font-semibold text-slate-200 mb-3">
                                    2. Selecione o Veículo
                                </h3>
                                {veiculosDoCliente.length === 0 ? (
                                    <p className="text-slate-400 text-sm">
                                        Nenhum veículo encontrado para este cliente.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                        {veiculosDoCliente.map((v) => (
                                            <button
                                                key={v.id}
                                                onClick={() => handleSelecionarVeiculo(v)}
                                                className={`p-3 rounded text-left w-full transition-colors duration-150 border ${
                                                    veiculoSelecionado?.id === v.id
                                                        ? "bg-sky-700 border-sky-500 ring-2 ring-sky-400"
                                                        : "bg-slate-700 hover:bg-slate-600 border-slate-600"
                                                }`}
                                            >
                                                <p className="font-semibold text-slate-100 flex items-center gap-1">
                                                    <Car size={16} /> {v.placa} - {v.modelo}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {v.montadora} - {v.cor} - Ano:{" "}
                                                    {extrairAno(v.anoFabricacao)}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {clienteSelecionado && veiculoSelecionado && (
                            <div className="mt-6 pt-4 border-t border-slate-700 text-center">
                                <h3 className="text-lg font-semibold text-slate-200 mb-3">
                                    3. Prosseguir para Orçamento
                                </h3>
                                <button
                                    onClick={iniciarGeracaoOrcamento}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md shadow-lg flex items-center justify-center gap-2 mx-auto"
                                >
                                    Gerar Orçamento para {veiculoSelecionado.placa}{" "}
                                    <CircleArrowRight size={20} />
                                </button>
                            </div>
                        )}

                        {veiculoSelecionado && (
                            <div className="mt-6 pt-4 border-t border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
                                    <History size={20} className="text-slate-400" /> Histórico do
                                    Veículo{" "}
                                    <span className="font-mono text-xs bg-slate-600 px-1 rounded">
                    {veiculoSelecionado.placa}
                  </span>{" "}
                                    (Opcional)
                                </h3>
                                <p className="text-sm text-slate-500 italic">
                                    (Funcionalidade de histórico ainda não implementada)
                                </p>
                            </div>
                        )}
                    </section>
                )}

                {/* Mensagem inicial --------------------------------------------------- */}
                {!clienteSelecionado &&
                    !isBuscandoCliente &&
                    !error &&
                    clientesEncontrados.length === 0 && (
                        <div className="text-center text-slate-400 mt-10 bg-slate-800/50 p-6 rounded-lg max-w-md mx-auto border border-slate-700">
                            <Search size={40} className="mx-auto mb-4 text-sky-500" />
                            <p>Comece buscando um cliente para iniciar o processo de orçamento.</p>
                        </div>
                    )}
            </main>
        </>
    );
}
