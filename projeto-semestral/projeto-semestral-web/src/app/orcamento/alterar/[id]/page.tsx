// src/app/orcamento/alterar/[id]/page.tsx
"use client";

import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';
import {
    MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle,
    MdCalendarToday, MdAddCircleOutline, MdDelete
} from 'react-icons/md';
import { FileText, Settings, PackagePlus, Trash2, DollarSign, Clock, HardHat, Tag, Info, Wrench, MessageSquare, ScanSearch, UserCircle, Loader2, AlertCircle } from 'lucide-react';

// --- Interfaces ---
interface ItemPecaForm {
    idOficinaPeca?: number; // ID da OficinaPeca, útil para atualizações/deleções no backend
    pecaId: string;
    descricaoPeca?: string;
    quantidade: number;
    precoUnitario?: number; // Preço no momento do orçamento, vindo do GET
    subtotal?: number;
}

interface PecaDisponivel {
    id: number;
    descricao: string;
    preco: number;
    fabricante?: string;
}

interface OrcamentoFormData {
    // Oficina
    oficinaId?: number; // ID da Oficina associada
    dataOficina: string;
    descricaoProblema: string;
    diagnostico: string;
    partesAfetadas: string;
    horasTrabalhadasOficina: string;
    pecasUtilizadas: ItemPecaForm[];

    // Orçamento
    dataOrcamento: string;
    valorMaoDeObraAdicional: string;
    valorHoraOrcamento: string;
    quantidadeHorasOrcamento: number;

    // Associações
    clienteId: string;
    clienteEnderecoId: string;
    veiculoId: string;
}

// DTO para a resposta do GET /rest/orcamentos/completo/{id}
interface ItemPecaResponse {
    idOficinaPeca?: number; // ID da entidade de junção OficinaPeca
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
    id: number; // ID do Orcamento
    dataOrcamento: string;
    valorMaoDeObraAdicional: number;
    valorHoraOrcamento: number;
    quantidadeHorasOrcamento: number;
    valorTotal: number; // Valor total calculado do orçamento
    oficina: OficinaParaOrcamentoResponseDto;
    clienteId?: number | null;
    clienteEnderecoId?: number | null;
}


