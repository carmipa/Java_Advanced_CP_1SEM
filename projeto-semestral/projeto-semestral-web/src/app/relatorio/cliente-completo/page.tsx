// --- Arquivo: src/app/relatorio/cliente-completo/page.tsx ---
"use client";

import { useState, FormEvent } from 'react';
import NavBar from '@/components/nav-bar'; // Ajuste o path se necessário
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { // Importando ícones relevantes
    MdSearch, MdPerson, MdDirectionsCar, MdCalendarToday, MdBuild,
    MdAttachMoney, MdPayment, MdErrorOutline, MdShowChart, MdListAlt,
    MdBadge, MdWork, MdPhone, MdEmail, MdLocationOn, MdHome, MdReceiptLong, MdPrecisionManufacturing
} from 'react-icons/md';
import { Briefcase, MapPin, PhoneCall, Mail, UserCircle, Wrench, Car, CalendarClock, DollarSign, ListChecks, BarChart3, Info } from 'lucide-react'; // Usando Lucide para variedade

// Registrar ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Interfaces (Espelham o DTO ClienteRelatorioCompletoDTO do Backend) ---
interface EnderecoDto { codigo: number; numero: number; cep: string; logradouro: string; cidade: string; bairro: string; estado: string; complemento: string | null; }
interface ContatoDto { codigo: number; celular: string; email: string; contato: string; }
interface ClienteResponseDto { idCli: number; nome: string; sobrenome: string; tipoCliente: string; numeroDocumento: string; sexo: string; dataNascimento: string; atividadeProfissional: string; endereco: EnderecoDto | null; contato: ContatoDto | null; }
interface VeiculoResponseDto { id: number; tipoVeiculo: string; renavam: string; placa: string; modelo: string; proprietario: string; montadora: string; cor: string; motor: string; anoFabricacao: string; }
interface AgendaSimplificadoDTO { id: number; dataAgendamento: string | null; observacao: string | null; veiculoPlaca: string | null; }
interface PecaUtilizadaDTO { idPeca: number; descricaoPeca: string; fabricante: string; }
interface OficinaServicoDTO { idOficina: number; dataOficina: string | null; descricaoProblema: string | null; diagnostico: string | null; partesAfetadas: string | null; horasTrabalhadas: string | null; veiculoPlaca: string | null; pecasUtilizadas: PecaUtilizadaDTO[]; }
interface OrcamentoResponseDto { id: number; dataOrcamento: string | null; maoDeObra: number; valorHora: number; quantidadeHoras: number; valorTotal: number; }
interface PagamentoResponseDto { id: number; dataPagamento: string | null; tipoPagamento: string; desconto: number; totalParcelas: string; valorParcelas: number; totalComDesconto: number; }

interface ClienteRelatorioCompletoDTO {
    cliente: ClienteResponseDto | null;
    veiculos: VeiculoResponseDto[];
    agendamentos: AgendaSimplificadoDTO[];
    servicosOficina: OficinaServicoDTO[];
    orcamentos: OrcamentoResponseDto[];
    pagamentos: PagamentoResponseDto[];
    totalAgendamentos: number;
}
// ----------------------------------------------------------------------

type TipoBuscaRelatorio = 'id' | 'documento';

