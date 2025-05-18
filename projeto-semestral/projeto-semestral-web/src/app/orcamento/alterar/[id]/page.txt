// src/app/orcamento/alterar/[id]/page.tsx
"use client";

import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';
import {
    MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle,
    MdCalendarToday, MdAddCircleOutline, MdDelete, MdPerson
} from 'react-icons/md';
import {
    FileText, Settings, PackagePlus, Trash2, DollarSign, Clock,
    HardHat, Tag, Info, Wrench, MessageSquare, ScanSearch,
    UserCircle, Loader2, AlertCircle
} from 'lucide-react';
import { fetchAuthenticated } from '@/utils/apiService'; // <<< Import adicionado

// --- Interfaces ---
interface ItemPecaForm {
    idOficinaPeca?: number;
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
    oficinaId?: number;
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

interface ItemPecaResponse {
    idOficinaPeca?: number;
    pecaId: number;
    descricaoPeca: string;
    fabricantePeca?: string;
    quantidade: number;
    precoUnitarioNaEpoca: number;
    subtotal: number;
}

interface OficinaParaOrcamentoResponseDto {
    id: number;
    dataOficina: string;
    descricaoProblema: string;
    diagnostico: string;
    partesAfetadas: string;
    horasTrabalhadasOficina: string;
    pecasUtilizadas: ItemPecaResponse[];
    veiculoId?: number | null;
}

interface OrcamentoComServicoResponseDto {
    id: number;
    dataOrcamento: string;
    valorMaoDeObraAdicional: number;
    valorHoraOrcamento: number;
    quantidadeHorasOrcamento: number;
    valorTotal: number;
    oficina: OficinaParaOrcamentoResponseDto;
    clienteId?: number | null;
    clienteEnderecoId?: number | null;
}
// ---------------------------------------------------------

export default function AlterarOrcamentoComServicoPage() {
    const router = useRouter();
    const params = useParams();
    const orcamentoId = params.id as string;

    const today = new Date().toISOString().split('T')[0];
    const initialState: OrcamentoFormData = {
        dataOficina: today,
        descricaoProblema: "",
        diagnostico: "",
        partesAfetadas: "",
        horasTrabalhadasOficina: "0.0",
        pecasUtilizadas: [],
        dataOrcamento: today,
        valorMaoDeObraAdicional: "0,00",
        valorHoraOrcamento: "0,00",
        quantidadeHorasOrcamento: 0,
        clienteId: "",
        clienteEnderecoId: "",
        veiculoId: ""
    };

    const [formData, setFormData] = useState<OrcamentoFormData>(initialState);
    const [pecasDisponiveis, setPecasDisponiveis] = useState<PecaDisponivel[]>([]);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isPecasLoading, setIsPecasLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const parseInputCurrencyToNumber = (input: string): number =>
        parseFloat(input.replace(/\./g, '').replace(',', '.')) || 0;
    const formatNumberToCurrencyString = (value?: number | null): string =>
        (value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatDateForInput = (dateString?: string | null): string => {
        if (!dateString) return '';
        try { return new Date(dateString).toISOString().split('T')[0]; }
        catch { return ''; }
    };

    useEffect(() => {
        if (!orcamentoId) {
            setError("ID do Orçamento não fornecido na URL.");
            setIsFetchingData(false);
            return;
        }

        const fetchOrcamentoData = async () => {
            setIsFetchingData(true);
            setError(null);
            try {
                // GET orçamento completo
                const response = await fetchAuthenticated(`/rest/orcamentos/completo/${orcamentoId}`);
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({ message: `Erro ${response.status} ao buscar orçamento.` }));
                    throw new Error(errData.message);
                }
                const data: OrcamentoComServicoResponseDto = await response.json();
                setFormData({
                    oficinaId: data.oficina.id,
                    dataOficina: formatDateForInput(data.oficina.dataOficina),
                    descricaoProblema: data.oficina.descricaoProblema,
                    diagnostico: data.oficina.diagnostico || "",
                    partesAfetadas: data.oficina.partesAfetadas,
                    horasTrabalhadasOficina: data.oficina.horasTrabalhadasOficina,
                    pecasUtilizadas: data.oficina.pecasUtilizadas.map(p => ({
                        idOficinaPeca: p.idOficinaPeca,
                        pecaId: p.pecaId.toString(),
                        descricaoPeca: p.descricaoPeca,
                        quantidade: p.quantidade,
                        precoUnitario: p.precoUnitarioNaEpoca,
                        subtotal: p.precoUnitarioNaEpoca * p.quantidade
                    })),
                    dataOrcamento: formatDateForInput(data.dataOrcamento),
                    valorMaoDeObraAdicional: formatNumberToCurrencyString(data.valorMaoDeObraAdicional),
                    valorHoraOrcamento: formatNumberToCurrencyString(data.valorHoraOrcamento),
                    quantidadeHorasOrcamento: data.quantidadeHorasOrcamento,
                    clienteId: data.clienteId?.toString() || "",
                    clienteEnderecoId: data.clienteEnderecoId?.toString() || "",
                    veiculoId: data.oficina.veiculoId?.toString() || ""
                });
            } catch (err: any) {
                console.error("Erro fetchOrcamentoData:", err);
                setError(`Erro ao carregar dados do orçamento: ${err.message}`);
            } finally {
                setIsFetchingData(false);
            }
        };

        const fetchPecas = async () => {
            setIsPecasLoading(true);
            try {
                // GET todas as peças
                const response = await fetchAuthenticated('/rest/pecas/all');
                if (!response.ok) throw new Error('Falha ao buscar peças para seleção');
                const data: PecaDisponivel[] = await response.json();
                setPecasDisponiveis(data);
            } catch (err: any) {
                console.error("Erro ao buscar peças:", err);
            } finally {
                setIsPecasLoading(false);
            }
        };

        fetchPecas();
        fetchOrcamentoData();
    }, [orcamentoId]);

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddPeca = () => {
        setFormData(prev => ({
            ...prev,
            pecasUtilizadas: [
                ...prev.pecasUtilizadas,
                { pecaId: "", quantidade: 1, descricaoPeca: "Selecione...", precoUnitario: 0, subtotal: 0 }
            ]
        }));
    };

