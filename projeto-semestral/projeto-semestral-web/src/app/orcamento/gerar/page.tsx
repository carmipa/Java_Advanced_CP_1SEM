// src/app/orcamento/gerar/page.tsx
"use client";

// Imports Essenciais
import React, {
    useState,
    useEffect,
    FormEvent,
    useMemo,
    Suspense,
    useCallback,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; // useRouter para redirecionamento
import NavBar from "@/components/nav-bar";
import TabbedForm, { AppTab } from "@/components/forms/TabbedForm";

// Autenticação e Erro Customizado
import { fetchAuthenticated, AuthError } from "@/utils/apiService"; // Importar AuthError

// Ícones
import {
    UserCircle, Car, Wrench, PackagePlus, HardHat, FileText, DollarSign, Save,
    Info, Settings, Clock, Tag, MessageSquare, ScanSearch, ListChecks, Loader2,
    AlertCircle, ShieldCheck, CalendarCheck2, Trash2,
} from "lucide-react";
import {
    MdCalendarToday, MdAddCircleOutline, MdDelete, MdErrorOutline,
    MdCheckCircle, MdPerson, MdDirectionsCar, MdBadge, MdArrowBack,
} from "react-icons/md";

// Interfaces (mantidas como no seu original)
interface PecaResponseDto {
    id: number;
    tipoVeiculo?: string;
    fabricante?: string;
    descricao: string;
    codigoFabricantePeca?: string;
    marcaPeca?: string;
    aplicacaoDetalhada?: string;
    preco: number;
}
interface PecaDisponivel {
    id: number;
    textoDisplay: string;
    preco: number;
    descricao: string;
    codigoFabricantePeca?: string;
    marcaPeca?: string;
    aplicacaoDetalhada?: string;
}
interface ItemPecaForm {
    idOficinaPeca?: number;
    pecaId: string;
    descricaoPeca?: string;
    quantidade: number;
    precoUnitario?: number;
    subtotal?: number;
}
interface ClienteResponseDto {
    idCli: number;
    nome?: string;
    sobrenome?: string;
    numeroDocumento?: string;
    endereco?: { codigo: number; [key: string]: any } | null;
}
interface VeiculoResponseDto {
    id: number;
    placa?: string;
    modelo?: string;
    montadora?: string;
}
interface OrcamentoFormData {
    clienteId: string;
    clienteEnderecoId: string;
    veiculoId: string;
    nomeCliente: string;
    documentoCliente: string;
    modeloVeiculo: string;
    placaVeiculo: string;
    fabricanteVeiculo: string;
    oficinaExistenteId?: number | null;
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
}

// Função utilitária de erro (mantida)
const tratarErroFetch = (err: any, context?: string): string => {
    const prefix = context ? `${context}: ` : "";
    if (err instanceof AuthError) { // Especificamente para AuthError, pode querer uma msg diferente ou deixar ser tratada pelo redirect
        return `${prefix}${err.message}`;
    }
    if (err instanceof TypeError && err.message === "Failed to fetch") {
        return `${prefix}Não foi possível conectar ao servidor. Verifique a API e a rede.`;
    }
    // Tenta extrair mensagem de erro do JSON (se backend envia JSON de erro)
    if (err.message && err.message.includes('message":')) {
        try {
            // Supõe que a mensagem de erro está no formato { "message": "..." }
            const errorJson = JSON.parse(err.message.substring(err.message.indexOf("{")));
            if (errorJson.message) return `${prefix}${errorJson.message}`;
        } catch (_) { /* ignora erro de parse, continua para próximo handler */ }
    }
    // Tratamento para erros comuns
    if (
        err.message &&
        (err.message.startsWith("Erro HTTP") ||
            err.message.includes("inválido") ||
            err.message.includes("não encontrado"))
    ) {
        return `${prefix}${err.message}`;
    }
    return `${prefix}${err.message || "Ocorreu um erro desconhecido."}`;
};


function GerarOrcamentoPageComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const today = new Date().toISOString().split("T")[0];

    const [formData, setFormData] = useState<OrcamentoFormData>(() => {
        const cliId = searchParams.get("cliId") || "";
        const endId = searchParams.get("endId") || "";
        const veiId = searchParams.get("veiId") || "";
        return {
            clienteId: cliId, clienteEnderecoId: endId, veiculoId: veiId,
            nomeCliente: cliId && endId ? "Carregando..." : "INVÁLIDO",
            documentoCliente: cliId && endId ? "Carregando..." : "INVÁLIDO",
            modeloVeiculo: veiId ? "Carregando..." : "INVÁLIDO",
            placaVeiculo: veiId ? "Carregando..." : "INVÁLIDO",
            fabricanteVeiculo: veiId ? "Carregando..." : "INVÁLIDO",
            oficinaExistenteId: null, dataOficina: today, descricaoProblema: "",
            diagnostico: "", partesAfetadas: "", horasTrabalhadasOficina: "0.0",
            pecasUtilizadas: [], dataOrcamento: today, valorMaoDeObraAdicional: "0,00",
            valorHoraOrcamento: "0,00", quantidadeHorasOrcamento: 0,
        };
    });

    const [pecasDisponiveis, setPecasDisponiveis] = useState<PecaDisponivel[]>([]);
    const [activeTab, setActiveTab] = useState(0); // Para controlar a aba ativa
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const cliId = searchParams.get("cliId");
        const endId = searchParams.get("endId");
        const veiId = searchParams.get("veiId");
        console.log('[GerarOrcamentoPage] Mount/Param change - cliId:', cliId, 'endId:', endId, 'veiId:', veiId);

        if (!cliId || !endId || !veiId) {
            console.error('[GerarOrcamentoPage] IDs ausentes na URL. Redirecionando para /orcamento/iniciar.');
            setError("IDs de cliente, endereço ou veículo ausentes na URL. Selecione novamente.");
            router.replace("/orcamento/iniciar"); // Use replace para não adicionar ao histórico
            setIsLoadingData(false); // Para o loading se for redirecionar
            return; // Interrompe o useEffect
        }
        // Se os IDs existem, reseta o erro (caso tenha sido setado antes) e continua o carregamento
        setError(null);
        setIsLoadingData(true);
    }, [searchParams, router]);


    const parseInputCurrencyToNumber = useCallback((inputValue: string): number => {
        if (!inputValue) return 0;
        const cleaned = inputValue.replace(/\./g, "").replace(",", ".");
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    }, []);

    const formatNumberToDisplayCurrencyString = useCallback(
        (value: number | undefined | null): string => {
            if (value === null || value === undefined || isNaN(value)) return "R$ 0,00";
            return value.toLocaleString("pt-BR", {
                style: "currency", currency: "BRL",
                minimumFractionDigits: 2, maximumFractionDigits: 2,
            });
        }, []
    );

    useEffect(() => {
        const cliId = searchParams.get("cliId");
        const endId = searchParams.get("endId");
        const veiId = searchParams.get("veiId");

        // Não executa se os IDs não estiverem presentes (já tratado no useEffect acima)
        // ou se não estiver mais no estado de isLoadingData (para evitar re-fetches desnecessários)
        if (!cliId || !endId || !veiId || !isLoadingData) {
            if (!cliId || !endId || !veiId) setIsLoadingData(false); // Garante que para o loading se IDs sumirem
            return;
        }

        let isMounted = true; // Flag para cleanup

        const fetchInitialData = async () => {
            console.log('[GerarOrcamentoPage] fetchInitialData: Iniciando busca de dados...');
            setError(null); // Limpa erros anteriores
            let tempUpdate: Partial<OrcamentoFormData> = {};
            let accumulatedErrorMessages = "";

            try {
                const results = await Promise.allSettled([
                    fetchAuthenticated(`/rest/clientes/${cliId}/${endId}`),
                    fetchAuthenticated(`/rest/veiculo/${veiId}`),
                    fetchAuthenticated("/rest/pecas/all"),
                ]);
                console.log('[GerarOrcamentoPage] fetchInitialData: Resultados do Promise.allSettled:', JSON.parse(JSON.stringify(results)));

                // Checa por AuthError primeiro em qualquer uma das chamadas
                for (const result of results) {
                    if (result.status === 'rejected' && result.reason instanceof AuthError) {
                        console.warn('[GerarOrcamentoPage] AuthError detectado em uma das chamadas. Redirecionando para /login.');
                        if (isMounted) router.replace('/login');
                        return; // Interrompe o processamento
                    }
                }

                // Processa Cliente
                const clienteResSettled = results[0];
                if (clienteResSettled.status === "fulfilled") {
                    const clienteRes = clienteResSettled.value;
                    if (clienteRes.ok) {
                        const clienteData: ClienteResponseDto = await clienteRes.json();
                        tempUpdate.nomeCliente = `${clienteData.nome || ""} ${clienteData.sobrenome || ""}`.trim() || "N/A";
                        tempUpdate.documentoCliente = clienteData.numeroDocumento || "N/A";
                    } else {
                        const errorText = await clienteRes.text().catch(() => `Erro ${clienteRes.status} ao buscar cliente.`);
                        accumulatedErrorMessages += tratarErroFetch({ message: errorText }, "Cliente") + "\n";
                        tempUpdate.nomeCliente = "Erro Cliente";
                    }
                } else {
                    accumulatedErrorMessages += tratarErroFetch(clienteResSettled.reason, "Cliente (Promise Rejeitada)") + "\n";
                    tempUpdate.nomeCliente = "Erro Cliente";
                }

                // Processa Veículo
                const veiculoResSettled = results[1];
                if (veiculoResSettled.status === "fulfilled") {
                    const veiculoRes = veiculoResSettled.value;
                    if (veiculoRes.ok) {
                        const veiculoData: VeiculoResponseDto = await veiculoRes.json();
                        tempUpdate.modeloVeiculo = veiculoData.modelo || "N/A";
                        tempUpdate.placaVeiculo = veiculoData.placa || "N/A";
                        tempUpdate.fabricanteVeiculo = veiculoData.montadora || "N/A";
                    } else {
                        const errorText = await veiculoRes.text().catch(() => `Erro ${veiculoRes.status} ao buscar veículo.`);
                        accumulatedErrorMessages += tratarErroFetch({ message: errorText }, "Veículo") + "\n";
                        tempUpdate.modeloVeiculo = "Erro Veículo";
                    }
                } else {
                    accumulatedErrorMessages += tratarErroFetch(veiculoResSettled.reason, "Veículo (Promise Rejeitada)") + "\n";
                    tempUpdate.modeloVeiculo = "Erro Veículo";
                }

                // Processa Peças
                const pecasResSettled = results[2];
                if (pecasResSettled.status === "fulfilled") {
                    const pecasRes = pecasResSettled.value;
                    if (pecasRes.ok) {
                        if (pecasRes.status !== 204) {
                            const dataPecasApi: PecaResponseDto[] = await pecasRes.json();
                            const pecasFormatadas = (dataPecasApi || []).map((p) => ({
                                id: p.id, preco: p.preco, descricao: p.descricao,
                                codigoFabricantePeca: p.codigoFabricantePeca || undefined,
                                marcaPeca: p.marcaPeca || p.fabricante || undefined,
                                aplicacaoDetalhada: p.aplicacaoDetalhada || undefined,
                                textoDisplay: `${p.descricao} (${p.marcaPeca || p.fabricante || "S/Marca"}) ${p.codigoFabricantePeca ? `- Cód: ${p.codigoFabricantePeca}` : ""} - ${formatNumberToDisplayCurrencyString(p.preco)}`,
                            }));
                            if (isMounted) setPecasDisponiveis(pecasFormatadas);
                        } else {
                            if (isMounted) setPecasDisponiveis([]);
                        }
                    } else {
                        const errorText = await pecasRes.text().catch(() => `Erro ${pecasRes.status} ao buscar peças.`);
                        accumulatedErrorMessages += tratarErroFetch({ message: errorText }, "Peças") + "\n";
                    }
                } else {
                    accumulatedErrorMessages += tratarErroFetch(pecasResSettled.reason, "Peças (Promise Rejeitada)") + "\n";
                }

            } catch (err: any) { // Captura erros inesperados do Promise.allSettled ou da lógica de processamento
                console.error("[GerarOrcamentoPage] Erro CRÍTICO em fetchInitialData:", err);
                if (isMounted) {
                    setError(tratarErroFetch(err, "Carregamento de Dados") || "Erro muito inesperado ao carregar dados.");
                }
            } finally {
                if (isMounted) {
                    // Atualiza o formData com o que foi carregado ou com mensagens de erro
                    setFormData((prev) => ({
                        ...prev,
                        ...tempUpdate, // Aplica os dados carregados ou 'Erro...'
                        clienteId: cliId || prev.clienteId, // Mantém IDs da URL
                        clienteEnderecoId: endId || prev.clienteEnderecoId,
                        veiculoId: veiId || prev.veiculoId,
                    }));
                    if (accumulatedErrorMessages) {
                        setError(accumulatedErrorMessages.trim());
                    }
                    setIsLoadingData(false);
                    console.log('[GerarOrcamentoPage] fetchInitialData: Finalizado.');
                }
            }
        };

        fetchInitialData();

        return () => {
            isMounted = false;
            console.log('[GerarOrcamentoPage] Componente desmontado ou dependências mudaram.');
        };
    }, [searchParams, router, isLoadingData, formatNumberToDisplayCurrencyString]); // Adicionado isLoadingData para controlar re-fetch
    // e formatNumberToDisplayCurrencyString por ser usada no map de peças

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
        }, []);

    const handleCurrencyChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            const cleanedValue = value.replace(/[^0-9,]/g, ""); // Permite vírgula para decimal
            setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
        }, []);

    const handleAddPeca = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            pecasUtilizadas: [
                ...prev.pecasUtilizadas,
                { pecaId: "", quantidade: 1, descricaoPeca: "Selecione...", precoUnitario: 0, subtotal: 0 },
            ],
        }));
    }, []);

    const handlePecaItemChange = useCallback(
        (index: number, field: keyof ItemPecaForm, value: string | number) => {
            const novasPecas = [...formData.pecasUtilizadas];
            const itemAtual = { ...novasPecas[index] };

            if (field === "pecaId" && typeof value === "string") {
                const pecaSelecionada = pecasDisponiveis.find((p) => p.id.toString() === value);
                itemAtual.pecaId = value;
                itemAtual.descricaoPeca = pecaSelecionada?.descricao || "Peça inválida";
                itemAtual.precoUnitario = pecaSelecionada?.preco || 0;
            } else if (field === "quantidade" && typeof value === "string") {
                itemAtual.quantidade = parseInt(value, 10) >= 1 ? parseInt(value, 10) : 1;
            }
            itemAtual.subtotal = (itemAtual.precoUnitario || 0) * itemAtual.quantidade;
            novasPecas[index] = itemAtual;
            setFormData((prev) => ({ ...prev, pecasUtilizadas: novasPecas }));
        }, [formData.pecasUtilizadas, pecasDisponiveis]
    );

    const handleRemovePeca = useCallback((index: number) => {
        setFormData((prev) => ({
            ...prev,
            pecasUtilizadas: prev.pecasUtilizadas.filter((_, i) => i !== index),
        }));
    }, []);

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
            valorTotalOrcamento: custoPecas + totalMaoObra,
        };
    }, [
        formData.pecasUtilizadas, formData.valorMaoDeObraAdicional,
        formData.valorHoraOrcamento, formData.quantidadeHorasOrcamento,
        parseInputCurrencyToNumber,
    ]);

    const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isLoadingData || !formData.clienteId || !formData.veiculoId ||
            formData.nomeCliente.includes("Erro") || formData.modeloVeiculo.includes("Erro") ||
            formData.nomeCliente.includes("INVÁLIDO")) {
            setError("Aguarde o carregamento ou corrija erros de cliente/veículo. Verifique se os IDs estão corretos na URL.");
            return;
        }
        setIsSubmitting(true); setError(null); setSuccess(null);

        const pecasParaEnvio = formData.pecasUtilizadas
            .filter((p) => p.pecaId && !isNaN(parseInt(p.pecaId, 10)))
            .map((p) => ({ pecaId: parseInt(p.pecaId, 10), quantidade: p.quantidade }));

        const payload = {
            dataOficina: formData.dataOficina, descricaoProblema: formData.descricaoProblema,
            diagnostico: formData.diagnostico, partesAfetadas: formData.partesAfetadas,
            horasTrabalhadasOficina: formData.horasTrabalhadasOficina,
            pecasUtilizadas: pecasParaEnvio, dataOrcamento: formData.dataOrcamento,
            valorMaoDeObraAdicional: parseInputCurrencyToNumber(formData.valorMaoDeObraAdicional),
            valorHoraOrcamento: parseInputCurrencyToNumber(formData.valorHoraOrcamento),
            quantidadeHorasOrcamento: Number(formData.quantidadeHorasOrcamento),
            clienteId: parseInt(formData.clienteId, 10),
            clienteEnderecoId: parseInt(formData.clienteEnderecoId, 10),
            veiculoId: parseInt(formData.veiculoId, 10),
            oficinaExistenteId: formData.oficinaExistenteId || null,
        };

        if (isNaN(payload.clienteId)) delete (payload as any).clienteId;
        if (isNaN(payload.clienteEnderecoId)) delete (payload as any).clienteEnderecoId;
        if (isNaN(payload.veiculoId)) delete (payload as any).veiculoId;
        if (payload.oficinaExistenteId === null) delete (payload as any).oficinaExistenteId;

        console.log("[GerarOrcamentoPage] Enviando payload para /rest/orcamentos/completo:", JSON.stringify(payload, null, 2));

        try {
            const response = await fetchAuthenticated("/rest/orcamentos/completo", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status} ao registrar orçamento.` }));
                throw new Error(errorData.message || `Erro ${response.status}`);
            }
            const result = await response.json();
            setSuccess(`Orçamento (ID: ${result.id}) registrado com sucesso!`);
            setFormData((prev) => ({
                ...prev, oficinaExistenteId: null, dataOficina: today,
                descricaoProblema: "", diagnostico: "", partesAfetadas: "",
                horasTrabalhadasOficina: "0.0", pecasUtilizadas: [], dataOrcamento: today,
                valorMaoDeObraAdicional: "0,00", valorHoraOrcamento: "0,00",
                quantidadeHorasOrcamento: 0,
            }));
            setActiveTab(0);
            setTimeout(() => setSuccess(null), 7000);
        } catch (err: any) {
            if (err instanceof AuthError) { // Se o erro for de autenticação, redireciona
                console.warn("[GerarOrcamentoPage] AuthError no handleSubmit. Redirecionando...");
                router.replace('/login');
            } else {
                setError(tratarErroFetch(err, "Registro de Orçamento"));
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, isLoadingData, parseInputCurrencyToNumber, today, router, formatNumberToDisplayCurrencyString]); // Adicionei formatNumberToDisplayCurrencyString se ele for usado em tabs

    const tabs: AppTab[] = useMemo(() => [
        {
            label: "Serviço",
            icon: <Wrench size={16} />,
            content: (
                <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label htmlFor="dataOficina" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <MdCalendarToday size={16}/> Data do Serviço:
                            </label>
                            <input type="date" name="dataOficina" id="dataOficina" value={formData.dataOficina} onChange={handleChange} required className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500 date-input-fix"/>
                        </div>
                        <div>
                            <label htmlFor="horasTrabalhadasOficina" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <Clock size={16}/> Horas Trabalhadas (Serviço):
                            </label>
                            <input type="text" name="horasTrabalhadasOficina" id="horasTrabalhadasOficina" value={formData.horasTrabalhadasOficina} onChange={handleChange} required placeholder="Ex: 2.5" className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"/>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="descricaoProblema" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <MessageSquare size={16}/> Descrição do Problema (Cliente):
                            </label>
                            <textarea name="descricaoProblema" id="descricaoProblema" value={formData.descricaoProblema} onChange={handleChange} rows={3} required className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"/>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="diagnostico" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <ScanSearch size={16}/> Diagnóstico (Técnico):
                            </label>
                            <textarea name="diagnostico" id="diagnostico" value={formData.diagnostico} onChange={handleChange} rows={3} className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"/>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="partesAfetadas" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <Settings size={16}/> Partes Afetadas:
                            </label>
                            <input type="text" name="partesAfetadas" id="partesAfetadas" value={formData.partesAfetadas} onChange={handleChange} required className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"/>
                        </div>
                    </div>
                </div>
            )
        },
        {
            label: "Peças",
            icon: <PackagePlus size={16} />,
            content: (
                <div className="space-y-3 pt-2">
                    {isLoadingData && pecasDisponiveis.length === 0 && <p className="text-slate-400 text-sm">Carregando lista de peças...</p>}
                    {!isLoadingData && pecasDisponiveis.length === 0 && <p className="text-slate-400 text-sm">Nenhuma peça cadastrada ou falha ao carregar. Verifique o cadastro de peças.</p>}

                    {formData.pecasUtilizadas.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-end border-b border-slate-700 py-3 last:border-b-0">
                            <div>
                                <label htmlFor={`pecaId-${index}`} className="block text-xs font-medium text-slate-400 mb-1">Peça:</label>
                                <select
                                    name={`pecaId`} id={`pecaId-${index}`} value={item.pecaId}
                                    onChange={(e) => handlePecaItemChange(index, 'pecaId', e.target.value)}
                                    required
                                    className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-sm focus:ring-2 focus:ring-sky-500"
                                    disabled={isLoadingData || pecasDisponiveis.length === 0}
                                >
                                    <option value="" disabled>{isLoadingData ? "Carregando..." : (pecasDisponiveis.length === 0 ? "Nenhuma peça" : "Selecione...")}</option>
                                    {pecasDisponiveis.map(p => (
                                        <option key={p.id} value={p.id.toString()}>{p.textoDisplay}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor={`quantidade-${index}`} className="block text-xs font-medium text-slate-400 mb-1">Qtd.:</label>
                                <input type="number" name="quantidade" id={`quantidade-${index}`} value={item.quantidade} onChange={(e) => handlePecaItemChange(index, 'quantidade', e.target.value)} min="1" required className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-sm focus:ring-2 focus:ring-sky-500"/>
                            </div>
                            <div className="text-sm">
                                <span className="block text-xs text-slate-400 mb-1">Preço Unit.:</span>
                                <span className="block p-2 h-10 flex items-center bg-slate-600 rounded border border-slate-500">{formatNumberToDisplayCurrencyString(item.precoUnitario)}</span>
                            </div>
                            <div className="text-sm">
                                <span className="block text-xs text-slate-400 mb-1">Subtotal:</span>
                                <span className="block p-2 h-10 flex items-center bg-slate-600 rounded border border-slate-500 font-semibold">{formatNumberToDisplayCurrencyString(item.subtotal)}</span>
                            </div>
                            <button type="button" onClick={() => handleRemovePeca(index)} className="p-2 h-10 bg-red-600 hover:bg-red-700 rounded text-white flex items-center justify-center" title="Remover Peça">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    ))}
                    <button
                        type="button" onClick={handleAddPeca}
                        disabled={isLoadingData || pecasDisponiveis.length === 0}
                        className={`mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md transition ${isLoadingData || pecasDisponiveis.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <MdAddCircleOutline size={18}/> Adicionar Peça
                    </button>
                    <div className="text-right mt-4 font-semibold text-lg">
                        Custo Total das Peças: <span className="text-green-400">{formatNumberToDisplayCurrencyString(totalCustoPecas)}</span>
                    </div>
                </div>
            )
        },
        {
            label: "Mão de Obra",
            icon: <HardHat size={16} />,
            content: (
                <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        <div>
                            <label htmlFor="dataOrcamento" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <MdCalendarToday size={16}/> Data Orçamento:
                            </label>
                            <input type="date" name="dataOrcamento" id="dataOrcamento" value={formData.dataOrcamento} onChange={handleChange} required className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500 date-input-fix"/>
                        </div>
                        <div>
                            <label htmlFor="valorMaoDeObraAdicional" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <Tag size={16}/> Taxa M.O. Adicional (R$):
                            </label>
                            <input type="text" name="valorMaoDeObraAdicional" id="valorMaoDeObraAdicional" value={formData.valorMaoDeObraAdicional} onChange={handleCurrencyChange} placeholder="0,00" className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"/>
                        </div>
                        <div>
                            <label htmlFor="valorHoraOrcamento" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <DollarSign size={16}/> Valor/Hora (R$):
                            </label>
                            <input type="text" name="valorHoraOrcamento" id="valorHoraOrcamento" value={formData.valorHoraOrcamento} onChange={handleCurrencyChange} required placeholder="0,00" className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"/>
                        </div>
                        <div>
                            <label htmlFor="quantidadeHorasOrcamento" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <Clock size={16}/> Qtd. Horas Orç.:
                            </label>
                            <input type="number" name="quantidadeHorasOrcamento" id="quantidadeHorasOrcamento" value={formData.quantidadeHorasOrcamento} onChange={handleChange} min="0" step="0.1" required className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"/>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3 text-right mt-2 font-semibold text-lg">
                            Custo Total Mão de Obra: <span className="text-yellow-400">{formatNumberToDisplayCurrencyString(totalMaoDeObraOrcamento)}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            label: "Resumo",
            icon: <FileText size={16} />,
            content: (
                <div className="space-y-5 pt-3 text-sm">
                    {isLoadingData ? (
                        <p className="text-center text-slate-400">Carregando dados do cliente e veículo...</p>
                    ) : error && (formData.nomeCliente.includes("Erro") || formData.modeloVeiculo.includes("Erro")) ? (
                        <p className="text-center text-red-400">Falha ao carregar alguns dados. Verifique a aba de erros.</p>
                    ) : (
                        <>
                            <div className="p-4 bg-slate-700/30 rounded-md border border-slate-600">
                                <h3 className="text-md font-semibold text-sky-300 mb-2 flex items-center gap-2"><UserCircle size={18}/> Cliente</h3>
                                <p><strong>Nome:</strong> {formData.nomeCliente}</p>
                                <p><strong>Documento:</strong> {formData.documentoCliente}</p>
                            </div>
                            <div className="p-4 bg-slate-700/30 rounded-md border border-slate-600">
                                <h3 className="text-md font-semibold text-sky-300 mb-2 flex items-center gap-2"><Car size={18}/> Veículo</h3>
                                <p><strong>Modelo:</strong> {formData.modeloVeiculo} ({formData.fabricanteVeiculo})</p>
                                <p><strong>Placa:</strong> {formData.placaVeiculo}</p>
                            </div>
                        </>
                    )}
                    <div className="mt-6 p-4 bg-slate-700 rounded-lg border-2 border-sky-500 text-center">
                        <h3 className="text-xl font-bold text-sky-300 mb-1">
                            VALOR TOTAL DO ORÇAMENTO:
                        </h3>
                        <p className="text-3xl font-extrabold text-green-400">
                            {formatNumberToDisplayCurrencyString(valorTotalOrcamento)}
                        </p>
                    </div>
                </div>
            )
        }
    ], [
        formData, isLoadingData, pecasDisponiveis, error, // Adicionado 'error' aqui para que o conteúdo da aba possa re-renderizar se o erro mudar
        totalCustoPecas, totalMaoDeObraOrcamento, valorTotalOrcamento,
        handleChange, handleCurrencyChange, handleAddPeca, handlePecaItemChange, handleRemovePeca,
        formatNumberToDisplayCurrencyString // Dependência do helper
    ]);

    // Render principal
    if (isLoadingData && (!formData.clienteId || !formData.veiculoId)) { // Se IDs sumiram e ainda está "carregando" (estado inicial antes do redirect do primeiro useEffect)
        return ( // UI de fallback mais robusta para quando IDs não estão na URL
            <div className="min-h-screen bg-[#012A46] flex flex-col">
                <NavBar active="orcamento-gerar" />
                <main className="container mx-auto flex-grow flex justify-center items-center">
                    <div className="flex flex-col items-center text-center px-4 bg-slate-800 p-10 rounded-lg shadow-xl border border-red-500">
                        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
                        <p className="text-xl text-red-300 mb-2">Parâmetros Inválidos</p>
                        <p className="text-sm text-slate-300 mb-6">
                            Os IDs do cliente e do veículo são necessários para gerar um orçamento.
                        </p>
                        <Link href="/orcamento/iniciar">
                            <button className="px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-md text-white font-semibold flex items-center gap-2">
                                <MdArrowBack /> Voltar e Selecionar
                            </button>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <>
            <NavBar active="orcamento-gerar" />
            <main className="container mx-auto px-4 py-10 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-xl max-w-4xl mx-auto border border-slate-700">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center">
                        <ShieldCheck size={30} className="text-sky-400" />
                        Gerar Novo Orçamento e Serviço
                    </h1>

                    {/* Feedback global */}
                    {error && !isLoadingData && ( // Só mostra erro principal se não estiver carregando
                        <div className="relative mb-6 text-red-300 bg-red-800/40 p-4 rounded border border-red-600 text-sm flex items-start gap-2">
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-semibold">Erro ao carregar dados ou durante a operação:</strong>
                                <pre className="whitespace-pre-wrap mt-1 text-xs">{error}</pre>
                            </div>
                            <button type="button" className="absolute top-2 right-2 text-red-300 hover:text-red-100" onClick={() => setError(null)}>&times;</button>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center justify-center gap-2 text-green-300 p-3 mb-6 rounded bg-green-800/40 border border-green-600 text-sm">
                            <MdCheckCircle size={20}/> {success}
                        </div>
                    )}

                    {isLoadingData && (
                        <div className="min-h-[300px] flex flex-col justify-center items-center text-center p-6 bg-slate-800/50 rounded-lg my-6">
                            <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
                            <p className="mt-3 text-md text-sky-300">Carregando dados do Cliente, Veículo e Peças...</p>
                            <p className="text-xs text-slate-400">Isso pode levar um momento.</p>
                        </div>
                    )}

                    {!isLoadingData && (
                        <form onSubmit={handleSubmit}>
                            <TabbedForm tabs={tabs} selectedIndex={activeTab} onChange={setActiveTab} />

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 mt-8 border-t border-slate-700">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isLoadingData || !!error || formData.nomeCliente.includes("Erro") || formData.nomeCliente.includes("INVÁLIDO")}
                                    className={`flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md transition-opacity
                                        ${(isSubmitting || isLoadingData || !!error || formData.nomeCliente.includes("Erro") || formData.nomeCliente.includes("INVÁLIDO"))
                                        ? "opacity-50 cursor-not-allowed" : "hover:bg-green-500"}`}
                                >
                                    <Save size={18}/> {isSubmitting ? "Registrando..." : "Registrar Orçamento e Serviço"}
                                </button>
                                <Link href="/orcamento/listar">
                                    <button type="button" className="flex items-center gap-2 px-8 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-md shadow-md">
                                        <MdArrowBack /> Voltar para Lista
                                    </button>
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </main>
            <style jsx global>{`.date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }`}</style>
        </>
    );
}

// Wrapper com Suspense
export default function GerarOrcamentoPageWrapper() {
    const fallbackUI = (
        <div className="min-h-screen bg-[#012A46] flex flex-col">
            <NavBar active="orcamento-gerar" />
            <main className="container mx-auto flex-grow flex justify-center items-center">
                <div className="flex flex-col items-center text-center px-4">
                    <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
                    <p className="mt-3 text-lg text-white">Carregando página de orçamento...</p>
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