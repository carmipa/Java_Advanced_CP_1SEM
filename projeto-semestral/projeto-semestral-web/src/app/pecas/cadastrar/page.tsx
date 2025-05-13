// src/app/pecas/cadastrar/page.tsx
"use client";

import React, { useState, FormEvent, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/nav-bar";
import {
    CirclePlus,
    Package,
    Car,
    Building,
    Tag,
    Calendar,
    DollarSign,
    Percent,
    Calculator,
    Save,
    ArrowLeft,
    Info,
    AlertCircle,
    CheckCircle,
    Loader2,
} from "lucide-react";
import { MdErrorOutline, MdCheckCircle } from "react-icons/md";

// <<< import da função autenticada >>>
import { fetchAuthenticated } from "@/utils/apiService";

// -----------------------------------------------------------------------------
// Tipos / Interfaces
// -----------------------------------------------------------------------------
interface PecaFormData {
    tipoVeiculo: string;
    fabricante: string;
    descricaoPeca: string;
    dataCompra: string;
    preco: string;
    desconto: string;
}
const tiposVeiculo = [
    "Carro",
    "Moto",
    "Caminhão",
    "Ônibus",
    "Utilitário",
    "Outro",
];

// -----------------------------------------------------------------------------
// Componente
// -----------------------------------------------------------------------------
export default function CadastrarPecaPage() {
    const router = useRouter();
    const today = new Date().toISOString().split("T")[0];

    const initialState: PecaFormData = {
        tipoVeiculo: "",
        fabricante: "",
        descricaoPeca: "",
        dataCompra: today,
        preco: "0,00",
        desconto: "0,00",
    };

    const [formData, setFormData] = useState<PecaFormData>(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // ---------------------------------------------------------------------------
    // helpers currency
    // ---------------------------------------------------------------------------
    const parseCurrency = (s: string) =>
        parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
    const formatAsCurrency = (n: number) =>
        n.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
        });

    const totalComDesconto = useMemo(() => {
        const p = parseCurrency(formData.preco);
        const d = parseCurrency(formData.desconto);
        return Math.max(0, p - d);
    }, [formData.preco, formData.desconto]);

    // ---------------------------------------------------------------------------
    // handlers
    // ---------------------------------------------------------------------------
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value.replace(/[^0-9,]/g, "") }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        const precoNum = parseCurrency(formData.preco);
        const descontoNum = parseCurrency(formData.desconto);

        if (precoNum <= 0) {
            setError("O preço da peça deve ser maior que zero.");
            setIsSubmitting(false);
            return;
        }
        if (descontoNum < 0) {
            setError("O desconto não pode ser negativo.");
            setIsSubmitting(false);
            return;
        }
        if (descontoNum > precoNum) {
            setError("O desconto não pode ser maior que o preço.");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            tipoVeiculo: formData.tipoVeiculo,
            fabricante: formData.fabricante,
            descricao: formData.descricaoPeca,
            dataCompra: formData.dataCompra,
            preco: precoNum,
            desconto: descontoNum,
            totalDesconto: precoNum - descontoNum,
        };

        try {
            // >>> ALTERADO para fetchAuthenticated <<<
            const response = await fetchAuthenticated("/rest/pecas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const msg =
                    (await response.json().catch(() => null))?.message ||
                    `Erro HTTP ${response.status}`;
                throw new Error(msg);
            }

            const result = await response.json();
            setSuccess(
                `Peça "${result.descricao}" (ID: ${result.id}) cadastrada com sucesso!`
            );
            setFormData(initialState);
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || "Falha ao cadastrar peça.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ---------------------------------------------------------------------------
    // render
    // ---------------------------------------------------------------------------
    return (
        <>
            <NavBar active="pecas-cadastrar" />
            <main className="container mx-auto px-4 py-10 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-3xl mx-auto border border-slate-700">
                    <h1 className="flex items-center justify-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-center">
                        <CirclePlus size={30} className="text-sky-400" />
                        Cadastrar Nova Peça
                    </h1>

                    {/* mensagens */}
                    {error && (
                        <div className="relative mb-6 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500 text-sm">
                            <MdErrorOutline className="inline mr-2" />
                            {error}
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 px-4 py-3"
                                onClick={() => setError(null)}
                            >
                                &times;
                            </button>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center justify-center gap-2 text-green-400 p-3 mb-6 rounded bg-green-900/30 border border-green-700 text-sm">
                            <MdCheckCircle className="text-lg" /> {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* tipo veículo */}
                            <div>
                                <label className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300">
                                    <Car size={16} /> Tipo Veículo:
                                </label>
                                <select
                                    name="tipoVeiculo"
                                    value={formData.tipoVeiculo}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-10 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md"
                                >
                                    <option value="" disabled>
                                        Selecione...
                                    </option>
                                    {tiposVeiculo.map((tv) => (
                                        <option key={tv} value={tv}>
                                            {tv}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* fabricante */}
                            <div>
                                <label className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300">
                                    <Building size={16} /> Fabricante/Marca:
                                </label>
                                <input
                                    type="text"
                                    name="fabricante"
                                    value={formData.fabricante}
                                    onChange={handleChange}
                                    maxLength={50}
                                    required
                                    className="w-full h-10 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md"
                                />
                            </div>

                            {/* descrição */}
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300">
                                    <Tag size={16} /> Descrição:
                                </label>
                                <input
                                    type="text"
                                    name="descricaoPeca"
                                    value={formData.descricaoPeca}
                                    onChange={handleChange}
                                    maxLength={50}
                                    required
                                    className="w-full h-10 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md"
                                />
                            </div>

                            {/* data compra */}
                            <div>
                                <label className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300">
                                    <Calendar size={16} /> Data Compra:
                                </label>
                                <input
                                    type="date"
                                    name="dataCompra"
                                    value={formData.dataCompra}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-10 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md date-input-fix"
                                />
                            </div>

                            {/* preço */}
                            <div>
                                <label className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300">
                                    <DollarSign size={16} /> Preço (R$):
                                </label>
                                <input
                                    type="text"
                                    name="preco"
                                    value={formData.preco}
                                    onChange={handleCurrencyChange}
                                    required
                                    className="w-full h-10 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md"
                                />
                            </div>

                            {/* desconto */}
                            <div>
                                <label className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300">
                                    <Percent size={16} /> Desconto (R$):
                                </label>
                                <input
                                    type="text"
                                    name="desconto"
                                    value={formData.desconto}
                                    onChange={handleCurrencyChange}
                                    required
                                    className="w-full h-10 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md"
                                />
                            </div>

                            {/* total */}
                            <div>
                                <label className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-400">
                                    <Calculator size={16} /> Preço Final:
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={formatAsCurrency(totalComDesconto)}
                                    className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-green-400 font-semibold cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* botões */}
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 border-t border-slate-700">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex items-center gap-2 px-8 py-3 rounded-md font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow ${
                                    isSubmitting && "opacity-50 cursor-not-allowed"
                                }`}
                            >
                                <Save size={18} />
                                {isSubmitting ? "Salvando..." : "Salvar Nova Peça"}
                            </button>
                            <Link href="/pecas/listar">
                                <button
                                    type="button"
                                    className="flex items-center gap-2 px-8 py-3 rounded-md font-semibold text-white bg-slate-600 hover:bg-slate-700 shadow"
                                >
                                    <ArrowLeft size={18} /> Voltar para Lista
                                </button>
                            </Link>
                        </div>
                    </form>
                </div>
            </main>

            <style jsx global>{`
        .date-input-fix::-webkit-calendar-picker-indicator {
          filter: invert(0.8);
          cursor: pointer;
        }
      `}</style>
        </>
    );
}