    const handlePecaItemChange = (index: number, field: keyof ItemPecaForm, value: string) => {
        const updated = [...formData.pecasUtilizadas];
        const item = { ...updated[index] };
        if (field === 'pecaId') {
            const sel = pecasDisponiveis.find(p => p.id.toString() === value);
            item.pecaId = value;
            item.descricaoPeca = sel?.descricao || "Peça inválida";
            item.precoUnitario = sel?.preco || 0;
        } else if (field === 'quantidade') {
            item.quantidade = Math.max(1, parseInt(value, 10) || 1);
        }
        item.subtotal = (item.precoUnitario || 0) * item.quantidade;
        updated[index] = item;
        setFormData(prev => ({ ...prev, pecasUtilizadas: updated }));
    };

    const handleRemovePeca = (index: number) => {
        setFormData(prev => ({
            ...prev,
            pecasUtilizadas: prev.pecasUtilizadas.filter((_, i) => i !== index)
        }));
    };

    const {
        totalCustoPecas,
        totalMaoDeObraOrcamento,
        valorTotalOrcamento
    } = useMemo(() => {
        const custoPecas = formData.pecasUtilizadas.reduce((sum, i) => sum + (i.subtotal || 0), 0);
        const maoAdd = parseInputCurrencyToNumber(formData.valorMaoDeObraAdicional);
        const valorHr = parseInputCurrencyToNumber(formData.valorHoraOrcamento);
        const qtdHrs = Number(formData.quantidadeHorasOrcamento) || 0;
        const maoObra = maoAdd + valorHr * qtdHrs;
        return {
            totalCustoPecas: custoPecas,
            totalMaoDeObraOrcamento: maoObra,
            valorTotalOrcamento: custoPecas + maoObra
        };
    }, [
        formData.pecasUtilizadas,
        formData.valorMaoDeObraAdicional,
        formData.valorHoraOrcamento,
        formData.quantidadeHorasOrcamento
    ]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const pecasParaEnvio = formData.pecasUtilizadas
            .filter(p => p.pecaId && !isNaN(parseInt(p.pecaId, 10)))
            .map(p => ({
                idOficinaPeca: p.idOficinaPeca,
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
            oficinaExistenteId: formData.oficinaId
        };

        try {
            // PUT atualização
            const response = await fetchAuthenticated(`/rest/orcamentos/completo/${orcamentoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errData.message || `Erro ${response.status}`);
            }
            setSuccess(`Orçamento ID ${orcamentoId} atualizado com sucesso!`);
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            console.error("Erro no fetch PUT:", err);
            setError(err.message || "Falha ao atualizar orçamento.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetchingData) {
        return (
            <>
                <NavBar active="orcamento-alterar" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
                    <p className="ml-4 text-sky-300 text-lg">Carregando dados do orçamento...</p>
                </main>
            </>
        );
    }

    if (error && !formData.oficinaId) {
        return (
            <>
                <NavBar active="orcamento-alterar" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl text-center w-full max-w-lg">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4"/>
                        <h2 className="text-xl font-semibold text-red-400 mb-3">Erro ao Carregar Dados</h2>
                        <p className="text-slate-300 mb-6">{error}</p>
                        <Link href="/orcamento/listar">
                            <button className="px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-md text-white font-semibold">
                                Voltar para Lista
                            </button>
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <NavBar active="orcamento-alterar" />
            <main className="container mx-auto px-4 py-10 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
                    <h1 className="flex items-center justify-center gap-2 text-3xl font-bold mb-8">
                        <FileText className="text-sky-400" size={30} />
                        Alterar Orçamento e Serviço (ID: {orcamentoId})
                    </h1>

                    {error && (
                        <div className="relative mb-6 text-red-400 bg-red-900/50 p-4 rounded border border-red-500">
                            <MdErrorOutline className="inline mr-2" /> {error}
                            <button type="button" className="absolute top-2 right-2" onClick={() => setError(null)}>&times;</button>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center justify-center gap-2 text-green-400 p-3 mb-6 bg-green-900/30 border border-green-700 rounded">
                            <MdCheckCircle /> {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Seção Detalhes do Serviço (Oficina) */}
                        <fieldset className="border border-slate-700 p-4 md:p-6 rounded-lg">
                            <legend className="text-xl font-semibold px-2 text-sky-300 flex items-center gap-2">
                                <Wrench size={22}/> Detalhes do Serviço
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                                <div>
                                    <label htmlFor="dataOficina" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                        <MdCalendarToday size={16}/> Data do Serviço:
                                    </label>
                                    <input
                                        type="date"
                                        name="dataOficina"
                                        id="dataOficina"
                                        value={formData.dataOficina}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="horasTrabalhadasOficina" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                        <Clock size={16}/> Horas Trabalhadas:
                                    </label>
                                    <input
                                        type="text"
                                        name="horasTrabalhadasOficina"
                                        id="horasTrabalhadasOficina"
                                        value={formData.horasTrabalhadasOficina}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex: 2.5"
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="descricaoProblema" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                        <MessageSquare size={16}/> Descrição do Problema:
                                    </label>
                                    <textarea
                                        name="descricaoProblema"
                                        id="descricaoProblema"
                                        value={formData.descricaoProblema}
                                        onChange={handleChange}
                                        rows={3}
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="diagnostico" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                        <ScanSearch size={16}/> Diagnóstico:
                                    </label>
                                    <textarea
                                        name="diagnostico"
                                        id="diagnostico"
                                        value={formData.diagnostico}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="partesAfetadas" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                        <Settings size={16}/> Partes Afetadas:
                                    </label>
                                    <input
                                        type="text"
                                        name="partesAfetadas"
                                        id="partesAfetadas"
                                        value={formData.partesAfetadas}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* Seção Peças Utilizadas */}
                        <fieldset className="border border-slate-700 p-4 md:p-6 rounded-lg">
                            <legend className="text-xl font-semibold px-2 text-sky-300 flex items-center gap-2">
                                <PackagePlus size={22}/> Peças Utilizadas
                            </legend>
                            {isPecasLoading && <p className="text-slate-400 text-sm mt-4">Carregando lista de peças...</p>}

                            {formData.pecasUtilizadas.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-[2fr_100px_120px_120px_auto] gap-3 items-end border-b border-slate-800 py-3 last:border-b-0">
                                    <div>
                                        <label htmlFor={`pecaId-${index}`} className="block text-xs font-medium text-slate-400 mb-1">Peça:</label>
                                        <select
                                            name={`pecaId`}
                                            id={`pecaId-${index}`}
                                            value={item.pecaId}
                                            onChange={(e) => handlePecaItemChange(index, 'pecaId', e.target.value)}
                                            required
                                            className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-sm"
                                            disabled={isPecasLoading}
                                        >
                                            <option value="" disabled>
                                                {isPecasLoading ? "Carregando..." : "Selecione..."}
                                            </option>
                                            {pecasDisponiveis.map(p => (
                                                <option key={p.id} value={p.id.toString()}>
                                                    {p.descricao} ({p.fabricante}) – {formatNumberToCurrencyString(p.preco)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor={`quantidade-${index}`} className="block text-xs font-medium text-slate-400 mb-1">Qtd.:</label>
                                        <input
                                            type="number"
                                            name="quantidade"
                                            id={`quantidade-${index}`}
                                            value={item.quantidade}
                                            onChange={(e) => handlePecaItemChange(index, 'quantidade', e.target.value)}
                                            min="1"
                                            required
                                            className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-sm"
                                        />
                                    </div>
                                    <div className="text-sm">
                                        <span className="block text-xs text-slate-400 mb-1">Preço Unit.:</span>
                                        <span className="block p-2 h-10 flex items-center bg-slate-800 rounded border border-slate-700">
                                            {formatNumberToCurrencyString(item.precoUnitario)}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="block text-xs text-slate-400 mb-1">Subtotal:</span>
                                        <span className="block p-2 h-10 flex items-center bg-slate-800 rounded border border-slate-700 font-semibold">
                                            {formatNumberToCurrencyString(item.subtotal)}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePeca(index)}
                                        className="p-2 h-10 bg-red-600 hover:bg-red-700 rounded text-white flex items-center justify-center"
                                        title="Remover Peça"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddPeca}
                                disabled={isPecasLoading || !pecasDisponiveis.length}
                                className={`mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md transition ${
                                    isPecasLoading || !pecasDisponiveis.length ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <MdAddCircleOutline size={18}/> Adicionar Peça
                            </button>
                            <div className="text-right mt-4 font-semibold text-lg">
                                Custo Total das Peças: <span className="text-green-400">{formatNumberToCurrencyString(totalCustoPecas)}</span>
                            </div>
                        </fieldset>

                        {/* Seção Mão de Obra */}
                        <fieldset className="border border-slate-700 p-4 md:p-6 rounded-lg">
                            <legend className="text-xl font-semibold px-2 text-sky-300 flex items-center gap-2">
                                <HardHat size={22}/> Mão de Obra
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mt-4">
                                <div>
                                    <label htmlFor="dataOrcamento" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                        <MdCalendarToday size={16}/> Data Orçamento:
                                    </label>
                                    <input
                                        type="date"
                                        name="dataOrcamento"
                                        id="dataOrcamento"
                                        value={formData.dataOrcamento}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="valorMaoDeObraAdicional" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                        <Tag size={16}/> Taxa M.O. Adicional (R$):
                                    </label>
                                    <input
                                        type="text"
                                        name="valorMaoDeObraAdicional"
                                        id="valorMaoDeObraAdicional"
                                        value={formData.valorMaoDeObraAdicional}
                                        onChange={handleChange}
                                        placeholder="0,00"
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="valorHoraOrcamento" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                        <DollarSign size={16}/> Valor/Hora (R$):
                                    </label>
                                    <input
                                        type="text"
                                        name="valorHoraOrcamento"
                                        id="valorHoraOrcamento"
                                        value={formData.valorHoraOrcamento}
                                        onChange={handleChange}
                                        required
                                        placeholder="0,00"
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="quantidadeHorasOrcamento" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                        <Clock size={16}/> Qtd. Horas:
                                    </label>
                                    <input
                                        type="number"
                                        name="quantidadeHorasOrcamento"
                                        id="quantidadeHorasOrcamento"
                                        value={formData.quantidadeHorasOrcamento}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"
                                    />
                                </div>
                                <div className="md:col-span-2 lg:col-span-3 text-right mt-2 font-semibold text-lg">
                                    Custo Total Mão de Obra: <span className="text-yellow-400">{formatNumberToCurrencyString(totalMaoDeObraOrcamento)}</span>
                                </div>
                            </div>
                        </fieldset>

                        {/* Seção Associações */}
                        <fieldset className="border border-slate-700 p-4 md:p-6 rounded-lg">
                            <legend className="text-xl font-semibold px-2 text-sky-300 flex items-center gap-2">
                                <UserCircle size={22}/> Associações
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                                <div>
                                    <label htmlFor="clienteId" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                        <MdPerson size={18}/> ID Cliente:
                                    </label>
                                    <input
                                        type="text"
                                        name="clienteId"
                                        id="clienteId"
                                        value={formData.clienteId}
                                        onChange={handleChange}
                                        placeholder="ID numérico"
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="clienteEnderecoId" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                        <Info size={18}/> ID Endereço:
                                    </label>
                                    <input
                                        type="text"
                                        name="clienteEnderecoId"
                                        id="clienteEnderecoId"
                                        value={formData.clienteEnderecoId}
                                        onChange={handleChange}
                                        placeholder="ID numérico"
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="veiculoId" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                        <MdPerson size={18}/> ID Veículo:
                                    </label>
                                    <input
                                        type="text"
                                        name="veiculoId"
                                        id="veiculoId"
                                        value={formData.veiculoId}
                                        onChange={handleChange}
                                        placeholder="ID numérico"
                                        className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* Valor Total */}
                        <div className="mt-8 p-4 bg-slate-800 rounded-lg text-center">
                            <h3 className="text-2xl font-bold text-sky-300">
                                VALOR TOTAL DO ORÇAMENTO:
                                <span className="ml-2 text-green-400">
                                    {formatNumberToCurrencyString(valorTotalOrcamento)}
                                </span>
                            </h3>
                        </div>

                        {/* Botões Salvar / Voltar */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition ${
                                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <MdSave /> {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                            <Link href="/orcamento/listar">
                                <button className="flex items-center gap-2 px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md">
                                    <MdArrowBack /> Voltar para Lista
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
