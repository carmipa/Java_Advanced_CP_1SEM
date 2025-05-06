// src/app/pagamento/cadastrar/page.tsx
"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdPayment, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle, MdAttachMoney, MdCalendarToday, MdCreditCard, MdListAlt, MdConfirmationNumber } from 'react-icons/md';

interface PagamentoRequest {
    dataPagamento: string;
    tipoPagamento: string;
    descontoPercentual: number;
    totalParcelas: number;
    valorServico: number;
    clienteId?: number | null;
    orcamentoId?: number | null;
}

export default function CadastrarPagamentoPage() {
    const today = new Date().toISOString().split('T')[0];
    const [dataPagamento, setDataPagamento] = useState(today);
    const [tipoPagamento, setTipoPagamento] = useState("dinheiro");
    const [valorServicoStr, setValorServicoStr] = useState("");
    const [descontoPercentual, setDescontoPercentual] = useState(20);
    const [totalParcelas, setTotalParcelas] = useState(1);
    const [valorParcelaDisplay, setValorParcelaDisplay] = useState("0,00");
    const [totalComDescontoDisplay, setTotalComDescontoDisplay] = useState("0,00");
    const [clienteIdStr, setClienteIdStr] = useState<string>("");
    const [orcamentoIdStr, setOrcamentoIdStr] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const descontosPorTipo: { [key: string]: number } = {
        dinheiro: 20, pix: 15, debito: 10,
        'credito a vista': 5, 'credito parcelado': 2,
    };

    useEffect(() => {
        setDescontoPercentual(descontosPorTipo[tipoPagamento] || 0);
    }, [tipoPagamento]);

    const parseCurrency = (formattedValue: string): number => {
        if (!formattedValue) return 0;
        const cleanedValue = formattedValue.replace("R$ ", "").replace(/\./g, "").replace(",", ".");
        return parseFloat(cleanedValue) || 0;
    };

    const formatCurrency = (value: number): string => {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    useEffect(() => {
        const valorServicoNum = parseCurrency(valorServicoStr);
        const descontoNum = descontoPercentual || 0;
        const parcelasNum = totalParcelas || 1;
        if (valorServicoNum > 0) {
            const totalComDesc = valorServicoNum * (1 - (descontoNum / 100));
            const valorParcela = parcelasNum > 0 ? totalComDesc / parcelasNum : 0;
            setTotalComDescontoDisplay(formatCurrency(totalComDesc));
            setValorParcelaDisplay(formatCurrency(valorParcela));
        } else {
            setTotalComDescontoDisplay("0,00");
            setValorParcelaDisplay("0,00");
        }
    }, [valorServicoStr, descontoPercentual, totalParcelas]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true); setError(null); setSuccess(null);
        const valorServicoNum = parseCurrency(valorServicoStr);

        if (valorServicoNum <= 0) {
            setError("Valor do Serviço deve ser maior que zero.");
            setIsLoading(false); return;
        }

        const requestBody: PagamentoRequest = {
            dataPagamento, tipoPagamento, descontoPercentual, totalParcelas, valorServico: valorServicoNum,
            clienteId: clienteIdStr ? parseInt(clienteIdStr, 10) : null,
            orcamentoId: orcamentoIdStr ? parseInt(orcamentoIdStr, 10) : null,
        };
        try {
            const response = await fetch("http://localhost:8080/rest/pagamentos", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}.` }));
                throw new Error(errorData.message || `Erro ${response.status}`);
            }
            setSuccess("Pagamento registrado com sucesso!");
            setDataPagamento(today); setTipoPagamento("dinheiro");
            setValorServicoStr(""); setTotalParcelas(1);
            setClienteIdStr(""); setOrcamentoIdStr("");
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || "Falha ao registrar pagamento.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <NavBar active="pagamento-cadastrar" />
            <main className="container mx-auto px-4 py-12 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-8 text-center">
                        <MdPayment className="text-3xl text-sky-400" />
                        Registrar Novo Pagamento
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="relative text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                                <div className="flex items-center gap-2"> <MdErrorOutline className="text-xl" /> <span>{error}</span> </div>
                                <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-xl">&times;</span></button>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center justify-center gap-2 text-green-400 p-3 rounded bg-green-900/30 border border-green-700">
                                <MdCheckCircle className="text-xl" /> <span>{success}</span>
                            </div>
                        )}

                        <fieldset className="border border-slate-700 p-4 rounded space-y-4">
                            <legend className="text-lg font-semibold px-2 text-slate-300">Detalhes do Pagamento</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="data_pagamento" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><MdCalendarToday size={16}/> Data:</label>
                                    <input type="date" id="data_pagamento" name="data_pagamento" required className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 date-input-fix" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="tipo_pagamento" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><MdCreditCard size={16}/> Tipo Pagamento:</label>
                                    <select id="tipo_pagamento" name="tipo_pagamento" required className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={tipoPagamento} onChange={(e) => setTipoPagamento(e.target.value)} >
                                        <option value="dinheiro">Dinheiro</option> <option value="pix">PIX</option> <option value="debito">Débito</option>
                                        <option value="credito a vista">Crédito à Vista</option> <option value="credito parcelado">Crédito Parcelado</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="valor_servico" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><MdAttachMoney size={16}/> Valor Serviço (R$):</label>
                                    <input type="text" id="valor_servico" name="valor_servico" required className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={valorServicoStr} onChange={e => setValorServicoStr(e.target.value)} placeholder="Ex: 1500,50" />
                                </div>
                                <div>
                                    <label htmlFor="desconto" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><MdConfirmationNumber size={16}/> Desconto (%):</label>
                                    <input type="number" id="desconto" name="desconto" readOnly className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 cursor-not-allowed" value={descontoPercentual} />
                                </div>
                                <div>
                                    <label htmlFor="total_parcelas" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><MdListAlt size={16}/> Nº Parcelas:</label>
                                    <select id="total_parcelas" name="total_parcelas" required className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={totalParcelas} onChange={(e) => setTotalParcelas(parseInt(e.target.value, 10))} >
                                        <option value="1">1X</option> <option value="2">2X</option> <option value="3">3X</option>
                                        <option value="4">4X</option> <option value="5">5X</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="valor_parcela" className="block mb-1 text-sm font-medium text-slate-400">Valor Parcela (R$):</label>
                                    <input type="text" id="valor_parcela" readOnly className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 cursor-not-allowed" value={valorParcelaDisplay} />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="valor_total_desconto" className="block mb-1 text-sm font-medium text-slate-400">Valor Total c/ Desconto (R$):</label>
                                <input type="text" id="valor_total_desconto" readOnly className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 cursor-not-allowed font-semibold" value={totalComDescontoDisplay} />
                            </div>
                        </fieldset>

                        <fieldset className="border border-slate-700 p-4 rounded space-y-4">
                            <legend className="text-lg font-semibold px-2 text-slate-300">Associações (Opcional)</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="clienteIdStr" className="block mb-1 text-sm font-medium text-slate-300">ID Cliente:</label>
                                    <input type="number" id="clienteIdStr" name="clienteIdStr" className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={clienteIdStr} onChange={(e) => setClienteIdStr(e.target.value)} placeholder="ID numérico do cliente" />
                                </div>
                                <div>
                                    <label htmlFor="orcamentoIdStr" className="block mb-1 text-sm font-medium text-slate-300">ID Orçamento:</label>
                                    <input type="number" id="orcamentoIdStr" name="orcamentoIdStr" className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={orcamentoIdStr} onChange={(e) => setOrcamentoIdStr(e.target.value)} placeholder="ID numérico do orçamento" />
                                </div>
                            </div>
                        </fieldset>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button type="submit" className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-sky-600 rounded-md shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isLoading} >
                                {isLoading ? 'Salvando...' : (<><MdSave size={20}/> Salvar Registro</>)}
                            </button>
                            <Link href="/pagamento/listar" className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                                <MdArrowBack size={20}/> Voltar para Lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: white !important; }
                input[type="date"]::-webkit-datetime-edit { color: white; }
            `}</style>
        </>
    );
}