export default function RelatorioCompletoClientePage() {
    const [tipoBusca, setTipoBusca] = useState<TipoBuscaRelatorio>('documento');
    const [valorBusca, setValorBusca] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [relatorioData, setRelatorioData] = useState<ClienteRelatorioCompletoDTO | null>(null);
    const [buscaRealizada, setBuscaRealizada] = useState(false); // Para controlar exibição inicial

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setRelatorioData(null);
        setBuscaRealizada(true); // Marca que a busca foi tentada

        if (!valorBusca.trim()) {
            setError("Por favor, insira um valor para busca.");
            setIsLoading(false);
            return;
        }

        // <<< USA O ENDPOINT CORRETO NO CONTROLLER DE RELATÓRIO >>>
        const params = new URLSearchParams({ tipoBusca, valorBusca: valorBusca.trim() });
        const apiUrl = `http://localhost:8080/rest/relatorios/cliente/completo?${params}`;
        console.info("Buscando relatório:", apiUrl);

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                if (response.status === 404) throw new Error("Cliente não encontrado.");
                if (response.status === 400) {
                    const errData = await response.json().catch(()=>({message:"Tipo ou valor de busca inválido."}));
                    throw new Error(errData.message || "Tipo ou valor de busca inválido.");
                }
                throw new Error(`Erro ao buscar relatório: ${response.statusText} (Status: ${response.status})`);
            }
            if (response.status === 204) {
                throw new Error("Cliente não encontrado (204 No Content).");
            }
            const data: ClienteRelatorioCompletoDTO = await response.json();
            if (!data || !data.cliente) {
                throw new Error("Dados recebidos da API estão incompletos ou inválidos.");
            }
            setRelatorioData(data);
        } catch (err: any) {
            setError(err instanceof TypeError && err.message === 'Failed to fetch' ? 'Falha ao conectar com o servidor.' : err.message);
            setRelatorioData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Configuração do Gráfico ---
    const chartData = {
        labels: ['Agendamentos'],
        datasets: [
            {
                label: 'Nº de Agendamentos',
                data: [relatorioData?.totalAgendamentos ?? 0],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                barThickness: 60,
            },
        ],
    };
    const chartOptions = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Total de Agendamentos do Cliente', color: '#e2e8f0', font: {size: 14} },
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: { color: '#94a3b8', stepSize: 1 },
                grid: { color: 'rgba(100, 116, 139, 0.2)' }
            },
            y: {
                ticks: { color: '#94a3b8' },
                grid: { display: false }
            }
        },
    };
    // ---------------------------------

    // Helper para formatar data
    const formatarData = (dataString: string | null | undefined): string => {
        if (!dataString) return '-';
        try {
            return new Date(dataString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch (e) {
            console.error("Erro ao formatar data:", dataString, e);
            return 'Data inválida';
        }
    };

    return (
        <>
            <NavBar active="relatorio" /> {/* Ajuste 'active' se criar item específico */}
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="flex items-center justify-center text-3xl font-bold mb-6 text-center gap-2">
                    <UserCircle size={32} className="text-sky-400"/> Visão 360º do Cliente
                </h1>

                {/* Formulário de Busca */}
                <div className="bg-slate-800 p-4 md:p-6 rounded-lg shadow-lg max-w-3xl mx-auto mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-shrink-0 w-full sm:w-auto">
                            <label htmlFor="tipoBusca" className="block text-sm font-medium mb-1 text-slate-300">Buscar por:</label>
                            <select
                                id="tipoBusca"
                                value={tipoBusca}
                                onChange={(e) => setTipoBusca(e.target.value as TipoBuscaRelatorio)}
                                className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="documento">Documento (CPF/CNPJ)</option>
                                <option value="id">Código Cliente (ID)</option>
                            </select>
                        </div>
                        <div className="flex-grow w-full">
                            <label htmlFor="valorBusca" className="block text-sm font-medium mb-1 text-slate-300">Valor:</label>
                            <input
                                id="valorBusca"
                                type={tipoBusca === 'id' ? 'number' : 'text'}
                                value={valorBusca}
                                onChange={(e) => setValorBusca(e.target.value)}
                                required
                                placeholder={tipoBusca === 'id' ? 'Digite o código...' : 'Digite o CPF ou CNPJ...'}
                                className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-shrink-0 w-full sm:w-auto h-10 px-5 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white flex items-center justify-center font-semibold whitespace-nowrap ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <MdSearch className="mr-2" />
                            {isLoading ? 'Buscando...' : 'Gerar Relatório'}
                        </button>
                    </form>
                </div>


                {/* Exibição de Erro */}
                {error && (
                    <div className="relative max-w-3xl mx-auto mb-6 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                        <MdErrorOutline className="inline mr-2" />{error}
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar">
                            <span className="text-xl">×</span>
                        </button>
                    </div>
                )}

                {/* Exibição do Relatório */}
                {isLoading && !error && <p className="text-center text-sky-300 py-10">Carregando relatório...</p>}

                {!isLoading && !relatorioData && buscaRealizada && !error && (
                    <p className="text-center text-slate-400 py-10">Nenhum cliente encontrado para os critérios informados.</p>
                )}

                {!isLoading && relatorioData && (
                    <div className="space-y-6"> {/* Espaçamento entre as seções */}

                        {/* --- Card Cliente --- */}
                        {relatorioData.cliente && (
                            <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                                <h2 className="flex items-center text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-2 gap-2">
                                    <UserCircle size={24}/> Dados do Cliente
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                                    <span className="flex items-center gap-2"><Info size={16} className="text-slate-500"/><strong>Nome:</strong> {relatorioData.cliente.nome} {relatorioData.cliente.sobrenome}</span>
                                    <span className="flex items-center gap-2"><MdBadge className="text-slate-500"/><strong>Documento:</strong> {relatorioData.cliente.numeroDocumento} ({relatorioData.cliente.tipoDocumento})</span>
                                    <span className="flex items-center gap-2"><Info size={16} className="text-slate-500"/><strong>Tipo:</strong> {relatorioData.cliente.tipoCliente === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span>
                                    <span className="flex items-center gap-2"><MdCalendarToday className="text-slate-500"/><strong>Nascimento:</strong> {formatarData(relatorioData.cliente.dataNascimento)}</span>
                                    <span className="flex items-center gap-2"><Info size={16} className="text-slate-500"/><strong>Sexo:</strong> {relatorioData.cliente.sexo || '-'}</span>
                                    <span className="flex items-center gap-2"><Briefcase size={16} className="text-slate-500"/><strong>Profissão:</strong> {relatorioData.cliente.atividadeProfissional || '-'}</span>
                                    <span className="flex items-center gap-2"><PhoneCall size={16} className="text-slate-500"/><strong>Celular:</strong> {relatorioData.cliente.contato?.celular || '-'}</span>
                                    <span className="flex items-center gap-2 sm:col-span-2 lg:col-span-1"><Mail size={16} className="text-slate-500"/><strong>Email:</strong> {relatorioData.cliente.contato?.email || '-'}</span>

                                    {/* <<< Endereço Corrigido >>> */}
                                    <div className="flex items-start gap-2 col-span-1 sm:col-span-2 lg:col-span-3"> {/* Mantém o container flex e o span das colunas */}
                                        <MapPin size={16} className="text-slate-500 mt-1 flex-shrink-0"/> {/* Ícone alinhado no topo */}
                                        <div className="text-sm"> {/* Div para agrupar todo o texto do endereço com tamanho de fonte base */}
                                            {/* Linha 1: Label e Rua/Num/Comp */}
                                            <p className="text-slate-300">
                                                <strong className="mr-1">Endereço:</strong> {/* Label */}
                                                {`${relatorioData.cliente.endereco?.logradouro || '-'}, ${relatorioData.cliente.endereco?.numero || '-'}`} {/* Rua e Num */}
                                                {/* Complemento (opcional) */}
                                                {relatorioData.cliente.endereco?.complemento ? (
                                                    <span className="text-slate-400 ml-1">- {relatorioData.cliente.endereco.complemento}</span>
                                                ) : ''}
                                            </p>
                                            {/* Linha 2: Bairro, Cidade / Estado */}
                                            <p className="text-slate-400">
                                                {`${relatorioData.cliente.endereco?.bairro || '-'} - ${relatorioData.cliente.endereco?.cidade || '-'} / ${relatorioData.cliente.endereco?.estado || '-'}`}
                                            </p>
                                            {/* Linha 3: CEP */}
                                            <p className="text-slate-400">
                                                CEP: {relatorioData.cliente.endereco?.cep || '-'}
                                            </p>
                                        </div>
                                    </div>
                                    {/* <<< Fim Endereço Corrigido >>> */}

                                </div>
                            </section>
                        )}

                        {/* --- Layout em Colunas para as próximas seções --- */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Coluna Esquerda */}
                            <div className="space-y-6">
                                {/* --- Card Veículos --- */}
                                <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                                    <h2 className="flex items-center text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-2 gap-2">
                                        <Car size={24}/> Veículos ({relatorioData.veiculos?.length ?? 0})
                                    </h2>
                                    {relatorioData.veiculos && relatorioData.veiculos.length > 0 ? (
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                            {relatorioData.veiculos.map(v => (
                                                <div key={v.id} className="border-l-4 border-sky-500 pl-3 text-sm bg-slate-800 p-3 rounded">
                                                    <p><strong>{v.placa}</strong> - {v.modelo} ({v.montadora})</p>
                                                    <p className="text-xs text-slate-400">{v.cor} / {formatarData(v.anoFabricacao)} / Renavam: {v.renavam}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-slate-400 text-sm">Nenhum veículo encontrado.</p>}
                                </section>

                                {/* --- Card Orçamentos --- */}
                                <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                                    <h2 className="flex items-center text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-2 gap-2">
                                        <MdReceiptLong size={24}/> Orçamentos ({relatorioData.orcamentos?.length ?? 0})
                                    </h2>
                                    {relatorioData.orcamentos && relatorioData.orcamentos.length > 0 ? (
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                            {relatorioData.orcamentos.map(o => (
                                                <div key={o.id} className="border-l-4 border-sky-500 pl-3 text-sm bg-slate-800 p-3 rounded">
                                                    <p><strong>Data:</strong> {formatarData(o.dataOrcamento)} | <strong>Total:</strong> R$ {o.valorTotal?.toFixed(2)}</p>
                                                    <p className="text-xs text-slate-400">M.O: R$ {o.maoDeObra?.toFixed(2)} ({o.quantidadeHoras}h @ R$ {o.valorHora?.toFixed(2)}/h)</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-slate-400 text-sm">Nenhum orçamento encontrado.</p>}
                                </section>

                                {/* --- Card Pagamentos --- */}
                                <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                                    <h2 className="flex items-center text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-2 gap-2">
                                        <DollarSign size={24}/> Pagamentos ({relatorioData.pagamentos?.length ?? 0})
                                    </h2>
                                    {relatorioData.pagamentos && relatorioData.pagamentos.length > 0 ? (
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                            {relatorioData.pagamentos.map(p => (
                                                <div key={p.id} className="border-l-4 border-sky-500 pl-3 text-sm bg-slate-800 p-3 rounded">
                                                    <p><strong>Data:</strong> {formatarData(p.dataPagamento)} | <strong>Tipo:</strong> {p.tipoPagamento}</p>
                                                    <p className="text-xs text-slate-400">Total c/ Desc: R$ {p.totalComDesconto?.toFixed(2)} ({p.totalParcelas}x R$ {p.valorParcelas?.toFixed(2)})</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-slate-400 text-sm">Nenhum pagamento encontrado.</p>}
                                </section>
                            </div>

                            {/* Coluna Direita */}
                            <div className="space-y-6">
                                {/* --- Card Gráfico --- */}
                                <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                                    <h2 className="flex items-center text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-2 gap-2">
                                        <BarChart3 size={24}/> Volume de Agendamentos
                                    </h2>
                                    <div className="relative h-24">
                                        {(relatorioData.totalAgendamentos ?? 0) > 0 ? (
                                            <Bar options={chartOptions} data={chartData} />
                                        ) : (
                                            <p className="text-slate-400 text-sm text-center flex items-center justify-center h-full">Sem dados de agendamento para exibir gráfico.</p>
                                        )}
                                    </div>
                                </section>

                                {/* --- Card Histórico Agendamentos --- */}
                                <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                                    <h2 className="flex items-center text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-2 gap-2">
                                        <CalendarClock size={24}/> Histórico Agendamentos ({relatorioData.agendamentos?.length ?? 0})
                                    </h2>
                                    {relatorioData.agendamentos && relatorioData.agendamentos.length > 0 ? (
                                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                            {relatorioData.agendamentos.map(a => (
                                                <div key={`ag-${a.id}`} className="border-l-4 border-sky-500 pl-3 text-sm bg-slate-800 p-3 rounded">
                                                    <p><strong>Data:</strong> {a.dataAgendamento} (Veículo: {a.veiculoPlaca || 'N/I'})</p>
                                                    <p className="text-slate-300 mt-1 text-xs"><em>Obs:</em> {a.observacao || '-'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-slate-400 text-sm">Nenhum agendamento encontrado.</p>}
                                </section>

                                {/* --- Card Serviços / Oficina --- */}
                                <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                                    <h2 className="flex items-center text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-2 gap-2">
                                        <Wrench size={24}/> Serviços Realizados ({relatorioData.servicosOficina?.length ?? 0})
                                    </h2>
                                    {relatorioData.servicosOficina && relatorioData.servicosOficina.length > 0 ? (
                                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                            {relatorioData.servicosOficina.map(s => (
                                                <div key={`sv-${s.idOficina}`} className="border-l-4 border-sky-500 pl-3 text-sm bg-slate-800 p-3 rounded">
                                                    <p><strong>Data:</strong> {formatarData(s.dataOficina)} (Veículo: {s.veiculoPlaca || 'N/I'})</p>
                                                    <p><strong>Problema:</strong> {s.descricaoProblema || '-'}</p>
                                                    <p><strong>Diagnóstico:</strong> {s.diagnostico || '-'}</p>
                                                    <p className="text-xs text-slate-400">Partes: {s.partesAfetadas || '-'} | Horas: {s.horasTrabalhadas || '-'}</p>
                                                    {s.pecasUtilizadas && s.pecasUtilizadas.length > 0 && (
                                                        <div className="mt-2 pt-2 border-t border-slate-700">
                                                            <p className="font-semibold text-xs text-slate-400 mb-1 flex items-center gap-1"><MdPrecisionManufacturing size={14}/> Peças:</p>
                                                            <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                                                                {s.pecasUtilizadas.map(p => (
                                                                    <li key={p.idPeca}>{p.descricaoPeca} ({p.fabricante})</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-slate-400 text-sm">Nenhum serviço encontrado.</p>}
                                </section>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}