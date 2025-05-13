// src/app/pagamento/alterar/[id]/page.tsx
"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import NavBar from "@/components/nav-bar";
import {
    MdPayment,
    MdSave,
    MdArrowBack,
    MdErrorOutline,
    MdCheckCircle,
    MdCalendarToday,
    MdCreditCard,
    MdAttachMoney,
    MdListAlt,
    MdConfirmationNumber,
} from "react-icons/md";

// <<< NOVO IMPORT – função autenticada >>>
import { fetchAuthenticated } from "@/utils/apiService";

// -----------------------------------------------------------------------------
// Tipos
// -----------------------------------------------------------------------------
interface PagamentoRequest {
    dataPagamento: string;
    tipoPagamento: string;
    descontoPercentual: number;
    totalParcelas: number;
    valorServico: number;
    clienteId?: number | null;
    orcamentoId?: number | null;
}

interface PagamentoResponse extends PagamentoRequest {
    id: number;
}

// -----------------------------------------------------------------------------
// Componente
// -----------------------------------------------------------------------------
export default function AlterarPagamentoPage() {
    const router = useRouter();
    const params = useParams();
    const idPagamento = params.id as string;

    const [dataPagamento, setDataPagamento] = useState("");
    const [tipoPagamento, setTipoPagamento] = useState("dinheiro");
    const [valorServicoStr, setValorServicoStr] = useState("");
    const [descontoPercentual, setDescontoPercentual] = useState(0);
    const [totalParcelas, setTotalParcelas] = useState(1);
    const [valorParcelaDisplay, setValorParcelaDisplay] = useState("0,00");
    const [totalComDescontoDisplay, setTotalComDescontoDisplay] = useState("0,00");
    const [clienteIdStr, setClienteIdStr] = useState<string>("");
    const [orcamentoIdStr, setOrcamentoIdStr] = useState<string>("");

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [notFoundError, setNotFoundError] = useState<string | null>(null);

    // ---------------------------------------------------------------------------
    // Utilidades
    // ---------------------------------------------------------------------------
    const descontosPorTipo: { [key: string]: number } = {
        dinheiro: 20,
        pix: 15,
        debito: 10,
        "credito a vista": 5,
        "credito parcelado": 2,
    };

    const parseCurrency = (formattedValue: string): number => {
        if (!formattedValue) return 0;
        const cleaned = formattedValue
            .replace("R$ ", "")
            .replace(/\./g, "")
            .replace(",", ".");
        return parseFloat(cleaned) || 0;
    };

    const formatCurrency = (value: number | undefined): string => {
        if (value === undefined || value === null) return "0,00";
        return value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    // ---------------------------------------------------------------------------
    // Carregar dados do pagamento
    // ---------------------------------------------------------------------------
    useEffect(() => {
        if (!idPagamento) {
            setNotFoundError("ID do registro de pagamento não fornecido.");
            setIsFetching(false);
            return;
        }

        const fetchPagamento = async () => {
            setError(null);
            setNotFoundError(null);
            setIsFetching(true);

            try {
                // >>> ALTERADO: fetchAuthenticated <<<
                const response = await fetchAuthenticated(`/rest/pagamentos/${idPagamento}`);

                if (response.status === 404) {
                    throw new Error(`Registro de Pagamento ID ${idPagamento} não encontrado.`);
                }
                if (!response.ok) {
                    const errorData = await response
                        .json()
                        .catch(() => ({ message: `Erro HTTP ${response.status}` }));
                    throw new Error(errorData.message || "Falha ao carregar dados");
                }

                const data: PagamentoResponse = await response.json();
                setDataPagamento(
                    data.dataPagamento
                        ? data.dataPagamento.split("T")[0]
                        : new Date().toISOString().split("T")[0]
                );
                setTipoPagamento(data.tipoPagamento);
                setDescontoPercentual(data.descontoPercentual);
                setTotalParcelas(data.totalParcelas || 1);
                setValorServicoStr(formatCurrency(data.valorServico));
                setClienteIdStr(data.clienteId?.toString() || "");
                setOrcamentoIdStr(data.orcamentoId?.toString() || "");
            } catch (err: any) {
                setNotFoundError(err.message);
            } finally {
                setIsFetching(false);
            }
        };

        fetchPagamento();
    }, [idPagamento]);

    // ---------------------------------------------------------------------------
    // Recalcula desconto ao trocar tipo de pagamento
    // ---------------------------------------------------------------------------
    useEffect(() => {
        setDescontoPercentual(descontosPorTipo[tipoPagamento] || 0);
    }, [tipoPagamento]);

    // ---------------------------------------------------------------------------
    // Recalcula valores exibidos
    // ---------------------------------------------------------------------------
    useEffect(() => {
        const valorServicoNum = parseCurrency(valorServicoStr);
        const descontoNum = descontoPercentual || 0;
        const parcelasNum = totalParcelas || 1;

        if (valorServicoNum > 0) {
            const totalComDesc = valorServicoNum * (1 - descontoNum / 100);
            const valorParcela =
                parcelasNum > 0 ? totalComDesc / parcelasNum : 0;
            setTotalComDescontoDisplay(formatCurrency(totalComDesc));
            setValorParcelaDisplay(formatCurrency(valorParcela));
        } else {
            setTotalComDescontoDisplay("0,00");
            setValorParcelaDisplay("0,00");
        }
    }, [valorServicoStr, descontoPercentual, totalParcelas]);

    // ---------------------------------------------------------------------------
    // Submeter alterações
    // ---------------------------------------------------------------------------
    const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const valorServicoNum = parseCurrency(valorServicoStr);
        if (valorServicoNum <= 0) {
            setError("Valor do Serviço deve ser maior que zero para alteração.");
            setIsLoading(false);
            return;
        }

        const requestBody: PagamentoRequest = {
            dataPagamento,
            tipoPagamento,
            descontoPercentual,
            totalParcelas,
            valorServico: valorServicoNum,
            clienteId: clienteIdStr ? parseInt(clienteIdStr, 10) : null,
            orcamentoId: orcamentoIdStr ? parseInt(orcamentoIdStr, 10) : null,
        };

        try {
            // >>> ALTERADO: fetchAuthenticated <<<
            const response = await fetchAuthenticated(
                `/rest/pagamentos/${idPagamento}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestBody),
                }
            );

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => ({ message: `Erro HTTP ${response.status}` }));
                throw new Error(errorData.message || "Erro ao atualizar registro");
            }

            setSuccess("Registro de pagamento atualizado com sucesso!");
            setTimeout(() => {
                setSuccess(null);
                router.push("/pagamento/listar");
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ---------------------------------------------------------------------------
    // Render rápido para loading/404
    // ---------------------------------------------------------------------------
    if (isFetching)
        return (
            <>
                <NavBar active="pagamento-alterar" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <p className="text-sky-300 text-xl">Carregando...</p>
                </main>
            </>
        );

    if (notFoundError)
        return (
            <>
                <NavBar active="pagamento-alterar" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="bg-slate-900 p-8 rounded-lg shadow-xl text-center">
                        <MdErrorOutline className="text-5xl text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 text-lg mb-6">{notFoundError}</p>
                        <Link
                            href="/pagamento/listar"
                            className="px-6 py-3 bg-sky-600 text-white rounded-md shadow hover:bg-sky-700"
                        >
                            Voltar para Lista
                        </Link>
                    </div>
                </main>
            </>
        );

    // ---------------------------------------------------------------------------
    // Render principal
    // ---------------------------------------------------------------------------
    return (
        <>
            <NavBar active="pagamento-alterar" />
            <main className="container mx-auto px-4 py-12 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-8 text-center">
                        <MdPayment className="text-3xl text-sky-400" />
                        Alterar Registro de Pagamento (ID: {idPagamento})
                    </h1>

                    <form onSubmit={handleUpdate} className="space-y-5">
                        {/* Mensagens ----------------------------------------------------- */}
                        {error && (
                            <div
                                className="relative text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500"
                                role="alert"
                            >
                                <div className="flex items-center gap-2">
                                    <MdErrorOutline className="text-xl" />
                                    <span>{error}</span>
                                </div>
                                <button
                                    type="button"
                                    className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-red-200"
                                    onClick={() => setError(null)}
                                    aria-label="Fechar"
                                >
                                    <span className="text-xl">&times;</span>
                                </button>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center justify-center gap-2 text-green-400 p-3 rounded bg-green-900/30 border border-green-700">
                                <MdCheckCircle className="text-xl" />
                                <span>{success}</span>
                            </div>
                        )}

                        {/* Detalhes do pagamento --------------------------------------- */}
                        <fieldset className="border border-slate-700 p-4 rounded space-y-4">
                            <legend className="text-lg font-semibold px-2 text-slate-300">
                                Detalhes do Pagamento
                            </legend>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Data */}
                                <div>
                                    <label
                                        htmlFor="data_pagamento_alt"
                                        className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"
                                    >
                                        <MdCalendarToday size={16} /> Data:
                                    </label>
                                    <input
                                        type="date"
                                        id="data_pagamento_alt"
                                        required
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700 date-input-fix"
                                        value={dataPagamento}
                                        onChange={(e) => setDataPagamento(e.target.value)}
                                    />
                                </div>

                                {/* Tipo */}
                                <div>
                                    <label
                                        htmlFor="tipo_pagamento_alt"
                                        className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"
                                    >
                                        <MdCreditCard size={16} /> Tipo Pagamento:
                                    </label>
                                    <select
                                        id="tipo_pagamento_alt"
                                        required
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"
                                        value={tipoPagamento}
                                        onChange={(e) => setTipoPagamento(e.target.value)}
                                    >
                                        <option value="dinheiro">Dinheiro</option>
                                        <option value="pix">PIX</option>
                                        <option value="debito">Débito</option>
                                        <option value="credito a vista">Crédito à Vista</option>
                                        <option value="credito parcelado">Crédito Parcelado</option>
                                    </select>
                                </div>

                                {/* Valor Serviço */}
                                <div>
                                    <label
                                        htmlFor="valor_servico_alt"
                                        className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"
                                    >
                                        <MdAttachMoney size={16} /> Valor Serviço (R$):
                                    </label>
                                    <input
                                        type="text"
                                        id="valor_servico_alt"
                                        required
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"
                                        value={valorServicoStr}
                                        onChange={(e) => setValorServicoStr(e.target.value)}
                                        placeholder="Ex: 1500,50"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Confirme/atualize o valor original do serviço.
                                    </p>
                                </div>

                                {/* Desconto % */}
                                <div>
                                    <label
                                        htmlFor="desconto_alt"
                                        className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"
                                    >
                                        <MdConfirmationNumber size={16} /> Desconto (%):
                                    </label>
                                    <input
                                        type="number"
                                        id="desconto_alt"
                                        readOnly
                                        className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 cursor-not-allowed"
                                        value={descontoPercentual}
                                    />
                                </div>

                                {/* Nº Parcelas */}
                                <div>
                                    <label
                                        htmlFor="total_parcelas_alt"
                                        className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"
                                    >
                                        <MdListAlt size={16} /> Nº Parcelas:
                                    </label>
                                    <select
                                        id="total_parcelas_alt"
                                        required
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"
                                        value={totalParcelas}
                                        onChange={(e) =>
                                            setTotalParcelas(parseInt(e.target.value, 10))
                                        }
                                    >
                                        <option value="1">1X</option>
                                        <option value="2">2X</option>
                                        <option value="3">3X</option>
                                        <option value="4">4X</option>
                                        <option value="5">5X</option>
                                    </select>
                                </div>

                                {/* Valor Parcela */}
                                <div>
                                    <label
                                        htmlFor="valor_parcela_alt_display"
                                        className="block mb-1 text-sm font-medium text-slate-400"
                                    >
                                        Valor Parcela (R$):
                                    </label>
                                    <input
                                        type="text"
                                        id="valor_parcela_alt_display"
                                        readOnly
                                        className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 cursor-not-allowed"
                                        value={valorParcelaDisplay}
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label
                                    htmlFor="valor_total_desconto_alt_display"
                                    className="block mb-1 text-sm font-medium text-slate-400"
                                >
                                    Valor Total c/ Desconto (R$):
                                </label>
                                <input
                                    type="text"
                                    id="valor_total_desconto_alt_display"
                                    readOnly
                                    className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 font-semibold cursor-not-allowed"
                                    value={totalComDescontoDisplay}
                                />
                            </div>
                        </fieldset>

                        {/* Associações --------------------------------------------------- */}
                        <fieldset className="border border-slate-700 p-4 rounded space-y-4">
                            <legend className="text-lg font-semibold px-2 text-slate-300">
                                Associações (Opcional)
                            </legend>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="clienteIdStr_alt"
                                        className="block mb-1 text-sm font-medium text-slate-300"
                                    >
                                        ID Cliente:
                                    </label>
                                    <input
                                        type="number"
                                        id="clienteIdStr_alt"
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"
                                        value={clienteIdStr}
                                        onChange={(e) => setClienteIdStr(e.target.value)}
                                        placeholder="ID do cliente"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="orcamentoIdStr_alt"
                                        className="block mb-1 text-sm font-medium text-slate-300"
                                    >
                                        ID Orçamento:
                                    </label>
                                    <input
                                        type="number"
                                        id="orcamentoIdStr_alt"
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"
                                        value={orcamentoIdStr}
                                        onChange={(e) => setOrcamentoIdStr(e.target.value)}
                                        placeholder="ID do orçamento"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* Botões -------------------------------------------------------- */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button
                                type="submit"
                                className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-green-600 rounded-md shadow hover:bg-green-700 ${
                                    isLoading || isFetching ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                disabled={isLoading || isFetching}
                            >
                                {isLoading ? "Salvando..." : <><MdSave size={20}/> Salvar Alterações</>}
                            </button>

                            <Link
                                href="/pagamento/listar"
                                className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 text-center"
                            >
                                <MdArrowBack size={20} /> Cancelar
                            </Link>
                        </div>
                    </form>
                </div>
            </main>

            {/* Ajuste de cor no date input */}
            <style jsx global>{`
        .date-input-fix::-webkit-calendar-picker-indicator {
          filter: invert(0.8);
          cursor: pointer;
        }
        input[type="date"]:required:invalid::-webkit-datetime-edit {
          color: transparent;
        }
        input[type="date"]:focus::-webkit-datetime-edit {
          color: white !important;
        }
        input[type="date"]::-webkit-datetime-edit {
          color: white;
        }
      `}</style>
        </>
    );
}
