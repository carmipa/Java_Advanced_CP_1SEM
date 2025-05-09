// src/app/orcamento/gerar/page.tsx
"use client";

// Imports Essenciais
import React, { useState, useEffect, FormEvent, useMemo, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Importar useRouter
import NavBar from '@/components/nav-bar';
import TabbedForm, { AppTab } from '@/components/forms/TabbedForm';

// Ícones
import {
    UserCircle, Car, Wrench, PackagePlus, HardHat, FileText, DollarSign, Save,
    Info, Settings, Clock, Tag, MessageSquare, ScanSearch, ListChecks, Loader2, AlertCircle,
    ShieldCheck, CalendarCheck2, Trash2
} from 'lucide-react';
import {
    MdCalendarToday, MdAddCircleOutline, MdDelete, MdErrorOutline, MdCheckCircle, MdPerson, MdDirectionsCar, MdBadge, MdArrowBack
} from 'react-icons/md';

// --- Interfaces ---
// ... (Suas interfaces PecaResponseDto, PecaDisponivel, ItemPecaForm, ClienteResponseDto, VeiculoResponseDto, OrcamentoFormData permanecem aqui) ...
interface PecaResponseDto { id: number; tipoVeiculo?: string; fabricante?: string; descricao: string; codigoFabricantePeca?: string; marcaPeca?: string; aplicacaoDetalhada?: string; preco: number; }
interface PecaDisponivel { id: number; textoDisplay: string; preco: number; descricao: string; codigoFabricantePeca?: string; marcaPeca?: string; aplicacaoDetalhada?: string; }
interface ItemPecaForm { idOficinaPeca?: number; pecaId: string; descricaoPeca?: string; quantidade: number; precoUnitario?: number; subtotal?: number; }
interface ClienteResponseDto { idCli: number; nome?: string; sobrenome?: string; numeroDocumento?: string; endereco?: { codigo: number; [key: string]: any; } | null; }
interface VeiculoResponseDto { id: number; placa?: string; modelo?: string; montadora?: string; }
interface OrcamentoFormData { clienteId: string; clienteEnderecoId: string; veiculoId: string; nomeCliente: string; documentoCliente: string; modeloVeiculo: string; placaVeiculo: string; fabricanteVeiculo: string; oficinaExistenteId?: number | null; dataOficina: string; descricaoProblema: string; diagnostico: string; partesAfetadas: string; horasTrabalhadasOficina: string; pecasUtilizadas: ItemPecaForm[]; dataOrcamento: string; valorMaoDeObraAdicional: string; valorHoraOrcamento: string; quantidadeHorasOrcamento: number; }


const tratarErroFetch = (err: any, context?: string): string => {
    const prefix = context ? `${context}: ` : "";
    if (err instanceof TypeError && err.message === 'Failed to fetch') { return `${prefix}Não foi possível conectar ao servidor. Verifique a API e a rede.`; }
    if (err.message && err.message.includes("message\":")) { try { const errorJson = JSON.parse(err.message.substring(err.message.indexOf("{"))); if(errorJson.message) return `${prefix}${errorJson.message}`; } catch (e) {} }
    if (err.message && (err.message.startsWith("Erro HTTP") || err.message.includes("inválido") || err.message.includes("não encontrado"))) { return `${prefix}${err.message}`; }
    return `${prefix}${err.message || "Ocorreu um erro desconhecido."}`;
};

// --- Componente da Página de Geração ---
function GerarOrcamentoPageComponent() {
    const router = useRouter(); // <<< --- ADICIONAR useRouter ---
    const searchParams = useSearchParams();
    const today = new Date().toISOString().split('T')[0];

    // <<< LOG NO RENDER >>>
    console.log("[GerarOrcamento RENDER] cliId:", searchParams.get('cliId'));
    console.log("[GerarOrcamento RENDER] endId:", searchParams.get('endId'));
    console.log("[GerarOrcamento RENDER] veiId:", searchParams.get('veiId'));

    // <<< INICIALIZAÇÃO DO ESTADO REFEITA >>>
    const [formData, setFormData] = useState<OrcamentoFormData>(() => {
        const cliId = searchParams.get('cliId') || "";
        const endId = searchParams.get('endId') || "";
        const veiId = searchParams.get('veiId') || "";
        return {
            clienteId: cliId,
            clienteEnderecoId: endId,
            veiculoId: veiId,
            nomeCliente: cliId && endId ? "Carregando..." : "INVÁLIDO",
            documentoCliente: cliId && endId ? "Carregando..." : "INVÁLIDO",
            modeloVeiculo: veiId ? "Carregando..." : "INVÁLIDO",
            placaVeiculo: veiId ? "Carregando..." : "INVÁLIDO",
            fabricanteVeiculo: veiId ? "Carregando..." : "INVÁLIDO",
            oficinaExistenteId: null,
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
        };
    });

    const [pecasDisponiveis, setPecasDisponiveis] = useState<PecaDisponivel[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // <<< --- LÓGICA DE VERIFICAÇÃO E REDIRECIONAMENTO --- >>>
    useEffect(() => {
        const cliId = searchParams.get('cliId');
        const endId = searchParams.get('endId');
        const veiId = searchParams.get('veiId');

        if (!cliId || !endId || !veiId) {
            console.warn("[GerarOrcamento Redirect Check] IDs faltando na URL. Redirecionando...");
            // Define um erro temporário para o usuário (opcional)
            setError("Necessário selecionar cliente e veículo primeiro.");
            // Redireciona imediatamente para a página de início/seleção
            router.replace('/orcamento/iniciar'); // Use replace para não adicionar ao histórico
        }
        // Se os IDs existirem, o useEffect principal (abaixo) cuidará do fetch
    }, [searchParams, router]);
    // <<< --- FIM DA LÓGICA DE REDIRECIONAMENTO --- >>>

    const parseInputCurrencyToNumber = useCallback((inputValue: string): number => { if (!inputValue) return 0; const cleaned = inputValue.replace(/\./g, '').replace(',', '.'); const num = parseFloat(cleaned); return isNaN(num) ? 0 : num; }, []);
    const formatNumberToDisplayCurrencyString = useCallback((value: number | undefined | null): string => { if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00'; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }); }, []);

    // <<< useEffect REFEITO PARA BUSCAR DADOS >>>
    useEffect(() => {
        const cliId = searchParams.get('cliId');
        const endId = searchParams.get('endId');
        const veiId = searchParams.get('veiId');

        console.log("[GerarOrcamento Data useEffect RUN] IDs lidos da URL:", { cliId, endId, veiId });

        // A verificação principal e redirecionamento já aconteceram no effect anterior.
        // Se chegou aqui, os IDs *devem* estar presentes.
        // Apenas faz o fetch se realmente necessário (primeira carga ou IDs mudaram).
        if (!cliId || !endId || !veiId) {
            console.error("Erro inesperado: IDs faltando mesmo após verificação inicial.");
            // Isso não deveria acontecer devido ao effect anterior, mas é uma segurança.
            setIsLoadingData(false);
            return;
        }

        // Só busca se ainda estiver carregando OU se os IDs no estado não baterem com os da URL
        if(isLoadingData || formData.clienteId !== cliId || formData.clienteEnderecoId !== endId || formData.veiculoId !== veiId) {
            console.log("[GerarOrcamento Data useEffect] IDs válidos ou diferentes dos atuais. Iniciando fetch...");
            // Indica que está carregando OS DADOS (não a página em si)
            setIsLoadingData(true);
            setError(null);

            // Atualiza estado para "Carregando..." se necessário (IDs mudaram)
            if(formData.clienteId !== cliId || formData.clienteEnderecoId !== endId || formData.veiculoId !== veiId) {
                setFormData(prev => ({
                    ...prev,
                    clienteId: cliId,
                    clienteEnderecoId: endId,
                    veiculoId: veiId,
                    nomeCliente: "Carregando...",
                    documentoCliente: "Carregando...",
                    modeloVeiculo: "Carregando...",
                    placaVeiculo: "Carregando...",
                    fabricanteVeiculo: "Carregando...",
                    // Preserva o resto do formulário
                }));
            }

            setPecasDisponiveis([]); // Limpa peças para recarregar

            const fetchInitialData = async () => {
                console.log("[fetchInitialData] Iniciando buscas...");
                let accumulatedErrorMessages = "";
                let tempFormDataUpdate: Partial<OrcamentoFormData> = {};

                try {
                    const [clienteRes, veiculoRes, pecasRes] = await Promise.allSettled([
                        fetch(`http://localhost:8080/rest/clientes/${cliId}/${endId}`),
                        fetch(`http://localhost:8080/rest/veiculo/${veiId}`),
                        fetch('http://localhost:8080/rest/pecas/all')
                    ]);
                    console.log("[fetchInitialData] Fetches concluídos (status):", {
                        cliente: clienteRes.status === 'fulfilled' ? clienteRes.value.status : 'rejected',
                        veiculo: veiculoRes.status === 'fulfilled' ? veiculoRes.value.status : 'rejected',
                        pecas: pecasRes.status === 'fulfilled' ? pecasRes.value.status : 'rejected',
                    });

                    // Processar Cliente
                    if (clienteRes.status === 'fulfilled' && clienteRes.value.ok) {
                        const clienteData: ClienteResponseDto = await clienteRes.value.json();
                        tempFormDataUpdate.nomeCliente = `${clienteData.nome || ''} ${clienteData.sobrenome || ''}`.trim() || 'N/A';
                        tempFormDataUpdate.documentoCliente = clienteData.numeroDocumento || 'N/A';
                    } else {
                        const status = clienteRes.status === 'fulfilled' ? clienteRes.value.status : 'Fetch Failed';
                        const reason = clienteRes.status === 'rejected' ? clienteRes.reason : await clienteRes.value.text();
                        const errorMsg = tratarErroFetch({ message: `Cliente (IDs: ${cliId}/${endId}, Status: ${status}, Razão: ${reason})` }, "Cliente");
                        accumulatedErrorMessages += errorMsg + "\n";
                        tempFormDataUpdate.nomeCliente = "Erro ao Carregar";
                        tempFormDataUpdate.documentoCliente = "Erro";
                    }

                    // Processar Veículo
                    if (veiculoRes.status === 'fulfilled' && veiculoRes.value.ok) {
                        const veiculoData: VeiculoResponseDto = await veiculoRes.value.json();
                        tempFormDataUpdate.modeloVeiculo = veiculoData.modelo || 'N/A';
                        tempFormDataUpdate.placaVeiculo = veiculoData.placa || 'N/A';
                        tempFormDataUpdate.fabricanteVeiculo = veiculoData.montadora || 'N/A';
                    } else {
                        const status = veiculoRes.status === 'fulfilled' ? veiculoRes.value.status : 'Fetch Failed';
                        const reason = veiculoRes.status === 'rejected' ? veiculoRes.reason : await veiculoRes.value.text();
                        const errorMsg = tratarErroFetch({ message: `Veículo (ID: ${veiId}, Status: ${status}, Razão: ${reason})` }, "Veículo");
                        accumulatedErrorMessages += errorMsg + "\n";
                        tempFormDataUpdate.modeloVeiculo = "Erro ao Carregar";
                        tempFormDataUpdate.placaVeiculo = "Erro";
                        tempFormDataUpdate.fabricanteVeiculo = "Erro";
                    }

                    // Processar Peças
                    if (pecasRes.status === 'fulfilled' && pecasRes.value.ok) {
                        if (pecasRes.value.status !== 204) {
                            const dataPecasApi: PecaResponseDto[] = await pecasRes.value.json();
                            const pecasFormatadas = (dataPecasApi || []).map(p => ({
                                id: p.id,
                                preco: p.preco,
                                descricao: p.descricao,
                                codigoFabricantePeca: p.codigoFabricantePeca || undefined,
                                marcaPeca: p.marcaPeca || p.fabricante || undefined,
                                aplicacaoDetalhada: p.aplicacaoDetalhada || undefined,
                                textoDisplay: `${p.descricao} (${p.marcaPeca || p.fabricante || 'S/Marca'}) ${p.codigoFabricantePeca ? `- Cód: ${p.codigoFabricantePeca}` : ''} - ${formatNumberToDisplayCurrencyString(p.preco)}`
                            }));
                            setPecasDisponiveis(pecasFormatadas);
                            console.log("[fetchInitialData] Peças carregadas:", pecasFormatadas.length);
                        } else {
                            setPecasDisponiveis([]);
                            console.log("[fetchInitialData] Nenhuma peça encontrada (204).");
                        }
                    } else {
                        const status = pecasRes.status === 'fulfilled' ? pecasRes.value.status : 'Fetch Failed';
                        const reason = pecasRes.status === 'rejected' ? pecasRes.reason : await pecasRes.value.text();
                        accumulatedErrorMessages += tratarErroFetch({ message: `Peças (Status: ${status}, Razão: ${reason})` }, "Peças") + "\n";
                    }

                } catch (err: any) {
                    console.error("[fetchInitialData] Erro Catch Promise.all:", err);
                    setError(tratarErroFetch(err, "Dados Iniciais"));
                    tempFormDataUpdate = { nomeCliente: "Erro Geral", documentoCliente: "Erro", modeloVeiculo: "Erro", placaVeiculo: "Erro", fabricanteVeiculo: "Erro" };
                } finally {
                    console.log("[fetchInitialData] Atualizando estado final com dados buscados/erros.");
                    setFormData(prev => ({ ...prev, ...tempFormDataUpdate }));
                    if (accumulatedErrorMessages) { setError(accumulatedErrorMessages.trim()); }
                    setIsLoadingData(false); // Finaliza o loading geral
                }
            };

            fetchInitialData();
        } else {
            console.log("[GerarOrcamento Data useEffect] Dados já carregados e IDs não mudaram. Skipping fetch.");
            // Se os IDs no estado já batem com a URL e não está mais carregando, não faz nada.
            setIsLoadingData(false); // Garante que loading está false
        }

    }, [searchParams]); // Dependência principal é searchParams

    // ... (Callbacks como handleChange, handleCurrencyChange, handleAddPeca, handlePecaItemChange, handleRemovePeca permanecem os mesmos) ...
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); }, []);
    const handleCurrencyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const { name, value } = e.target; const cleanedValue = value.replace(/[^0-9,]/g, ''); setFormData(prev => ({ ...prev, [name]: cleanedValue })); }, []);
    const handleAddPeca = useCallback(() => { setFormData(prev => ({ ...prev, pecasUtilizadas: [...prev.pecasUtilizadas, { pecaId: "", quantidade: 1, descricaoPeca: "Selecione...", precoUnitario: 0, subtotal: 0 }]})); }, []);
    const handlePecaItemChange = useCallback((index: number, field: keyof ItemPecaForm, value: string | number) => {
        const novasPecas = [...formData.pecasUtilizadas]; const itemAtual = { ...novasPecas[index] };
        if (field === 'pecaId' && typeof value === 'string') { const pecaSelecionada = pecasDisponiveis.find(p => p.id.toString() === value); itemAtual.pecaId = value; itemAtual.descricaoPeca = pecaSelecionada?.descricao || "Peça inválida"; itemAtual.precoUnitario = pecaSelecionada?.preco || 0; }
        else if (field === 'quantidade' && typeof value === 'string') { itemAtual.quantidade = parseInt(value, 10) >= 1 ? parseInt(value, 10) : 1; }
        itemAtual.subtotal = (itemAtual.precoUnitario || 0) * itemAtual.quantidade; novasPecas[index] = itemAtual; setFormData(prev => ({ ...prev, pecasUtilizadas: novasPecas }));
    }, [formData.pecasUtilizadas, pecasDisponiveis]);
    const handleRemovePeca = useCallback((index: number) => { setFormData(prev => ({...prev, pecasUtilizadas: prev.pecasUtilizadas.filter((_, i) => i !== index)})); }, []);

    // ... (useMemo para cálculos permanece o mesmo) ...
    const { totalCustoPecas, totalMaoDeObraOrcamento, valorTotalOrcamento } = useMemo(() => {
        const custoPecas = formData.pecasUtilizadas.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        const maoDeObraAdicional = parseInputCurrencyToNumber(formData.valorMaoDeObraAdicional);
        const valorHora = parseInputCurrencyToNumber(formData.valorHoraOrcamento);
        const qtdHoras = Number(formData.quantidadeHorasOrcamento) || 0;
        const custoMaoDeObraHoras = valorHora * qtdHoras;
        const totalMaoObra = maoDeObraAdicional + custoMaoDeObraHoras;
        return { totalCustoPecas: custoPecas, totalMaoDeObraOrcamento: totalMaoObra, valorTotalOrcamento: custoPecas + totalMaoObra };
    }, [formData.pecasUtilizadas, formData.valorMaoDeObraAdicional, formData.valorHoraOrcamento, formData.quantidadeHorasOrcamento, parseInputCurrencyToNumber]);

    // ... (handleSubmit permanece o mesmo) ...
    const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isLoadingData || !formData.clienteId || !formData.veiculoId || formData.nomeCliente.includes("Erro") || formData.modeloVeiculo.includes("Erro") || formData.nomeCliente.includes("INVÁLIDO")) { setError("Aguarde o carregamento ou corrija erros de cliente/veículo. Verifique se os IDs estão corretos na URL."); return; }
        setIsSubmitting(true); setError(null); setSuccess(null);
        const pecasParaEnvio = formData.pecasUtilizadas.filter(p => p.pecaId && !isNaN(parseInt(p.pecaId, 10))).map(p => ({ pecaId: parseInt(p.pecaId, 10), quantidade: p.quantidade }));
        const payload = {
            dataOficina: formData.dataOficina, descricaoProblema: formData.descricaoProblema, diagnostico: formData.diagnostico,
            partesAfetadas: formData.partesAfetadas, horasTrabalhadasOficina: formData.horasTrabalhadasOficina, pecasUtilizadas: pecasParaEnvio,
            dataOrcamento: formData.dataOrcamento, valorMaoDeObraAdicional: parseInputCurrencyToNumber(formData.valorMaoDeObraAdicional),
            valorHoraOrcamento: parseInputCurrencyToNumber(formData.valorHoraOrcamento), quantidadeHorasOrcamento: Number(formData.quantidadeHorasOrcamento),
            clienteId: parseInt(formData.clienteId, 10), clienteEnderecoId: parseInt(formData.clienteEnderecoId, 10),
            veiculoId: parseInt(formData.veiculoId, 10), oficinaExistenteId: formData.oficinaExistenteId || null,
        };
        if (isNaN(payload.clienteId)) delete (payload as any).clienteId;
        if (isNaN(payload.clienteEnderecoId)) delete (payload as any).clienteEnderecoId;
        if (isNaN(payload.veiculoId)) delete (payload as any).veiculoId;
        if (payload.oficinaExistenteId === null) delete (payload as any).oficinaExistenteId;
        console.log("Enviando payload Orçamento:", JSON.stringify(payload, null, 2));
        try {
            const response = await fetch("http://localhost:8080/rest/orcamentos/completo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (!response.ok) { const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}.` })); throw new Error(errorData.message || `Erro ${response.status}`); }
            const result = await response.json();
            setSuccess(`Orçamento (ID: ${result.id}) registrado com sucesso!`);
            // Reset parcial
            setFormData(prev => ({
                ...prev,
                oficinaExistenteId: null, dataOficina: today, descricaoProblema: "", diagnostico: "", partesAfetadas: "", horasTrabalhadasOficina: "0.0", pecasUtilizadas: [], dataOrcamento: today, valorMaoDeObraAdicional: "0,00", valorHoraOrcamento: "0,00", quantidadeHorasOrcamento: 0
            }));
            setActiveTab(0);
            setTimeout(() => setSuccess(null), 7000);
        } catch (err: any) { setError(err.message || "Falha ao registrar orçamento."); console.error("Erro no fetch POST Orçamento:", err);
        } finally { setIsSubmitting(false); }
    }, [formData, isLoadingData, parseInputCurrencyToNumber, today, router]);


    // --- Definição das Abas ---
    const tabs: AppTab[] = useMemo(() => [
        { // Aba 1: Cliente & Veículo
            label: "Cliente & Veículo", icon: <UserCircle size={18} className="text-slate-400" />,
            content: ( /* ... JSX da Aba 1 ... */ <div className="space-y-4 p-1 md:p-4 bg-slate-800/30 rounded-md min-h-[150px]"> {error && (formData.nomeCliente.includes("Erro") || formData.modeloVeiculo.includes("Erro") || formData.nomeCliente.includes("INVÁLIDO")) && ( <div className="text-sm text-red-400 p-2 mb-2 bg-red-900/20 rounded border border-red-700/50"> <p className="font-semibold flex items-center gap-1"><AlertCircle size={16}/> Falha ao carregar dados:</p> <pre className="mt-1 text-xs whitespace-pre-wrap">{error}</pre> </div> )} <h3 className="text-lg font-semibold text-sky-400 mb-3 border-b border-slate-700 pb-2">Dados do Cliente</h3> {isLoadingData ? <p className="text-sm text-slate-400">Carregando...</p> : ( <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"> <p><strong className="text-slate-400">Nome:</strong> <span className="text-slate-100">{formData.nomeCliente}</span></p> <p><strong className="text-slate-400">Documento:</strong> <span className="text-slate-100">{formData.documentoCliente}</span></p> </div> )} <h3 className="text-lg font-semibold text-sky-400 mt-4 mb-3 border-b border-slate-700 pb-2">Dados do Veículo</h3> {isLoadingData ? <p className="text-sm text-slate-400">Carregando...</p> : ( <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm"> <p><strong className="text-slate-400">Placa:</strong> <span className="text-slate-100">{formData.placaVeiculo}</span></p> <p><strong className="text-slate-400">Modelo:</strong> <span className="text-slate-100">{formData.modeloVeiculo}</span></p> <p><strong className="text-slate-400">Fabricante:</strong> <span className="text-slate-100">{formData.fabricanteVeiculo}</span></p> </div> )} <div className='mt-4 text-right'> {(formData.clienteId && formData.clienteEnderecoId && formData.veiculoId && !formData.nomeCliente.includes("ERRO") && !formData.modeloVeiculo.includes("ERRO") && !formData.nomeCliente.includes("INVÁLIDO")) ? ( <Link href="/orcamento/iniciar" className="text-xs text-sky-400 hover:text-sky-200 underline"> Trocar cliente/veículo </Link> ) : ( <span className="text-xs text-red-500 italic"> Dados inválidos ou erro no carregamento. Retorne para seleção. </span> )} </div> </div> ),
            disabled: false // Aba sempre visível, conteúdo interno lida com loading/erro
        },
        { // Aba 2: Serviço/Diagnóstico
            label: "Serviço/Diagnóstico", icon: <Wrench size={18} className="text-slate-400" />,
            content: ( <fieldset className="space-y-4 p-1 md:p-4"> <div> <label htmlFor="dataOficina" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><MdCalendarToday size={16}/> Data:</label> <input type="date" name="dataOficina" id="dataOficina" value={formData.dataOficina} onChange={handleChange} required className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 date-input-fix"/> </div> <div> <label htmlFor="horasTrabalhadasOficina" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><Clock size={16}/> Horas Trab.:</label> <input type="text" name="horasTrabalhadasOficina" id="horasTrabalhadasOficina" value={formData.horasTrabalhadasOficina} onChange={handleChange} required placeholder="Ex: 2.5" className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600"/> </div> <div className="md:col-span-2"> <label htmlFor="descricaoProblema" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><MessageSquare size={16}/> Descrição Problema:</label> <textarea name="descricaoProblema" id="descricaoProblema" value={formData.descricaoProblema} onChange={handleChange} rows={3} required className="w-full p-2 rounded bg-slate-700 border border-slate-600"/> </div> <div className="md:col-span-2"> <label htmlFor="diagnostico" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><ScanSearch size={16}/> Diagnóstico:</label> <textarea name="diagnostico" id="diagnostico" value={formData.diagnostico} onChange={handleChange} rows={3} className="w-full p-2 rounded bg-slate-700 border border-slate-600"/> </div> <div className="md:col-span-2"> <label htmlFor="partesAfetadas" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><Settings size={16}/> Partes Afetadas:</label> <input type="text" name="partesAfetadas" id="partesAfetadas" value={formData.partesAfetadas} onChange={handleChange} required className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600"/> </div> </fieldset> ),
            disabled: isLoadingData || !formData.clienteId || !formData.veiculoId || formData.nomeCliente.includes("ERRO") || formData.nomeCliente.includes("INVÁLIDO")
        },
        { // Aba 3: Peças
            label: "Peças", icon: <PackagePlus size={18} className="text-slate-400" />,
            content: ( <fieldset className="space-y-4 p-1 md:p-4"> {isLoadingData && <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="animate-spin"/>Carregando peças...</div>} {/* Mudou aqui para isLoadingData */} {!isLoadingData && pecasDisponiveis.length === 0 && !error?.includes("Peças") && <p className="text-slate-400 text-sm">Nenhuma peça. Cadastre-as primeiro.</p>} {error && error.includes("Peças") && <p className="text-red-400 text-sm">{error.split('\n').find(e => e.startsWith("Peças:"))}</p>} {formData.pecasUtilizadas.map((item, index) => ( <div key={index} className="grid grid-cols-1 sm:grid-cols-[2fr_80px_110px_110px_auto] gap-2 items-end border-b border-slate-700/50 py-3 last:border-b-0"> <div> <label htmlFor={`pecaId-${index}`} className="block text-xs font-medium text-slate-400 mb-1">Peça:</label> <select name={`pecaId-${index}`} id={`pecaId-${index}`} value={item.pecaId} onChange={(e) => handlePecaItemChange(index, 'pecaId', e.target.value)} required className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-sm disabled:opacity-50" disabled={isLoadingData}> <option value="" disabled>{isLoadingData ? "Carregando..." : "Selecione..."}</option> {pecasDisponiveis.map(p => (<option key={p.id} value={p.id.toString()}>{p.textoDisplay}</option>))} </select> {item.pecaId && pecasDisponiveis.find(p => p.id.toString() === item.pecaId)?.aplicacaoDetalhada && pecasDisponiveis.find(p => p.id.toString() === item.pecaId)?.aplicacaoDetalhada !== 'N/A' && ( <p className="text-xs text-slate-400 mt-1"> Aplicação: {pecasDisponiveis.find(p => p.id.toString() === item.pecaId)?.aplicacaoDetalhada} </p> )} </div> <div> <label htmlFor={`quantidade-${index}`} className="block text-xs font-medium text-slate-400 mb-1">Qtd.:</label> <input type="number" name={`quantidade-${index}`} id={`quantidade-${index}`} value={item.quantidade} onChange={(e) => handlePecaItemChange(index, 'quantidade', e.target.value)} min="1" required className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-sm"/> </div> <div className="text-sm"> <span className="block text-xs text-slate-400 mb-1">Preço Unit.:</span> <span className="block p-2 h-10 leading-tight flex items-center bg-slate-800 rounded border border-slate-700">{formatNumberToDisplayCurrencyString(item.precoUnitario)}</span> </div> <div className="text-sm"> <span className="block text-xs text-slate-400 mb-1">Subtotal:</span> <span className="block p-2 h-10 leading-tight flex items-center bg-slate-800 rounded border border-slate-700 font-semibold">{formatNumberToDisplayCurrencyString(item.subtotal)}</span> </div> <button type="button" onClick={() => handleRemovePeca(index)} className="p-2 h-10 bg-red-600 hover:bg-red-700 rounded text-white flex items-center justify-center" title="Remover Peça"><Trash2 size={18}/></button> </div> ))} <button type="button" onClick={handleAddPeca} disabled={isLoadingData || pecasDisponiveis.length === 0} className={`mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md ${isLoadingData || pecasDisponiveis.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}> <MdAddCircleOutline size={18}/> Adicionar Peça </button> <div className="text-right mt-4 font-semibold text-lg">Custo Total das Peças: <span className="text-green-400">{formatNumberToDisplayCurrencyString(totalCustoPecas)}</span></div> </fieldset> ),
            disabled: isLoadingData || !formData.clienteId || !formData.veiculoId || formData.nomeCliente.includes("ERRO") || formData.nomeCliente.includes("INVÁLIDO")
        },
        { // Aba 4: Mão de Obra
            label: "Mão de Obra", icon: <HardHat size={18} className="text-slate-400" />,
            content: ( <fieldset className="space-y-4 p-1 md:p-4"> <div> <label htmlFor="dataOrcamento" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><MdCalendarToday size={16}/> Data Orçam.:</label> <input type="date" name="dataOrcamento" id="dataOrcamento" value={formData.dataOrcamento} onChange={handleChange} required className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 date-input-fix"/> </div> <div> <label htmlFor="valorMaoDeObraAdicional" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><Tag size={16}/> Taxa Adicional:</label> <input type="text" name="valorMaoDeObraAdicional" id="valorMaoDeObraAdicional" value={formData.valorMaoDeObraAdicional} onChange={handleCurrencyChange} placeholder="0,00" className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600"/> </div> <div> <label htmlFor="valorHoraOrcamento" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><DollarSign size={16}/> Valor/Hora:</label> <input type="text" name="valorHoraOrcamento" id="valorHoraOrcamento" value={formData.valorHoraOrcamento} onChange={handleCurrencyChange} required placeholder="0,00" className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600"/> </div> <div> <label htmlFor="quantidadeHorasOrcamento" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300"><Clock size={16}/> Qtd. Horas:</label> <input type="number" name="quantidadeHorasOrcamento" id="quantidadeHorasOrcamento" value={formData.quantidadeHorasOrcamento} onChange={handleChange} min="0" step="0.1" required className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600"/> </div> <div className="text-right mt-4 font-semibold text-lg">Custo Total M.O.: <span className="text-yellow-400">{formatNumberToDisplayCurrencyString(totalMaoDeObraOrcamento)}</span></div> </fieldset> ),
            disabled: isLoadingData || !formData.clienteId || !formData.veiculoId || formData.nomeCliente.includes("ERRO") || formData.nomeCliente.includes("INVÁLIDO")
        },
        { // Aba 5: Resumo & Finalizar
            label: "Resumo & Finalizar", icon: <ShieldCheck size={18} className="text-slate-400" />,
            content: ( <div className="space-y-4 p-1 md:p-4 bg-slate-800/30 rounded-md"> <h3 className="text-xl font-semibold text-sky-300 mb-4 border-b border-slate-700 pb-2">Resumo do Orçamento</h3> <div className="text-base space-y-2"> <p className="flex justify-between"><span>Custo Peças:</span> <span className="font-semibold text-green-400">{formatNumberToDisplayCurrencyString(totalCustoPecas)}</span></p> <p className="flex justify-between"><span>Custo Mão de Obra:</span> <span className="font-semibold text-yellow-400">{formatNumberToDisplayCurrencyString(totalMaoDeObraOrcamento)}</span></p> <hr className="border-slate-600 my-3"/> <p className="flex justify-between text-2xl items-center"> <strong className="text-sky-200">VALOR TOTAL:</strong> <strong className="text-green-300 text-3xl">{formatNumberToDisplayCurrencyString(valorTotalOrcamento)}</strong> </p> </div> <p className="text-xs text-slate-500 mt-6"> Confira todos os dados antes de salvar. </p> </div> ),
            disabled: isLoadingData || !formData.clienteId || !formData.veiculoId || formData.nomeCliente.includes("ERRO") || formData.nomeCliente.includes("INVÁLIDO")
        },
    ], [formData, isLoadingData, pecasDisponiveis, error, totalCustoPecas, totalMaoDeObraOrcamento, valorTotalOrcamento, activeTab, handleChange, handleCurrencyChange, handleAddPeca, handlePecaItemChange, handleRemovePeca, formatNumberToDisplayCurrencyString]);

    // --- Renderização ---
    // O JSX principal (com NavBar, main, h1, form, TabbedForm, botões) permanece o mesmo
    // A lógica de exibição de erro e loading já está sendo tratada
    return (
        <>
            <NavBar active="orcamento-gerar" />
            <main className="container mx-auto px-2 sm:px-4 py-10 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-4 sm:p-6 md:p-8 rounded-lg shadow-xl w-full max-w-4xl mx-auto border border-slate-700">
                    <h1 className="flex items-center justify-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center"> <ListChecks size={30} className="text-sky-400" /> Gerar Novo Orçamento de Serviço </h1>

                    {/* Indicador de Loading Principal */}
                    {isLoadingData && !error && ( <div className='flex justify-center items-center py-10'> <Loader2 className="h-8 w-8 animate-spin text-sky-400" /> <span className='ml-3 text-sky-300'>Carregando dados iniciais...</span> </div> )}

                    {/* Mensagem de Erro Crítico (IDs Faltando ou Falha no Fetch Inicial) */}
                    {!isLoadingData && (!formData.clienteId || !formData.veiculoId || formData.nomeCliente.includes("ERRO") || formData.nomeCliente.includes("INVÁLIDO") || error) && (
                        <div className="relative mb-6 text-red-400 bg-red-900/50 p-3 sm:p-4 pr-10 rounded border border-red-500 text-sm" role="alert">
                            <div className="flex items-center gap-2"> <MdErrorOutline className="text-lg flex-shrink-0" /> <span>{error || "Erro: IDs de cliente/veículo não fornecidos ou inválidos."}</span> </div>
                            <Link href="/orcamento/iniciar" className="text-sky-300 underline hover:text-sky-100 text-xs block mt-2 ml-6">Voltar para seleção</Link>
                        </div>
                    )}

                    {/* Formulário e Abas (só renderiza se IDs OK, não estiver carregando e sem erro crítico) */}
                    {!isLoadingData && formData.clienteId && formData.veiculoId && !formData.nomeCliente.includes("INVÁLIDO") && !formData.modeloVeiculo.includes("INVÁLIDO") && !(error && (formData.nomeCliente.includes("ERRO") || formData.modeloVeiculo.includes("ERRO"))) && (
                        <form onSubmit={handleSubmit}>
                            {/* Erro de Submit */}
                            {error && !isLoadingData && !(formData.nomeCliente.includes("ERRO") || formData.modeloVeiculo.includes("ERRO")) && (
                                <div className="relative mb-6 text-red-400 bg-red-900/50 p-3 sm:p-4 pr-10 rounded border border-red-500 text-sm" role="alert">
                                    <div className="flex items-center gap-2"> <MdErrorOutline className="text-lg" /> <span>Houve um problema: {error}</span> </div>
                                    <button type="button" className="absolute top-0 bottom-0 right-0 px-3 sm:px-4 py-1 sm:py-3 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-lg sm:text-xl">&times;</span></button>
                                </div>
                            )}
                            {success && ( <div className="flex items-center justify-center gap-2 text-green-400 p-3 mb-6 rounded bg-green-900/30 border border-green-700 text-sm"> <MdCheckCircle className="text-lg" /> <span>{success}</span> </div> )}

                            <TabbedForm tabs={tabs} selectedIndex={activeTab} onChange={setActiveTab} />

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 mt-6 border-t border-slate-700">
                                <button type="submit" className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 font-semibold text-white bg-green-600 rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isSubmitting || isLoadingData ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isSubmitting || isLoadingData}>
                                    <Save size={18}/> {isSubmitting ? 'Salvando...' : 'Salvar Orçamento e Serviço'}
                                </button>
                                <Link href="/orcamento/listar" className="w-full sm:w-auto">
                                    <button type="button" className="flex items-center justify-center gap-2 w-full px-6 sm:px-8 py-2.5 sm:py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 text-center">
                                        <MdArrowBack size={18}/> Voltar para Lista
                                    </button>
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </main>
            {/* ... styles ... */}
            <style jsx global>{`.date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; } input[type='number'] { -moz-appearance: textfield; } input[type='number']::-webkit-inner-spin-button, input[type='number']::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }`}</style>
        </>
    );
}


// --- Componente Wrapper com Suspense ---
export default function GerarOrcamentoPageWrapper() {
    const fallbackUI = (
        <div className="min-h-screen bg-[#012A46] flex flex-col">
            <NavBar active="orcamento-gerar" />
            <main className="container mx-auto flex-grow flex justify-center items-center">
                <div className="flex flex-col items-center text-center px-4">
                    <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
                    <p className="mt-3 text-lg text-white">Carregando dados para geração de orçamento...</p>
                    <p className="text-sm text-slate-400 mt-1">Isso pode levar um momento.</p>
                </div>
            </main>
        </div>
    );

    return (
        <Suspense fallback={fallbackUI}>
            <GerarOrcamentoPageComponent />
        </Suspense>
    );
}