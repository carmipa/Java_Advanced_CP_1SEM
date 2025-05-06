// src/app/orcamento/cadastrar/page.tsx
"use client";

import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import {
    MdDescription, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle,
    MdBuild, MdAddCircleOutline, MdDelete, MdAttachMoney, MdCalendarToday, MdTimer, MdListAlt, MdPerson, MdDirectionsCar
} from 'react-icons/md';
import { FileText, Settings, PackagePlus, Trash2, DollarSign, Clock, HardHat, Tag, Info, Wrench, MessageSquare, ScanSearch, UserCircle, Loader2 } from 'lucide-react';

// --- Interfaces ---
interface ItemPecaForm {
    pecaId: string;
    descricaoPeca?: string;
    quantidade: number;
    precoUnitario?: number;
    subtotal?: number;
}

interface PecaDisponivel {
    id: number;
    descricao: string;
    preco: number;
    fabricante?: string;
}

interface OrcamentoFormData {
    dataOficina: string;
    descricaoProblema: string;
    diagnostico: string;
    partesAfetadas: string;
    horasTrabalhadasOficina: string;
    pecasUtilizadas: ItemPecaForm[];
    dataOrcamento: string;
    valorMaoDeObraAdicional: string;
    valorHoraOrcamento: string;
    quantidadeHorasOrcamento: number;
    clienteId: string;
    clienteEnderecoId: string;
    veiculoId: string;
}

