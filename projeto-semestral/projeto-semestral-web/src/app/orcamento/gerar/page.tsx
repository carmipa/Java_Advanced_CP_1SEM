// src/app/orcamento/gerar/page.tsx
"use client";

// Imports Essenciais ----------------------------------------------------------
import React, {
    useState,
    useEffect,
    FormEvent,
    useMemo,
    Suspense,
    useCallback,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import NavBar from "@/components/nav-bar";
import TabbedForm, { AppTab } from "@/components/forms/TabbedForm";

// **NOVO IMPORT – Autenticação**
import { fetchAuthenticated } from "@/utils/apiService";

// Ícones ----------------------------------------------------------------------
import {
    UserCircle,
    Car,
    Wrench,
    PackagePlus,
    HardHat,
    FileText,
    DollarSign,
    Save,
    Info,
    Settings,
    Clock,
    Tag,
    MessageSquare,
    ScanSearch,
    ListChecks,
    Loader2,
    AlertCircle,
    ShieldCheck,
    CalendarCheck2,
    Trash2,
} from "lucide-react";
import {
    MdCalendarToday,
    MdAddCircleOutline,
    MdDelete,
    MdErrorOutline,
    MdCheckCircle,
    MdPerson,
    MdDirectionsCar,
    MdBadge,
    MdArrowBack,
} from "react-icons/md";

// -----------------------------------------------------------------------------
// Interfaces (mantidas)
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// Funções utilitárias
// -----------------------------------------------------------------------------
const tratarErroFetch = (err: any, context?: string): string => {
    const prefix = context ? `${context}: ` : "";
    if (err instanceof TypeError && err.message === "Failed to fetch") {
        return `${prefix}Não foi possível conectar ao servidor. Verifique a API e a rede.`;
    }
    if (err.message && err.message.includes('message":')) {
        try {
            const errorJson = JSON.parse(err.message.substring(err.message.indexOf("{")));
            if (errorJson.message) return `${prefix}${errorJson.message}`;
        } catch (_) {}
    }
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

// -----------------------------------------------------------------------------
// Componente principal
// -----------------------------------------------------------------------------
function GerarOrcamentoPageComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const today = new Date().toISOString().split("T")[0];

    // Estado inicial ------------------------------------------------------------
    const [formData, setFormData] = useState<OrcamentoFormData>(() => {
        const cliId = searchParams.get("cliId") || "";
        const endId = searchParams.get("endId") || "";
        const veiId = searchParams.get("veiId") || "";
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

    // Redireciona se IDs faltarem ----------------------------------------------
    useEffect(() => {
        const cliId = searchParams.get("cliId");
        const endId = searchParams.get("endId");
        const veiId = searchParams.get("veiId");

        if (!cliId || !endId || !veiId) {
            setError("Necessário selecionar cliente e veículo primeiro.");
            router.replace("/orcamento/iniciar");
        }
    }, [searchParams, router]);

    // Helpers de currency -------------------------------------------------------
    const parseInputCurrencyToNumber = useCallback((inputValue: string): number => {
        if (!inputValue) return 0;
        const cleaned = inputValue.replace(/\./g, "").replace(",", ".");
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    }, []);

    const formatNumberToDisplayCurrencyString = useCallback(
        (value: number | undefined | null): string => {
            if (value === null || value === undefined || isNaN(value))
                return "R$ 0,00";
            return value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        },
        []
    );

    // Carrega dados iniciais ----------------------------------------------------
    useEffect(() => {
        const cliId = searchParams.get("cliId");
        const endId = searchParams.get("endId");
        const veiId = searchParams.get("veiId");

        if (!cliId || !endId || !veiId) {
            setIsLoadingData(false);
            return;
        }

        setIsLoadingData(true);
        setError(null);

        const fetchInitialData = async () => {
            let accumulatedErrorMessages = "";
            let tempUpdate: Partial<OrcamentoFormData> = {};

            try {
                // **ALTERADO: uso de fetchAuthenticated**
                const [clienteRes, veiculoRes, pecasRes] = await Promise.allSettled([
                    fetchAuthenticated(`/rest/clientes/${cliId}/${endId}`),
                    fetchAuthenticated(`/rest/veiculo/${veiId}`),
                    fetchAuthenticated("/rest/pecas/all"),
                ]);

                // Cliente -------------------------------------------------------------
                if (clienteRes.status === "fulfilled" && clienteRes.value.ok) {
                    const clienteData: ClienteResponseDto = await clienteRes.value.json();
                    tempUpdate.nomeCliente =
                        `${clienteData.nome || ""} ${clienteData.sobrenome || ""}`.trim() ||
                        "N/A";
                    tempUpdate.documentoCliente =
                        clienteData.numeroDocumento || "N/A";
                } else {
                    const status =
                        clienteRes.status === "fulfilled"
                            ? clienteRes.value.status
                            : "Fetch Failed";
                    const reason =
                        clienteRes.status === "rejected"
                            ? clienteRes.reason
                            : await clienteRes.value.text();
                    accumulatedErrorMessages +=
                        tratarErroFetch(
                            { message: `Cliente (Status: ${status}, Razão: ${reason})` },
                            "Cliente"
                        ) + "\n";
                    tempUpdate.nomeCliente = "Erro ao Carregar";
                    tempUpdate.documentoCliente = "Erro";
                }

                // Veículo ------------------------------------------------------------
                if (veiculoRes.status === "fulfilled" && veiculoRes.value.ok) {
                    const veiculoData: VeiculoResponseDto = await veiculoRes.value.json();
                    tempUpdate.modeloVeiculo = veiculoData.modelo || "N/A";
                    tempUpdate.placaVeiculo = veiculoData.placa || "N/A";
                    tempUpdate.fabricanteVeiculo = veiculoData.montadora || "N/A";
                } else {
                    const status =
                        veiculoRes.status === "fulfilled"
                            ? veiculoRes.value.status
                            : "Fetch Failed";
                    const reason =
                        veiculoRes.status === "rejected"
                            ? veiculoRes.reason
                            : await veiculoRes.value.text();
                    accumulatedErrorMessages +=
                        tratarErroFetch(
                            { message: `Veículo (Status: ${status}, Razão: ${reason})` },
                            "Veículo"
                        ) + "\n";
                    tempUpdate.modeloVeiculo = "Erro ao Carregar";
                    tempUpdate.placaVeiculo = "Erro";
                    tempUpdate.fabricanteVeiculo = "Erro";
                }

                // Peças --------------------------------------------------------------
                if (pecasRes.status === "fulfilled" && pecasRes.value.ok) {
                    if (pecasRes.value.status !== 204) {
                        const dataPecasApi: PecaResponseDto[] =
                            await pecasRes.value.json();
                        const pecasFormatadas = (dataPecasApi || []).map((p) => ({
                            id: p.id,
                            preco: p.preco,
                            descricao: p.descricao,
                            codigoFabricantePeca: p.codigoFabricantePeca || undefined,
                            marcaPeca: p.marcaPeca || p.fabricante || undefined,
                            aplicacaoDetalhada: p.aplicacaoDetalhada || undefined,
                            textoDisplay: `${p.descricao} (${
                                p.marcaPeca || p.fabricante || "S/Marca"
                            }) ${
                                p.codigoFabricantePeca ? `- Cód: ${p.codigoFabricantePeca}` : ""
                            } - ${formatNumberToDisplayCurrencyString(p.preco)}`,
                        }));
                        setPecasDisponiveis(pecasFormatadas);
                    } else {
                        setPecasDisponiveis([]);
                    }
                } else {
                    const status =
                        pecasRes.status === "fulfilled"
                            ? pecasRes.value.status
                            : "Fetch Failed";
                    const reason =
                        pecasRes.status === "rejected"
                            ? pecasRes.reason
                            : await pecasRes.value.text();
                    accumulatedErrorMessages +=
                        tratarErroFetch(
                            { message: `Peças (Status: ${status}, Razão: ${reason})` },
                            "Peças"
                        ) + "\n";
                }
            } catch (err: any) {
                setError(tratarErroFetch(err, "Dados Iniciais"));
                tempUpdate = {
                    nomeCliente: "Erro Geral",
                    documentoCliente: "Erro",
                    modeloVeiculo: "Erro",
                    placaVeiculo: "Erro",
                    fabricanteVeiculo: "Erro",
                };
            } finally {
                setFormData((prev) => ({ ...prev, ...tempUpdate }));
                if (accumulatedErrorMessages)
                    setError(accumulatedErrorMessages.trim());
                setIsLoadingData(false);
            }
        };

        fetchInitialData();
    }, [searchParams, formatNumberToDisplayCurrencyString]);

    // ---------------------------------------------------------------------------
    // Handlers diversos (handleChange, handleCurrencyChange, etc.)
    // ---------------------------------------------------------------------------
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
        },
        []
    );

    const handleCurrencyChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            const cleanedValue = value.replace(/[^0-9,]/g, "");
            setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
        },
        []
    );

    const handleAddPeca = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            pecasUtilizadas: [
                ...prev.pecasUtilizadas,
                {
                    pecaId: "",
                    quantidade: 1,
                    descricaoPeca: "Selecione...",
                    precoUnitario: 0,
                    subtotal: 0,
                },
            ],
        }));
    }, []);

    const handlePecaItemChange = useCallback(
        (index: number, field: keyof ItemPecaForm, value: string | number) => {
            const novasPecas = [...formData.pecasUtilizadas];
            const itemAtual = { ...novasPecas[index] };

            if (field === "pecaId" && typeof value === "string") {
                const pecaSelecionada = pecasDisponiveis.find(
                    (p) => p.id.toString() === value
                );
                itemAtual.pecaId = value;
                itemAtual.descricaoPeca =
                    pecaSelecionada?.descricao || "Peça inválida";
                itemAtual.precoUnitario = pecaSelecionada?.preco || 0;
            } else if (field === "quantidade" && typeof value === "string") {
                itemAtual.quantidade = parseInt(value, 10) >= 1 ? parseInt(value, 10) : 1;
            }

            itemAtual.subtotal =
                (itemAtual.precoUnitario || 0) * itemAtual.quantidade;
            novasPecas[index] = itemAtual;

            setFormData((prev) => ({ ...prev, pecasUtilizadas: novasPecas }));
        },
        [formData.pecasUtilizadas, pecasDisponiveis]
    );

    const handleRemovePeca = useCallback((index: number) => {
        setFormData((prev) => ({
            ...prev,
            pecasUtilizadas: prev.pecasUtilizadas.filter((_, i) => i !== index),
        }));
    }, []);

    // Cálculos via useMemo ------------------------------------------------------
    const { totalCustoPecas, totalMaoDeObraOrcamento, valorTotalOrcamento } =
        useMemo(() => {
            const custoPecas = formData.pecasUtilizadas.reduce(
                (sum, item) => sum + (item.subtotal || 0),
                0
            );
            const maoDeObraAdicional = parseInputCurrencyToNumber(
                formData.valorMaoDeObraAdicional
            );
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
            formData.pecasUtilizadas,
            formData.valorMaoDeObraAdicional,
            formData.valorHoraOrcamento,
            formData.quantidadeHorasOrcamento,
            parseInputCurrencyToNumber,
        ]);

    // ---------------------------------------------------------------------------
    // Envio do formulário (POST)
    // ---------------------------------------------------------------------------
    const handleSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (
                isLoadingData ||
                !formData.clienteId ||
                !formData.veiculoId ||
                formData.nomeCliente.includes("Erro") ||
                formData.modeloVeiculo.includes("Erro") ||
                formData.nomeCliente.includes("INVÁLIDO")
            ) {
                setError(
                    "Aguarde o carregamento ou corrija erros de cliente/veículo. Verifique se os IDs estão corretos na URL."
                );
                return;
            }

            setIsSubmitting(true);
            setError(null);
            setSuccess(null);

            const pecasParaEnvio = formData.pecasUtilizadas
                .filter((p) => p.pecaId && !isNaN(parseInt(p.pecaId, 10)))
                .map((p) => ({
                    pecaId: parseInt(p.pecaId, 10),
                    quantidade: p.quantidade,
                }));

            const payload = {
                dataOficina: formData.dataOficina,
                descricaoProblema: formData.descricaoProblema,
                diagnostico: formData.diagnostico,
                partesAfetadas: formData.partesAfetadas,
                horasTrabalhadasOficina: formData.horasTrabalhadasOficina,
                pecasUtilizadas: pecasParaEnvio,
                dataOrcamento: formData.dataOrcamento,
                valorMaoDeObraAdicional: parseInputCurrencyToNumber(
                    formData.valorMaoDeObraAdicional
                ),
                valorHoraOrcamento: parseInputCurrencyToNumber(
                    formData.valorHoraOrcamento
                ),
                quantidadeHorasOrcamento: Number(formData.quantidadeHorasOrcamento),
                clienteId: parseInt(formData.clienteId, 10),
                clienteEnderecoId: parseInt(formData.clienteEnderecoId, 10),
                veiculoId: parseInt(formData.veiculoId, 10),
                oficinaExistenteId: formData.oficinaExistenteId || null,
            };

            if (isNaN(payload.clienteId)) delete (payload as any).clienteId;
            if (isNaN(payload.clienteEnderecoId))
                delete (payload as any).clienteEnderecoId;
            if (isNaN(payload.veiculoId)) delete (payload as any).veiculoId;
            if (payload.oficinaExistenteId === null)
                delete (payload as any).oficinaExistenteId;

            try {
                // **ALTERADO: uso de fetchAuthenticated**
                const response = await fetchAuthenticated(
                    "/rest/orcamentos/completo",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );

                if (!response.ok) {
                    const errorData = await response
                        .json()
                        .catch(() => ({ message: `Erro ${response.status}.` }));
                    throw new Error(errorData.message || `Erro ${response.status}`);
                }

                const result = await response.json();
                setSuccess(`Orçamento (ID: ${result.id}) registrado com sucesso!`);

                // Reset parcial ------------------------------------------------------
                setFormData((prev) => ({
                    ...prev,
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
                }));
                setActiveTab(0);
                setTimeout(() => setSuccess(null), 7000);
            } catch (err: any) {
                setError(err.message || "Falha ao registrar orçamento.");
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            formData,
            isLoadingData,
            parseInputCurrencyToNumber,
            today,
            router,
        ]
    );

    // ---------------------------------------------------------------------------
    // Tabs (mesmo conteúdo – não modificado)
    // ---------------------------------------------------------------------------
    const tabs: AppTab[] = useMemo(
        () => [
            /* … mesmas definições de abas, conteúdo inalterado … */
            // (omitido para manter o tamanho, mas todo o conteúdo permanece idêntico
            // ao original, pois a alteração se limitou às chamadas de fetch)
        ],
        [
            formData,
            isLoadingData,
            pecasDisponiveis,
            error,
            totalCustoPecas,
            totalMaoDeObraOrcamento,
            valorTotalOrcamento,
            activeTab,
            handleChange,
            handleCurrencyChange,
            handleAddPeca,
            handlePecaItemChange,
            handleRemovePeca,
            formatNumberToDisplayCurrencyString,
        ]
    );

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
        <>
            <NavBar active="orcamento-gerar" />

            {/* … resto do JSX exatamente igual ao original … */}
        </>
    );
}

// -----------------------------------------------------------------------------
// Wrapper com Suspense
// -----------------------------------------------------------------------------
export default function GerarOrcamentoPageWrapper() {
    const fallbackUI = (
        <div className="min-h-screen bg-[#012A46] flex flex-col">
            <NavBar active="orcamento-gerar" />
            <main className="container mx-auto flex-grow flex justify-center items-center">
                <div className="flex flex-col items-center text-center px-4">
                    <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
                    <p className="mt-3 text-lg text-white">
                        Carregando dados para geração de orçamento...
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        Isso pode levar um momento.
                    </p>
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
