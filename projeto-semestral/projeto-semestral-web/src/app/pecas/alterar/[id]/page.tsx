// src/app/pecas/alterar/[id]/page.tsx
"use client";

import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import {
    Edit3 as EditIcon, Package, Car, Building, Tag, Calendar, DollarSign, Percent, Calculator, Save, ArrowLeft,
    Info, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';

// Interfaces
interface PecaResponseDto { // Para buscar dados
    id: number;
    tipoVeiculo: string;
    fabricante: string;
    descricao: string;
    dataCompra: string;
    preco: number;
    desconto: number;
    totalDesconto: number;
}
interface PecaFormData { // Para o formulário
    tipoVeiculo: string;
    fabricante: string;
    descricaoPeca: string;
    dataCompra: string;
    preco: string;
    desconto: string;
}

// Tipos de veículo (igual ao cadastro)
const tiposVeiculo = ["Carro", "Moto", "Caminhão", "Ônibus", "Utilitário", "Outro"];

export default function AlterarPecaPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [formData, setFormData] = useState<PecaFormData>({
        tipoVeiculo: "", fabricante: "", descricaoPeca: "", dataCompra: "", preco: "0,00", desconto: "0,00",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [originalDataLoaded, setOriginalDataLoaded] = useState(false);

    // Funções de formatação/parse (iguais ao cadastro)
    const parseInputCurrencyToNumber = (inputValue: string): number => {
        if (!inputValue) return 0;
        const cleaned = inputValue.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    };
    const formatNumberToInputCurrencyString = (value: number): string => {
        if (value === null || value === undefined || isNaN(value)) return '0,00';
        return value.toFixed(2).replace('.', ',');
    };
    const formatNumberToDisplayCurrencyString = (value: number): string => {
        if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Buscar dados da peça ao carregar
    useEffect(() => {
        if (!id) {
            setError("ID da peça não fornecido na URL.");
            setIsFetching(false);
            return;
        }
        const fetchPeca = async () => {
            setIsFetching(true);
            setError(null);
            setOriginalDataLoaded(false);
            try {
                const response = await fetch(`http://localhost:8080/rest/pecas/${id}`);
                if (response.status === 404) throw new Error(`Peça com ID ${id} não encontrada.`);
                if (!response.ok) throw new Error(`Erro HTTP ${response.status}: Falha ao buscar dados da peça.`);

                const data: PecaResponseDto = await response.json();
                setFormData({
                    tipoVeiculo: data.tipoVeiculo || "",
                    fabricante: data.fabricante || "",
                    descricaoPeca: data.descricao || "",
                    dataCompra: data.dataCompra ? data.dataCompra.split('T')[0] : "", // Formata YYYY-MM-DD
                    preco: formatNumberToInputCurrencyString(data.preco),
                    desconto: formatNumberToInputCurrencyString(data.desconto),
                });
                setOriginalDataLoaded(true);

            } catch (err: any) {
                setError(err.message || "Erro desconhecido ao carregar peça.");
            } finally {
                setIsFetching(false);
            }
        };
        fetchPeca();
    }, [id]);

    // Cálculo do total (igual ao cadastro)
    const totalComDesconto = useMemo(() => {
        const precoNum = parseInputCurrencyToNumber(formData.preco);
        const descontoNum = parseInputCurrencyToNumber(formData.desconto);
        if (precoNum <= 0) return 0;
        const total = precoNum - descontoNum;
        return Math.max(0, total);
    }, [formData.preco, formData.desconto]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const cleanedValue = value.replace(/[^0-9,]/g, '');
        setFormData(prev => ({ ...prev, [name]: cleanedValue }));
    };


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!originalDataLoaded) { // Não submeter se dados originais não carregaram
            setError("Dados originais não carregados. Não é possível salvar.");
            return;
        }
        setIsSubmitting(true); setError(null); setSuccess(null);

        const precoNum = parseInputCurrencyToNumber(formData.preco);
        const descontoNum = parseInputCurrencyToNumber(formData.desconto);
        const totalDescNum = totalComDesconto;

        if (precoNum <= 0 || descontoNum < 0 || descontoNum > precoNum) {
            setError("Verifique os valores de Preço e Desconto.");
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
            totalDesconto: totalDescNum
        };

        console.log("Enviando payload para UPDATE Peça:", JSON.stringify(payload, null, 2));

        try {
            const response = await fetch(`http://localhost:8080/rest/pecas/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro HTTP ${response.status}` }));
                throw new Error(errorData.message || `Erro ao atualizar peça`);
            }

            setSuccess(`Peça (ID: ${id}) atualizada com sucesso!`);
            setTimeout(() => {
                setSuccess(null);
                router.push('/pecas/listar'); // Volta para a lista após sucesso
            }, 3000);

        } catch (err: any) {
            setError(err.message || "Falha ao atualizar peça.");
            console.error("Erro no fetch PUT Peça:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Renderização condicional para loading e erro inicial
    if (isFetching) {
        return (
            <>
                <NavBar active="pecas" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
                        <p className="mt-3 text-sky-300 text-lg">Carregando dados da peça...</p>
                    </div>
                </main>
            </>
        );
    }

    if (error && !originalDataLoaded) { // Erro grave ao carregar dados
        return (
            <>
                <NavBar active="pecas" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl text-center w-full max-w-lg">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4"/>
                        <h2 className="text-xl font-semibold text-red-400 mb-3">Erro ao Carregar Dados</h2>
                        <p className="text-slate-300 mb-6">{error}</p>
                        <Link href="/pecas/listar">
                            <button className="px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-md text-white font-semibold">Voltar para Lista</button>
                        </Link>
                    </div>
                </main>
            </>
        );
    }


    return (
        <>
            {/* Use a chave correta para 'active' na NavBar */}
            <NavBar active="pecas-alterar" />
            <main className="container mx-auto px-4 py-10 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-3xl mx-auto border border-slate-700">
                    <h1 className="flex items-center justify-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center">
                        <EditIcon size={30} className="text-sky-400" />
                        Alterar Peça (ID: {id})
                    </h1>

                    {/* Mensagens de Erro/Sucesso do Submit */}
                    {error && !isFetching && (
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

                    {/* Formulário similar ao de cadastro */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Campos do formulário (iguais ao de cadastro) */}
                            <div>
                                <label htmlFor="tipoVeiculo" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300"><Car size={16}/> Tipo Veículo (Aplicação):</label>
                                <select id="tipoVeiculo" name="tipoVeiculo" value={formData.tipoVeiculo} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md h-10 focus:ring-2 focus:ring-sky-500">
                                    <option value="" disabled>Selecione...</option>
                                    {tiposVeiculo.map(tv => (<option key={tv} value={tv}>{tv}</option>))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="fabricante" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300"><Building size={16}/> Fabricante/Marca da Peça:</label>
                                <input type="text" id="fabricante" name="fabricante" value={formData.fabricante} onChange={handleChange} required maxLength={50} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md h-10 focus:ring-2 focus:ring-sky-500"/>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="descricaoPeca" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300"><Tag size={16}/> Descrição da Peça:</label>
                                <input type="text" id="descricaoPeca" name="descricaoPeca" value={formData.descricaoPeca} onChange={handleChange} required maxLength={50} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md h-10 focus:ring-2 focus:ring-sky-500"/>
                            </div>
                            <div>
                                <label htmlFor="dataCompra" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300"><Calendar size={16}/> Data da Compra:</label>
                                <input type="date" id="dataCompra" name="dataCompra" value={formData.dataCompra} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md h-10 focus:ring-2 focus:ring-sky-500 date-input-fix"/>
                            </div>
                            <div>
                                <label htmlFor="preco" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300"><DollarSign size={16}/> Preço (R$):</label>
                                <input type="text" id="preco" name="preco" value={formData.preco} onChange={handleCurrencyChange} required placeholder="0,00" className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md h-10 focus:ring-2 focus:ring-sky-500"/>
                            </div>
                            <div>
                                <label htmlFor="desconto" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300"><Percent size={16}/> Desconto (Valor R$):</label>
                                <input type="text" id="desconto" name="desconto" value={formData.desconto} onChange={handleCurrencyChange} required placeholder="0,00" className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md h-10 focus:ring-2 focus:ring-sky-500"/>
                            </div>
                            <div>
                                <label className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-400"><Calculator size={16}/> Preço Final (R$):</label>
                                <input type="text" value={formatNumberToDisplayCurrencyString(totalComDesconto)} readOnly className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md h-10 cursor-not-allowed font-semibold text-green-400"/>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 mt-6 border-t border-slate-700">
                            <button
                                type="submit"
                                className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 font-semibold text-white bg-green-600 rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting || isFetching}
                            >
                                <Save size={18}/> {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
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