export default function CadastrarOrcamentoComServicoPage() {
    const today = new Date().toISOString().split('T')[0];
    const initialState: OrcamentoFormData = {
        dataOficina: today,
        descricaoProblema: "",
        diagnostico: "",
        partesAfetadas: "",
        horasTrabalhadasOficina: "0.0",
        pecasUtilizadas: [],
        dataOrcamento: today,
        valorMaoDeObraAdicional: "0.00",
        valorHoraOrcamento: "0.00",
        quantidadeHorasOrcamento: 0,
        clienteId: "",
        clienteEnderecoId: "",
        veiculoId: ""
    };

    const [formData, setFormData] = useState<OrcamentoFormData>(initialState);
    const [pecasDisponiveis, setPecasDisponiveis] = useState<PecaDisponivel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isPecasLoading, setIsPecasLoading] = useState(true);

    const parseInputCurrencyToNumber = (inputValue: string): number => {
        if (!inputValue) return 0;
        const cleaned = inputValue.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    };

    const formatNumberToCurrencyString = (value: number | undefined | null): string => {
        if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    useEffect(() => {
        const fetchPecas = async () => {
            setIsPecasLoading(true);
            try {
                const response = await fetch('http://localhost:8080/rest/pecas/all');
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || 'Falha ao buscar peças');
                }
                const data: PecaDisponivel[] = await response.json();
                setPecasDisponiveis(data);
            } catch (err: any) {
                console.error("Erro ao buscar peças:", err);
                setError("Não foi possível carregar a lista de peças. Verifique a API de peças.");
            } finally {
                setIsPecasLoading(false);
            }
        };
        fetchPecas();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddPeca = () => {
        setFormData(prev => ({
            ...prev,
            pecasUtilizadas: [
                ...prev.pecasUtilizadas,
                { pecaId: "", quantidade: 1, descricaoPeca: "Selecione uma peça", precoUnitario: 0, subtotal: 0 }
            ]
        }));
    };

    const handlePecaItemChange = (index: number, field: keyof ItemPecaForm, value: string) => {
        const novasPecas = [...formData.pecasUtilizadas];
        const itemAtual = { ...novasPecas[index] };

        if (field === 'pecaId') {
            const pecaSelecionada = pecasDisponiveis.find(p => p.id.toString() === value);
            itemAtual.pecaId = value as string;
            itemAtual.descricaoPeca = pecaSelecionada?.descricao || "Peça não encontrada";
            itemAtual.precoUnitario = pecaSelecionada?.preco || 0;
        } else if (field === 'quantidade') {
            itemAtual.quantidade = parseInt(value, 10) >= 1 ? parseInt(value, 10) : 1;
        }

        itemAtual.subtotal = (itemAtual.precoUnitario || 0) * itemAtual.quantidade;
        novasPecas[index] = itemAtual;
        setFormData(prev => ({ ...prev, pecasUtilizadas: novasPecas }));
    };

    const handleRemovePeca = (index: number) => {
        setFormData(prev => ({
            ...prev,
            pecasUtilizadas: prev.pecasUtilizadas.filter((_, i) => i !== index)
        }));
    };

    const { totalCustoPecas, totalMaoDeObraOrcamento, valorTotalOrcamento } = useMemo(() => {
        const custoPecas = formData.pecasUtilizadas.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        const maoDeObraAdicional = parseInputCurrencyToNumber(formData.valorMaoDeObraAdicional);
        const valorHora = parseInputCurrencyToNumber(formData.valorHoraOrcamento);
        const qtdHoras = Number(formData.quantidadeHorasOrcamento) || 0;
        const custoMaoDeObraHoras = valorHora * qtdHoras;
        const totalMaoObra = maoDeObraAdicional + custoMaoDeObraHoras;
        return {
            totalCustoPecas: custoPecas,
            totalMaoDeObraOrcamento: totalMaoObra,
            valorTotalOrcamento: custoPecas + totalMaoObra
        };
    }, [formData.pecasUtilizadas, formData.valorMaoDeObraAdicional, formData.valorHoraOrcamento, formData.quantidadeHorasOrcamento]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true); setError(null); setSuccess(null);

        const pecasParaEnvio = formData.pecasUtilizadas
            .filter(p => p.pecaId && !isNaN(parseInt(p.pecaId, 10))) // Filtra peças realmente selecionadas
            .map(p => ({
                pecaId: parseInt(p.pecaId, 10),
                quantidade: p.quantidade
            }));

        const payload = {
            dataOficina: formData.dataOficina,
            descricaoProblema: formData.descricaoProblema,
            diagnostico: formData.diagnostico,
            partesAfetadas: formData.partesAfetadas,
            horasTrabalhadasOficina: formData.horasTrabalhadasOficina,
            pecasUtilizadas: pecasParaEnvio,

            dataOrcamento: formData.dataOrcamento,
            valorMaoDeObraAdicional: parseInputCurrencyToNumber(formData.valorMaoDeObraAdicional),
            valorHoraOrcamento: parseInputCurrencyToNumber(formData.valorHoraOrcamento),
            quantidadeHorasOrcamento: Number(formData.quantidadeHorasOrcamento),

            clienteId: formData.clienteId ? parseInt(formData.clienteId, 10) : null,
            clienteEnderecoId: formData.clienteEnderecoId ? parseInt(formData.clienteEnderecoId, 10) : null,
            veiculoId: formData.veiculoId ? parseInt(formData.veiculoId, 10) : null,
        };

        if (payload.clienteId === null || isNaN(payload.clienteId)) delete (payload as any).clienteId;
        if (payload.clienteEnderecoId === null || isNaN(payload.clienteEnderecoId)) delete (payload as any).clienteEnderecoId;
        if (payload.veiculoId === null || isNaN(payload.veiculoId)) delete (payload as any).veiculoId;

        console.log("Enviando payload para CADASTRO:", JSON.stringify(payload, null, 2));

        try {
            const response = await fetch("http://localhost:8080/rest/orcamentos/completo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}. Verifique os dados e tente novamente.` }));
                throw new Error(errorData.message || `Erro ${response.status}`);
            }

            const result = await response.json();
            setSuccess(`Orçamento (ID: ${result.id}) e serviço associado registrados com sucesso!`);
            setFormData(initialState);
            setTimeout(() => setSuccess(null), 7000);
        } catch (err: any) {
            setError(err.message || "Falha ao registrar orçamento e serviço.");
            console.error("Erro no fetch:", err);
        } finally {
            setIsLoading(false);
        }
    }; // <<< ESTA CHAVE FECHA O handleSubmit

    // <<< O RETURN COM O JSX COMEÇA AQUI >>>
    return (
        <>
            <NavBar active="orcamento-cadastrar" />
            <main className="container mx-auto px-4 py-10 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-4xl mx-auto">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-8 text-center">
                        <FileText size={30} className="text-sky-400" />
                        Registrar Novo Orçamento e Serviço
                    </h1>

                    {error && (
                        <div className="relative mb-6 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                            <div className="flex items-center gap-2"> <MdErrorOutline className="text-xl" /> <span>{error}</span> </div>
                            <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-xl">&times;</span></button>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center justify-center gap-2 text-green-400 p-3 mb-6 rounded bg-green-900/30 border border-green-700">
                            <MdCheckCircle className="text-xl" /> <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Seção Detalhes do Serviço (Oficina) */}
                        <fieldset className="border border-slate-700 p-4 md:p-6 rounded-lg">
                            <legend className="text-xl font-semibold px-2 text-sky-300 flex items-center gap-2"><Wrench size={22}/> Detalhes do Serviço (Oficina)</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                                <div>
                                    <label htmlFor="dataOficina" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><MdCalendarToday size={16}/> Data do Serviço:</label>
                                    <input type="date" name="dataOficina" id="dataOficina" value={formData.dataOficina} onChange={handleChange} required className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700 date-input-fix"/>
                                </div>
                                <div>
                                    <label htmlFor="horasTrabalhadasOficina" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><Clock size={16}/> Horas Trabalhadas (Serviço):</label>
                                    <input type="text" name="horasTrabalhadasOficina" id="horasTrabalhadasOficina" value={formData.horasTrabalhadasOficina} onChange={handleChange} required placeholder="Ex: 2.5" className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"/>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="descricaoProblema" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><MessageSquare size={16}/> Descrição do Problema:</label>
                                    <textarea name="descricaoProblema" id="descricaoProblema" value={formData.descricaoProblema} onChange={handleChange} rows={3} required className="w-full p-2 rounded bg-slate-800 border border-slate-700"/>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="diagnostico" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><ScanSearch size={16}/> Diagnóstico:</label>
                                    <textarea name="diagnostico" id="diagnostico" value={formData.diagnostico} onChange={handleChange} rows={3} className="w-full p-2 rounded bg-slate-800 border border-slate-700"/>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="partesAfetadas" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><Settings size={16}/> Partes Afetadas:</label>
                                    <input type="text" name="partesAfetadas" id="partesAfetadas" value={formData.partesAfetadas} onChange={handleChange} required className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"/>
                                </div>
                            </div>
                        </fieldset>

                        {/* Seção Peças Utilizadas */}
                        <fieldset className="border border-slate-700 p-4 md:p-6 rounded-lg">
                            <legend className="text-xl font-semibold px-2 text-sky-300 flex items-center gap-2"><PackagePlus size={22}/> Peças Utilizadas no Serviço</legend>
                            {isPecasLoading && <p className="text-slate-400 text-sm mt-4">Carregando lista de peças...</p>}
                            {!isPecasLoading && pecasDisponiveis.length === 0 && !error && <p className="text-slate-400 text-sm mt-4">Nenhuma peça disponível para seleção. Cadastre peças primeiro.</p>}

                            {formData.pecasUtilizadas.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-[2fr_100px_120px_120px_auto] gap-3 items-end border-b border-slate-800 py-3 last:border-b-0">
                                    <div>
                                        <label htmlFor={`pecaId-${index}`} className="block text-xs font-medium text-slate-400 mb-1">Peça:</label>
                                        <select
                                            name={`pecaId-${index}`}
                                            id={`pecaId-${index}`}
                                            value={item.pecaId}
                                            onChange={(e) => handlePecaItemChange(index, 'pecaId', e.target.value)}
                                            required
                                            className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-sm"
                                            disabled={isPecasLoading}
                                        >
                                            <option value="" disabled>{isPecasLoading ? "Carregando..." : "Selecione..."}</option>
                                            {pecasDisponiveis.map(p => (
                                                <option key={p.id} value={p.id.toString()}>{p.descricao} ({p.fabricante}) - {formatNumberToCurrencyString(p.preco)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor={`quantidade-${index}`} className="block text-xs font-medium text-slate-400 mb-1">Qtd.:</label>
                                        <input
                                            type="number"
                                            name={`quantidade-${index}`}
                                            id={`quantidade-${index}`}
                                            value={item.quantidade}
                                            onChange={(e) => handlePecaItemChange(index, 'quantidade', e.target.value)}
                                            min="1" required
                                            className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-sm"/>
                                    </div>
                                    <div className="text-sm">
                                        <span className="block text-xs text-slate-400 mb-1">Preço Unit.:</span>
                                        <span className="block p-2 h-10 leading-tight flex items-center bg-slate-800 rounded border border-slate-700">
                                            {formatNumberToCurrencyString(item.precoUnitario)}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="block text-xs text-slate-400 mb-1">Subtotal:</span>
                                        <span className="block p-2 h-10 leading-tight flex items-center bg-slate-800 rounded border border-slate-700 font-semibold">
                                            {formatNumberToCurrencyString(item.subtotal)}
                                        </span>
                                    </div>
                                    <button type="button" onClick={() => handleRemovePeca(index)} className="p-2 h-10 bg-red-600 hover:bg-red-700 rounded text-white flex items-center justify-center" title="Remover Peça">
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={handleAddPeca} disabled={isPecasLoading || pecasDisponiveis.length === 0} className={`mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md ${isPecasLoading || pecasDisponiveis.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <MdAddCircleOutline size={18}/> Adicionar Peça
                            </button>
                            <div className="text-right mt-4 font-semibold text-lg">
                                Custo Total das Peças: <span className="text-green-400">{formatNumberToCurrencyString(totalCustoPecas)}</span>
                            </div>
                        </fieldset>

                        {/* Seção Detalhes da Mão de Obra (Orçamento) */}
                        <fieldset className="border border-slate-700 p-4 md:p-6 rounded-lg">
                            <legend className="text-xl font-semibold px-2 text-sky-300 flex items-center gap-2"><HardHat size={22}/> Mão de Obra (Orçamento)</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mt-4">
                                <div>
                                    <label htmlFor="dataOrcamento" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><MdCalendarToday size={16}/> Data Orçamento:</label>
                                    <input type="date" name="dataOrcamento" id="dataOrcamento" value={formData.dataOrcamento} onChange={handleChange} required className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700 date-input-fix"/>
                                </div>
                                <div>
                                    <label htmlFor="valorMaoDeObraAdicional" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><Tag size={16}/> Taxa M.O. Adicional (R$):</label>
                                    <input type="text" name="valorMaoDeObraAdicional" id="valorMaoDeObraAdicional" value={formData.valorMaoDeObraAdicional} onChange={handleChange} placeholder="0,00" className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"/>
                                </div>
                                <div>
                                    <label htmlFor="valorHoraOrcamento" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><DollarSign size={16}/> Valor/Hora Orçam. (R$):</label>
                                    <input type="text" name="valorHoraOrcamento" id="valorHoraOrcamento" value={formData.valorHoraOrcamento} onChange={handleChange} required placeholder="0,00" className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"/>
                                </div>
                                <div>
                                    <label htmlFor="quantidadeHorasOrcamento" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><Clock size={16}/> Qtd. Horas Orçam.:</label>
                                    <input type="number" name="quantidadeHorasOrcamento" id="quantidadeHorasOrcamento" value={formData.quantidadeHorasOrcamento} onChange={handleChange} min="0" required className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"/>
                                </div>
                                <div className="md:col-span-2 lg:col-span-3 text-right mt-2 font-semibold text-lg">
                                    Custo Total Mão de Obra (Orç.): <span className="text-yellow-400">{formatNumberToCurrencyString(totalMaoDeObraOrcamento)}</span>
                                </div>
                            </div>
                        </fieldset>

                        {/* Seção Associações */}
                        <fieldset className="border border-slate-700 p-4 md:p-6 rounded-lg">
                            <legend className="text-xl font-semibold px-2 text-sky-300 flex items-center gap-2"><UserCircle size={22}/> Associações (Opcional)</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                                <div>
                                    <label htmlFor="clienteId" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><MdPerson size={18}/> ID Cliente:</label>
                                    <input type="text" name="clienteId" id="clienteId" value={formData.clienteId} onChange={handleChange} placeholder="ID numérico do Cliente" className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"/>
                                </div>
                                <div>
                                    <label htmlFor="clienteEnderecoId" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><Info size={18}/> ID Endereço Cliente:</label>
                                    <input type="text" name="clienteEnderecoId" id="clienteEnderecoId" value={formData.clienteEnderecoId} onChange={handleChange} placeholder="ID do Endereço do Cliente" className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"/>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="veiculoId" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><MdDirectionsCar size={18}/> ID Veículo:</label>
                                    <input type="text" name="veiculoId" id="veiculoId" value={formData.veiculoId} onChange={handleChange} placeholder="ID numérico do Veículo" className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"/>
                                </div>
                            </div>
                        </fieldset>

                        {/* Total Geral */}
                        <div className="mt-8 p-4 bg-slate-800 rounded-lg text-center">
                            <h3 className="text-2xl font-bold text-sky-300">
                                VALOR TOTAL DO ORÇAMENTO:
                                <span className="ml-2 text-green-400">{formatNumberToCurrencyString(valorTotalOrcamento)}</span>
                            </h3>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                            <button
                                type="submit"
                                className={`flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 font-semibold text-white bg-green-600 rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                <MdSave size={20}/> {isLoading ? 'Salvando...' : 'Salvar Orçamento e Serviço'}
                            </button>
                            <Link href="/orcamento" className="w-full sm:w-auto">
                                <button type="button" className="flex items-center justify-center gap-2 w-full px-8 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 text-center">
                                    <MdArrowBack size={20}/> Cancelar
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
    ); // <<< ESTA CHAVE FECHA O return DO COMPONENTE
} // <<< ESTA CHAVE FECHA A FUNÇÃO DO COMPONENTE