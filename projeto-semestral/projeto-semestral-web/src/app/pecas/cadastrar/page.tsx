// src/app/pecas/cadastrar/page.tsx
"use client";

import React, { useState, FormEvent, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import {
    CirclePlus, Package, Car, Building, Tag, Calendar, DollarSign, Percent, Calculator, Save, ArrowLeft,
    Info, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';

// Interfaces (baseadas na tabela PECAS e DTOs)
interface PecaFormData {
    tipoVeiculo: string;
    fabricante: string;      // Assumindo ser a Marca da PEÇA por enquanto
    descricaoPeca: string;   // Mapeia para DESCRICA_PECA
    dataCompra: string;
    preco: string;           // Input como string para formatação
    desconto: string;        // Input como string (valor ou %)
    // totalDesconto não será um input, será calculado
}

// Tipos de veículo (pode vir do backend ou ser constante)
const tiposVeiculo = ["Carro", "Moto", "Caminhão", "Ônibus", "Utilitário", "Outro"];

export default function CadastrarPecaPage() {
    const router = useRouter();
    const today = new Date().toISOString().split('T')[0];

    const initialState: PecaFormData = {
        tipoVeiculo: "",
        fabricante: "",
        descricaoPeca: "",
        dataCompra: today,
        preco: "0,00",
        desconto: "0,00", // Inicializa como valor
    };

    const [formData, setFormData] = useState<PecaFormData>(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isDescontoPercentual] = useState(false); // Controle se desconto é % (Pode implementar no futuro)

    // Função para formatar/parsear valores monetários (igual ao orçamento)
    const parseInputCurrencyToNumber = (inputValue: string): number => {
        if (!inputValue) return 0;
        const cleaned = inputValue.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    };
    const formatNumberToInputCurrencyString = (value: number): string => {
        return value.toFixed(2).replace('.', ',');
    };
    const formatNumberToDisplayCurrencyString = (value: number): string => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const cleanedValue = value.replace(/[^0-9,]/g, ''); // Permite só números e vírgula
        // Formatação básica enquanto digita (pode melhorar com libs)
        // let formattedValue = cleanedValue;
        // if (cleanedValue.includes(',')) {
        //     const parts = cleanedValue.split(',');
        //     formattedValue = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (parts[1] ? `,${parts[1].slice(0, 2)}` : '');
        // } else {
        //     formattedValue = cleanedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        // }
        setFormData(prev => ({ ...prev, [name]: cleanedValue }));
    };

    // Cálculo do Total com Desconto
    const totalComDesconto = useMemo(() => {
        const precoNum = parseInputCurrencyToNumber(formData.preco);
        const descontoNum = parseInputCurrencyToNumber(formData.desconto);

        if (precoNum <= 0) return 0;

        // Por enquanto, assume que 'desconto' é um valor fixo
        const total = precoNum - descontoNum;
        return Math.max(0, total); // Garante que não seja negativo

    }, [formData.preco, formData.desconto]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true); setError(null); setSuccess(null);

        const precoNum = parseInputCurrencyToNumber(formData.preco);
        const descontoNum = parseInputCurrencyToNumber(formData.desconto);
        const totalDescNum = totalComDesconto; // Usa o valor calculado

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
            descricao: formData.descricaoPeca, // Nome do campo no DTO/Backend
            dataCompra: formData.dataCompra,
            preco: precoNum,
            desconto: descontoNum,
            totalDesconto: totalDescNum
        };

        console.log("Enviando payload Peça:", JSON.stringify(payload, null, 2));

        try {
            const response = await fetch("http://localhost:8080/rest/pecas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro HTTP ${response.status}` }));
                throw new Error(errorData.message || `Erro ao cadastrar peça`);
            }

            const result = await response.json();
            setSuccess(`Peça "${result.descricao}" (ID: ${result.id}) cadastrada com sucesso!`);
            setFormData(initialState); // Limpa o formulário
            setTimeout(() => setSuccess(null), 5000);

        } catch (err: any) {
            setError(err.message || "Falha ao cadastrar peça.");
            console.error("Erro no fetch POST Peça:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <NavBar active="pecas-cadastrar" /> {/* Atualize a prop 'active' */}
            <main className="container mx-auto px-4 py-10 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-3xl mx-auto border border-slate-700">
                    <h1 className="flex items-center justify-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center">
                        <CirclePlus size={30} className="text-sky-400" />
                        Cadastrar Nova Peça
                    </h1>

                    {/* Mensagens */}
                    {error && (
                        <div className="relative mb-6 text-red-400 bg-red-900/50 p-3 sm:p-4 pr-10 rounded border border-red-500 text-sm" role="alert">
                            <div className="flex items-center gap-2"> <MdErrorOutline className="text-lg" /> <span>{error}</span> </div>
                            <button type="button" className="absolute top-0 bottom-0 right-0 px-3 sm:px-4 py-1 sm:py-3 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-lg sm:text-xl">&times;</span></button>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center justify-center gap-2 text-green-400 p-3 mb-6 rounded bg-green-900/30 border border-green-700 text-sm">
                            <MdCheckCircle className="text-lg" /> <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Tipo de Veículo (Aplicação Genérica) */}
                            <div>
                                <label htmlFor="tipoVeiculo" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300"><Car size={16}/> Tipo Veículo (Aplicação):</label>
                                <select id="tipoVeiculo" name="tipoVeiculo" value={formData.tipoVeiculo} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md h-10 focus:ring-2 focus:ring-sky-500">
                                    <option value="" disabled>Selecione...</option>
                                    {tiposVeiculo.map(tv => (<option key={tv} value={tv}>{tv}</option>))}
                                </select>
                            </div>

                            {/* Fabricante/Marca da Peça */}
                            <div>
                                <label htmlFor="fabricante" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300"><Building size={16}/> Fabricante/Marca da Peça:</label>
                                <input type="text" id="fabricante" name="fabricante" value={formData.fabricante} onChange={handleChange} required maxLength={50} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md h-10 focus:ring-2 focus:ring-sky-500"/>
                            </div>

                            {/* Descrição da Peça */}
                            <div className="md:col-span-2">
                                <label htmlFor="descricaoPeca" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300"><Tag size={16}/> Descrição da Peça:</label>
                                <input type="text" id="descricaoPeca" name="descricaoPeca" value={formData.descricaoPeca} onChange={handleChange} required maxLength={50} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md h-10 focus:ring-2 focus:ring-sky-500"/>
                            </div>

                            {/* Data da Compra */}
                            <div>
                                <label htmlFor="dataCompra" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300"><Calendar size={16}/> Data da Compra:</label>
                                <input type="date" id="dataCompra" name="dataCompra" value={formData.dataCompra} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md h-10 focus:ring-2 focus:ring-sky-500 date-input-fix"/>
                            </div>

                            {/* Preço */}
                            <div>
                                <label htmlFor="preco" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300"><DollarSign size={16}/> Preço (R$):</label>
                                <input type="text" id="preco" name="preco" value={formData.preco} onChange={handleCurrencyChange} required placeholder="0,00" className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md h-10 focus:ring-2 focus:ring-sky-500"/>
                            </div>

                            {/* Desconto (Valor) */}
                            <div>
                                <label htmlFor="desconto" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300"><Percent size={16}/> Desconto (Valor R$):</label>
                                <input type="text" id="desconto" name="desconto" value={formData.desconto} onChange={handleCurrencyChange} required placeholder="0,00" className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md h-10 focus:ring-2 focus:ring-sky-500"/>
                            </div>

                            {/* Total com Desconto (Apenas Display) */}
                            <div>
                                <label className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-400"><Calculator size={16}/> Preço Final (R$):</label>
                                <input type="text" value={formatNumberToDisplayCurrencyString(totalComDesconto)} readOnly className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md h-10 cursor-not-allowed font-semibold text-green-400"/>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 mt-6 border-t border-slate-700">
                            <button
                                type="submit"
                                className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 font-semibold text-white bg-sky-600 rounded-md shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting}
                            >
                                <Save size={18}/> {isSubmitting ? 'Salvando...' : 'Salvar Nova Peça'}
                            </button>
                            <Link href="/pecas/listar" className="w-full sm:w-auto">
                                <button type="button" className="flex items-center justify-center gap-2 w-full px-6 sm:px-8 py-2.5 sm:py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 text-center">
                                    <ArrowLeft size={18}/> Voltar para Lista
                                </button>
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
            `}</style>
        </>
    );
}