export default function AlterarOrcamentoComServicoPage() {
    const router = useRouter();
    const params = useParams();
    const orcamentoId = params.id as string;

    const today = new Date().toISOString().split('T')[0];
    const initialState: OrcamentoFormData = {
        dataOficina: today, descricaoProblema: "", diagnostico: "", partesAfetadas: "",
        horasTrabalhadasOficina: "0.0", pecasUtilizadas: [], dataOrcamento: today,
        valorMaoDeObraAdicional: "0.00", valorHoraOrcamento: "0.00", quantidadeHorasOrcamento: 0,
        clienteId: "", clienteEnderecoId: "", veiculoId: ""
    };

    const [formData, setFormData] = useState<OrcamentoFormData>(initialState);
    const [pecasDisponiveis, setPecasDisponiveis] = useState<PecaDisponivel[]>([]);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isPecasLoading, setIsPecasLoading] = useState(true);

    const parseInputCurrencyToNumber = (inputValue: string): number => parseFloat(inputValue.replace(/\./g, '').replace(',', '.')) || 0;
    const formatNumberToCurrencyString = (value: number | undefined | null): string => (value === null || value === undefined || isNaN(value)) ? '0,00' : value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatDateForInput = (dateString: string | undefined | null): string => {
        if (!dateString) return '';
        // Tenta converter formatos comuns de data que podem vir do backend
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
                const response = await fetch(`http://localhost:8080/rest/orcamentos/completo/${orcamentoId}`);
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({message: `Erro ${response.status} ao buscar orçamento.`}));
                    throw new Error(errData.message || `Falha ao buscar dados do orçamento (ID: ${orcamentoId})`);
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
                        idOficinaPeca: p.idOficinaPeca, // ID da OficinaPeca para identificar no update
                        pecaId: p.pecaId.toString(),
                        descricaoPeca: p.descricaoPeca,
                        quantidade: p.quantidade,
                        precoUnitario: p.precoUnitarioNaEpoca,
                        subtotal: (p.precoUnitarioNaEpoca || 0) * p.quantidade
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
                setError(`Erro ao carregar dados do orçamento: ${err.message}`);
                console.error("Erro fetchOrcamentoData:", err);
            } finally {
                setIsFetchingData(false);
            }
        };

        const fetchPecas = async () => {
            setIsPecasLoading(true);
            try {
                const response = await fetch('http://localhost:8080/rest/pecas/all');
                if (!response.ok) throw new Error('Falha ao buscar peças para seleção');
                const dataPecas: PecaDisponivel[] = await response.json();
                setPecasDisponiveis(dataPecas);
            } catch (err: any) {
                console.error("Erro ao buscar peças:", err);
            } finally {
                setIsPecasLoading(false);
            }
        };

        fetchPecas();
        fetchOrcamentoData();
    }, [orcamentoId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddPeca = () => {
        setFormData(prev => ({ ...prev, pecasUtilizadas: [...prev.pecasUtilizadas, { pecaId: "", quantidade: 1, descricaoPeca: "Selecione...", precoUnitario: 0, subtotal: 0 }]}));
    };

    const handlePecaItemChange = (index: number, field: keyof ItemPecaForm, value: string) => {
        const novasPecas = [...formData.pecasUtilizadas];
        const itemAtual = { ...novasPecas[index] };
        if (field === 'pecaId') {
            const pecaSelecionada = pecasDisponiveis.find(p => p.id.toString() === value);
            itemAtual.pecaId = value;
            itemAtual.descricaoPeca = pecaSelecionada?.descricao || "Peça inválida";
            itemAtual.precoUnitario = pecaSelecionada?.preco || 0; // Usa o preço atual da peça para novas adições ou alterações
        } else if (field === 'quantidade') {
            itemAtual.quantidade = Math.max(1, parseInt(value, 10) || 1);
        }
        itemAtual.subtotal = (itemAtual.precoUnitario || 0) * itemAtual.quantidade;
        novasPecas[index] = itemAtual;
        setFormData(prev => ({ ...prev, pecasUtilizadas: novasPecas }));
    };
    const handleRemovePeca = (index: number) => {
        setFormData(prev => ({...prev, pecasUtilizadas: prev.pecasUtilizadas.filter((_, i) => i !== index)}));
    };

    const { totalCustoPecas, totalMaoDeObraOrcamento, valorTotalOrcamento } = useMemo(() => {
        const custoPecas = formData.pecasUtilizadas.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        const maoDeObraAdicional = parseInputCurrencyToNumber(formData.valorMaoDeObraAdicional);
        const valorHora = parseInputCurrencyToNumber(formData.valorHoraOrcamento);
        const qtdHoras = Number(formData.quantidadeHorasOrcamento) || 0;
        const custoMaoDeObraHoras = valorHora * qtdHoras;
        const totalMaoObra = maoDeObraAdicional + custoMaoDeObraHoras;
        return { totalCustoPecas: custoPecas, totalMaoDeObraOrcamento: totalMaoObra, valorTotalOrcamento: custoPecas + totalMaoObra };
    }, [formData.pecasUtilizadas, formData.valorMaoDeObraAdicional, formData.valorHoraOrcamento, formData.quantidadeHorasOrcamento]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true); setError(null); setSuccess(null);

        const pecasParaEnvio = formData.pecasUtilizadas
            .filter(p => p.pecaId && !isNaN(parseInt(p.pecaId, 10)))
            .map(p => ({
                idOficinaPeca: p.idOficinaPeca, // Enviar o ID da OficinaPeca para o backend saber se é para atualizar ou criar novo
                pecaId: parseInt(p.pecaId, 10),
                quantidade: p.quantidade
            }));

        const payload = {
            // Dados da Oficina
            dataOficina: formData.dataOficina,
            descricaoProblema: formData.descricaoProblema,
            diagnostico: formData.diagnostico,
            partesAfetadas: formData.partesAfetadas,
            horasTrabalhadasOficina: formData.horasTrabalhadasOficina,
            pecasUtilizadas: pecasParaEnvio,

            // Dados do Orçamento
            dataOrcamento: formData.dataOrcamento,
            valorMaoDeObraAdicional: parseInputCurrencyToNumber(formData.valorMaoDeObraAdicional),
            valorHoraOrcamento: parseInputCurrencyToNumber(formData.valorHoraOrcamento),
            quantidadeHorasOrcamento: Number(formData.quantidadeHorasOrcamento),

            // Associações
            clienteId: formData.clienteId ? parseInt(formData.clienteId, 10) : null,
            clienteEnderecoId: formData.clienteEnderecoId ? parseInt(formData.clienteEnderecoId, 10) : null,
            veiculoId: formData.veiculoId ? parseInt(formData.veiculoId, 10) : null,

            // Para o PUT, o oficinaExistenteId é o ID da oficina que estamos editando
            oficinaExistenteId: formData.oficinaId
        };

        if (payload.clienteId === null || isNaN(payload.clienteId)) delete (payload as any).clienteId;
        if (payload.clienteEnderecoId === null || isNaN(payload.clienteEnderecoId)) delete (payload as any).clienteEnderecoId;
        if (payload.veiculoId === null || isNaN(payload.veiculoId)) delete (payload as any).veiculoId;

        console.log("Enviando payload para ATUALIZAR Orçamento:", JSON.stringify(payload, null, 2));

        try {
            const response = await fetch(`http://localhost:8080/rest/orcamentos/completo/${orcamentoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}.` }));
                throw new Error(errorData.message || `Erro ${response.status}`);
            }

            setSuccess(`Orçamento ID ${orcamentoId} atualizado com sucesso!`);
            // Opcional: Recarregar os dados após o sucesso para refletir quaisquer mudanças feitas pelo backend (ex: IDs de novas OficinaPeca)
            // fetchOrcamentoData(); // Se o backend retornar o objeto atualizado, pode apenas atualizar o estado com ele.
            setTimeout(() => setSuccess(null), 5000);

        } catch (err: any) {
            setError(err.message || "Falha ao atualizar orçamento e serviço.");
            console.error("Erro no fetch PUT:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetchingData) {
        return ( /* ... JSX de Loading ... */
            <>
                <NavBar active="orcamento-alterar" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
                        <p className="mt-3 text-sky-300 text-lg">Carregando dados do orçamento...</p>
                    </div>
                </main>
            </>
        );
    }

    if (error && !formData.oficinaId && !isFetchingData) { // Erro grave ao carregar dados iniciais
        return ( /* ... JSX de Erro Grave ... */
            <>
                <NavBar active="orcamento-alterar" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl text-center w-full max-w-lg">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4"/>
                        <h2 className="text-xl font-semibold text-red-400 mb-3">Erro ao Carregar Dados</h2>
                        <p className="text-slate-300 mb-6">{error}</p>
                        <Link href="/orcamento/listar">
                            <button className="px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-md text-white font-semibold">Voltar para Lista</button>
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    // Formulário JSX (idêntico ao de cadastro, apenas com títulos e botões diferentes)
    return (
        <>
            <NavBar active="orcamento-alterar" />
            <main className="container mx-auto px-4 py-10 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-4xl mx-auto">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-8 text-center">
                        <FileText size={30} className="text-sky-400" />
                        Alterar Orçamento e Serviço (Orçam. ID: {orcamentoId})
                    </h1>

                    {error && !isFetchingData && (
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
                            <legend className="text-xl font-semibold px-2 text-sky-300 flex items-center gap-2"><Wrench size={22}/> Detalhes do Serviço (Oficina ID: {formData.oficinaId || 'N/A'})</legend>
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

                        <div className="mt-8 p-4 bg-slate-800 rounded-lg text-center">
                            <h3 className="text-2xl font-bold text-sky-300">
                                VALOR TOTAL DO ORÇAMENTO:
                                <span className="ml-2 text-green-400">{formatNumberToCurrencyString(valorTotalOrcamento)}</span>
                            </h3>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                            <button
                                type="submit"
                                className={`flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 font-semibold text-white bg-green-600 rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isLoading || isFetchingData ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading || isFetchingData}
                            >
                                <MdSave size={20}/> {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                            <Link href="/orcamento/listar" className="w-full sm:w-auto">
                                <button type="button" className="flex items-center justify-center gap-2 w-full px-8 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 text-center">
                                    <MdArrowBack size={20}/> Voltar para Lista
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