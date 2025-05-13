// src/app/pecas/buscar/page.tsx
"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import NavBar from "@/components/nav-bar";
import {
    Search,
    Package,
    Car,
    Building,
    Tag,
    Calendar,
    DollarSign,
    Percent,
    Calculator,
    Hash,
    Edit3,
    Trash2,
    Loader2,
    AlertCircle,
    Filter,
    ListX,
    ArrowLeft,
} from "lucide-react";
import { MdErrorOutline } from "react-icons/md";

// <<< NOVO IMPORT – função autenticada >>>
import { fetchAuthenticated } from "@/utils/apiService";

// -----------------------------------------------------------------------------
// Interfaces
// -----------------------------------------------------------------------------
interface PecaResponseDto {
    id: number;
    tipoVeiculo: string;
    fabricante: string;
    descricao: string;
    dataCompra: string;
    preco: number;
    desconto: number;
    totalDesconto: number;
}
interface PecaParaLista {
    id: number;
    tipoVeiculo: string;
    fabricante: string;
    descricaoPeca: string;
    dataCompraFormatada: string;
    precoFormatado: string;
    descontoFormatado: string;
    totalComDescontoFormatado: string;
}
type TipoBuscaPeca = "descricaoPeca" | "fabricante" | "tipoVeiculo";

// -----------------------------------------------------------------------------
// Componente
// -----------------------------------------------------------------------------
export default function BuscarPecasPage() {
    const [todasPecas, setTodasPecas] = useState<PecaParaLista[]>([]);
    const [resultadosBusca, setResultadosBusca] = useState<PecaParaLista[]>([]);
    const [tipoBusca, setTipoBusca] = useState<TipoBuscaPeca>("descricaoPeca");
    const [termoBusca, setTermoBusca] = useState("");
    const [isLoadingAll, setIsLoadingAll] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [buscaRealizada, setBuscaRealizada] = useState(false);

    // helpers de formatação
    const formatCurrency = (v: number) =>
        v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const formatDate = (d: string) =>
        new Date(`${d}T00:00:00Z`).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
        });

    // ---------------------------------------------------------------------------
    // Carrega todas as peças para busca client-side
    // ---------------------------------------------------------------------------
    const fetchTodasPecas = async () => {
        if (todasPecas.length > 0 || isLoadingAll) return;
        setIsLoadingAll(true);
        setError(null);
        try {
            // >>> ALTERADO: fetchAuthenticated <<<
            const resp = await fetchAuthenticated("/rest/pecas/all");
            if (!resp.ok) {
                if (resp.status === 204) {
                    setTodasPecas([]);
                    return;
                }
                throw new Error(`Erro HTTP ${resp.status}: Falha ao buscar peças.`);
            }
            const data: PecaResponseDto[] = await resp.json();
            data.sort((a, b) => a.id - b.id);
            const map = data.map((dto) => ({
                id: dto.id,
                tipoVeiculo: dto.tipoVeiculo || "-",
                fabricante: dto.fabricante || "-",
                descricaoPeca: dto.descricao || "-",
                dataCompraFormatada: dto.dataCompra ? formatDate(dto.dataCompra) : "-",
                precoFormatado: formatCurrency(dto.preco),
                descontoFormatado: formatCurrency(dto.desconto),
                totalComDescontoFormatado: formatCurrency(dto.totalDesconto),
            }));
            setTodasPecas(map);
        } catch (e: any) {
            setError(e.message);
            setTodasPecas([]);
        } finally {
            setIsLoadingAll(false);
        }
    };
    useEffect(() => {
        fetchTodasPecas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // placeholder dinâmico
    const getPlaceholder = () =>
        tipoBusca === "descricaoPeca"
            ? "Digite parte da descrição..."
            : tipoBusca === "fabricante"
                ? "Digite parte do fabricante/marca..."
                : "Digite o tipo (Carro, Moto...)";

    // ---------------------------------------------------------------------------
    // Busca / filtro local
    // ---------------------------------------------------------------------------
    const handleSearch = (e?: FormEvent) => {
        if (e) e.preventDefault();
        setBuscaRealizada(true);
        setIsSearching(true);
        setError(null);

        if (isLoadingAll) {
            setError("Aguarde o carregamento inicial dos dados.");
            setIsSearching(false);
            return;
        }
        if (!termoBusca.trim()) {
            setResultadosBusca([]);
            setIsSearching(false);
            return;
        }

        const q = termoBusca.trim().toLowerCase();
        const filtro =
            tipoBusca === "descricaoPeca"
                ? (p: PecaParaLista) => p.descricaoPeca.toLowerCase().includes(q)
                : tipoBusca === "fabricante"
                    ? (p: PecaParaLista) => p.fabricante.toLowerCase().includes(q)
                    : (p: PecaParaLista) => p.tipoVeiculo.toLowerCase().includes(q);

        setResultadosBusca(todasPecas.filter(filtro));
        setIsSearching(false);
    };

    // ---------------------------------------------------------------------------
    // Delete
    // ---------------------------------------------------------------------------
    const handleDelete = async (id: number) => {
        if (!window.confirm(`Excluir peça ID ${id}?`)) return;
        setError(null);
        try {
            // >>> ALTERADO: fetchAuthenticated <<<
            const resp = await fetchAuthenticated(`/rest/pecas/${id}`, {
                method: "DELETE",
            });
            if (!resp.ok && resp.status !== 204)
                throw new Error("Falha ao excluir peça.");
            alert("Peça excluída com sucesso!");
            setTodasPecas((prev) => prev.filter((p) => p.id !== id));
            setResultadosBusca((prev) => prev.filter((p) => p.id !== id));
        } catch (e: any) {
            setError(e.message || "Erro ao excluir.");
        }
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
        <>
            <NavBar active="pecas-buscar" />

            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="flex items-center justify-center text-2xl md:text-3xl font-bold mb-8 gap-2">
                    <Search size={28} className="text-sky-400" /> Buscar Peças
                </h1>

                {/* form de busca */}
                <div className="bg-slate-800 p-4 md:p-6 rounded-lg shadow-lg max-w-3xl mx-auto mb-8 border border-slate-700">
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col sm:flex-row gap-4 items-end"
                    >
                        {/* select tipo */}
                        <div className="flex-shrink-0 w-full sm:w-auto">
                            <label
                                htmlFor="tipoBuscaPeca"
                                className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1"
                            >
                                <Filter size={16} />
                                Buscar por:
                            </label>
                            <select
                                id="tipoBuscaPeca"
                                value={tipoBusca}
                                onChange={(e) => {
                                    setTipoBusca(e.target.value as TipoBuscaPeca);
                                    setTermoBusca("");
                                    setResultadosBusca([]);
                                    setBuscaRealizada(false);
                                }}
                                className="w-full sm:w-48 p-2 h-10 rounded bg-slate-700 border border-slate-600"
                            >
                                <option value="descricaoPeca">Descrição</option>
                                <option value="fabricante">Fabricante/Marca</option>
                                <option value="tipoVeiculo">Tipo Veículo</option>
                            </select>
                        </div>

                        {/* termo */}
                        <div className="flex-grow w-full">
                            <label
                                htmlFor="termoBuscaPeca"
                                className="block text-sm font-medium text-slate-300 mb-1"
                            >
                                Termo:
                            </label>
                            <input
                                id="termoBuscaPeca"
                                type="text"
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                required
                                placeholder={getPlaceholder()}
                                className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600"
                            />
                        </div>

                        {/* botão */}
                        <button
                            type="submit"
                            disabled={isLoadingAll || isSearching}
                            className={`flex-shrink-0 w-full sm:w-auto h-10 px-5 py-2 rounded text-white font-semibold flex items-center justify-center gap-2 ${
                                isLoadingAll || isSearching
                                    ? "bg-sky-800 opacity-70 cursor-not-allowed"
                                    : "bg-sky-600 hover:bg-sky-700"
                            }`}
                        >
                            <Search size={18} />
                            {isSearching
                                ? "Buscando..."
                                : isLoadingAll
                                    ? "Carregando Base..."
                                    : "Buscar"}
                        </button>
                    </form>
                </div>

                {/* loading base */}
                {isLoadingAll && (
                    <p className="text-center text-sky-300 py-10">
                        Carregando dados base...
                    </p>
                )}

                {/* erro */}
                {error && (
                    <div className="relative max-w-3xl mx-auto mb-6 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500 text-sm">
                        <MdErrorOutline className="inline mr-2" />
                        {error}
                        <button
                            type="button"
                            className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-red-200"
                            onClick={() => setError(null)}
                        >
                            &times;
                        </button>
                    </div>
                )}

                {/* resultados */}
                {!isLoadingAll && buscaRealizada && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4 text-center text-sky-300">
                            Resultados da Busca
                        </h2>

                        {isSearching ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                                <span className="ml-3 text-sky-300">Filtrando...</span>
                            </div>
                        ) : resultadosBusca.length === 0 ? (
                            <p className="text-center text-slate-400 py-10 bg-slate-800/50 rounded-lg shadow flex items-center justify-center gap-2">
                                <ListX size={20} /> Nenhuma peça encontrada para "
                                {termoBusca}" em "{tipoBusca}".
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {resultadosBusca.map((p) => (
                                    <div
                                        key={p.id}
                                        className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20"
                                    >
                                        <div className="bg-slate-700 p-3 flex justify-between text-sm">
                      <span className="flex items-center gap-1 font-semibold text-sky-300">
                        <Hash size={16} /> ID: {p.id}
                      </span>
                                            <span className="flex items-center gap-1 text-slate-400 uppercase text-xs">
                        <Car size={16} /> {p.tipoVeiculo}
                      </span>
                                        </div>

                                        <div className="p-4 space-y-2 flex-grow text-sm">
                                            <p>
                                                <strong>
                                                    <Tag size={16} className="-mt-1 mr-1 inline" />
                                                    Descrição:
                                                </strong>{" "}
                                                {p.descricaoPeca}
                                            </p>
                                            <p>
                                                <strong>
                                                    <Building size={16} className="-mt-1 mr-1 inline" />
                                                    Fabricante:
                                                </strong>{" "}
                                                {p.fabricante}
                                            </p>
                                            <p>
                                                <strong>
                                                    <Calendar size={16} className="-mt-1 mr-1 inline" />
                                                    Compra:
                                                </strong>{" "}
                                                {p.dataCompraFormatada}
                                            </p>
                                            <div className="grid grid-cols-3 gap-x-2 pt-2 border-t border-slate-700/50">
                                                <p className="text-center">
                          <span className="block text-xs text-slate-400">
                            Preço
                          </span>
                                                    {p.precoFormatado}
                                                </p>
                                                <p className="text-center">
                          <span className="block text-xs text-slate-400">
                            Desc.
                          </span>
                                                    {p.descontoFormatado}
                                                </p>
                                                <p className="text-center">
                          <span className="block text-xs text-slate-400">
                            Final
                          </span>
                                                    <strong className="text-green-400">
                                                        {p.totalComDescontoFormatado}
                                                    </strong>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 p-3 mt-auto border-t border-slate-700 flex justify-end gap-2">
                                            <Link href={`/pecas/alterar/${p.id}`}>
                                                <button className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-xs font-medium gap-1">
                                                    <Edit3 size={14} /> Editar
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium gap-1"
                                            >
                                                <Trash2 size={14} /> Deletar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* mensagem inicial */}
                {!isLoadingAll && !buscaRealizada && (
                    <div className="text-center text-slate-400 mt-10 bg-slate-800/50 p-6 rounded-lg max-w-md mx-auto border border-slate-700">
                        <Search size={40} className="mx-auto mb-4 text-sky-500" />
                        <p>Utilize os filtros acima para buscar peças no catálogo.</p>
                    </div>
                )}

                {/* voltar */}
                <div className="mt-10 text-center">
                    <Link href="/pecas/listar">
                        <button className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md shadow flex items-center gap-2 mx-auto">
                            <ArrowLeft size={18} /> Voltar para Lista
                        </button>
                    </Link>
                </div>
            </main>
        </>
    );
}
