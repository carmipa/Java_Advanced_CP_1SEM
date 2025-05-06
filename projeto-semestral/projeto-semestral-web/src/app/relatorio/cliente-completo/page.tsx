// app/relatorio/cliente-completo/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import NavBar from '@/components/nav-bar';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title as ChartTitle, Tooltip, Legend
} from 'chart.js';

// --- Ícones Lucide ---
import {
    Search, UserCircle, Info, Briefcase, PhoneCall, Mail, MapPin, Car, Hash,
    Building, Palette, Calendar, Settings, BarChart3, CalendarClock, CalendarDays,
    ClipboardList, Wrench, Stethoscope, Puzzle, FileText, DollarSign,
    ListChecks, ScanSearch, AlertCircle, Loader2, ListX
} from 'lucide-react';
import { MdErrorOutline, MdBadge } from 'react-icons/md';

// --- Registrar Chart.js ---
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

// --- Interfaces (COM ENDEREÇO CORRIGIDO) ---
interface EnderecoDto { codigo?: number; numero?: number; cep?: string; logradouro?: string; localidade?: string; bairro?: string; uf?: string; complemento?: string | null; }
interface ContatoDto { codigo?: number; celular?: string; email?: string; contato?: string; }
interface ClienteResponseDto { idCli: number; nome?: string; sobrenome?: string; tipoCliente?: string; numeroDocumento?: string; sexo?: string; dataNascimento?: string; atividadeProfissional?: string; endereco?: EnderecoDto | null; contato?: ContatoDto | null; }
interface VeiculoResponseDto { id: number; tipoVeiculo?: string; renavam?: string; placa?: string; modelo?: string; proprietario?: string; montadora?: string; cor?: string; motor?: string; anoFabricacao?: string; }
interface AgendaSimplificadoDTO { id: number; dataAgendamento?: string | null; observacao?: string | null; veiculoPlaca?: string | null; }
interface PecaUtilizadaDTO { idPeca: number; descricaoPeca?: string; fabricante?: string; }
interface OficinaServicoDTO { idOficina: number; dataOficina?: string | null; descricaoProblema?: string | null; diagnostico?: string | null; partesAfetadas?: string | null; horasTrabalhadas?: string | null; veiculoPlaca?: string | null; pecasUtilizadas?: PecaUtilizadaDTO[]; }
interface OrcamentoResponseDto { id: number; dataOrcamento?: string | null; maoDeObra?: number; valorHora?: number; quantidadeHoras?: number; valorTotal?: number; }
interface PagamentoResponseDto { id: number; dataPagamento?: string | null; tipoPagamento?: string; desconto?: number; totalParcelas?: string; valorParcelas?: number; totalComDesconto?: number; }
interface ClienteRelatorioCompletoDTO { cliente?: ClienteResponseDto | null; veiculos?: VeiculoResponseDto[]; agendamentos?: AgendaSimplificadoDTO[]; servicosOficina?: OficinaServicoDTO[]; orcamentos?: OrcamentoResponseDto[]; pagamentos?: PagamentoResponseDto[]; totalAgendamentos?: number; }
// ----------------------------------------------------------------------

type TipoBuscaRelatorio = 'id' | 'documento';

// Helper para formatar data DD/MM/YYYY
const formatarData = (dataString: string | null | undefined): string => { /* ...código formatarData... */
    if (!dataString) return '-';
    try { return new Date(dataString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }); }
    catch (e) { console.error("Erro formatar data:", dataString, e); return 'Inválida'; }
};

// Helper para extrair apenas o ano
const extrairAno = (dataString: string | null | undefined): string => { /* ...código extrairAno... */
    if (!dataString) return '-';
    try {
        if (dataString.length >= 4 && /^\d{4}/.test(dataString)) {
            return dataString.substring(0, 4);
        }
        return new Date(dataString + 'T00:00:00Z').getFullYear().toString();
    } catch (e) {
        console.error("Erro ao extrair ano:", dataString, e);
        return 'Inválido';
    }
};

// Helper para tratar erro fetch
const tratarErroFetch = (err: any): string => { /* ...código tratarErroFetch... */
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
        return "Não foi possível conectar ao servidor. Verifique a API e a rede.";
    }
    if (err.message && (err.message.startsWith("Erro HTTP") || err.message.includes("inválido") || err.message.includes("não encontrado"))) {
        return err.message;
    }
    if (err.message) {
        return err.message;
    }
    return "Ocorreu um erro desconhecido.";
};

export default function RelatorioCompletoClientePage() {
    const [tipoBusca, setTipoBusca] = useState<TipoBuscaRelatorio>('documento');
    const [valorBusca, setValorBusca] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [relatorioData, setRelatorioData] = useState<ClienteRelatorioCompletoDTO | null>(null);
    const [buscaRealizada, setBuscaRealizada] = useState(false);

    const handleSearch = async (e: FormEvent) => { /* ...código handleSearch... */
        e.preventDefault();
        setIsLoading(true); setError(null); setRelatorioData(null); setBuscaRealizada(true);
        if (!valorBusca.trim()) { setError("Por favor, insira um valor para busca."); setIsLoading(false); return; }
        const params = new URLSearchParams({ tipoBusca, valorBusca: valorBusca.trim() });
        const apiUrl = `http://localhost:8080/rest/relatorios/cliente/completo?${params}`;
        console.info("Buscando relatório completo:", apiUrl);
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                if (response.status === 404) throw new Error("Cliente não encontrado.");
                if (response.status === 400) { const errData = await response.json().catch(()=>({message:"Tipo ou valor de busca inválido."})); throw new Error(errData.message || "Tipo ou valor de busca inválido."); }
                if (response.status === 204) throw new Error("Cliente não encontrado (resposta sem conteúdo).");
                let errorMsg = `Erro HTTP ${response.status}`;
                try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (jsonError) { errorMsg = `${errorMsg}: ${response.statusText || 'Erro desconhecido'}`; }
                throw new Error(errorMsg);
            }
            const data: ClienteRelatorioCompletoDTO = await response.json();
            if (!data || typeof data !== 'object') throw new Error("Resposta da API inválida ou vazia.");
            if (!data.cliente) console.warn("API retornou dados sem informações do cliente.");
            setRelatorioData(data);
        } catch (err: any) { setError(tratarErroFetch(err)); setRelatorioData(null); } finally { setIsLoading(false); }
    };

    // --- Configuração do Gráfico ---
    const backgroundColors = [ /* ... cores ... */
        'rgba(54, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(255, 206, 86, 0.7)',
        'rgba(153, 102, 255, 0.7)','rgba(255, 159, 64, 0.7)','rgba(255, 99, 132, 0.7)'
    ];
    const borderColors = backgroundColors.map(color => color.replace(/0\.7/, '1'));
    const corIndex = 0;
    const chartData = { /* ...código chartData... */
        labels: ['Agendamentos'],
        datasets: [{
            label: 'Nº de Agendamentos',
            data: [relatorioData?.totalAgendamentos ?? 0],
            backgroundColor: [backgroundColors[corIndex % backgroundColors.length]],
            borderColor: [borderColors[corIndex % borderColors.length]],
            borderWidth: 1, barThickness: 60, maxBarThickness: 80
        }],
    };
    const chartOptions = { /* ...código chartOptions... */
        indexAxis: 'y' as const, responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: true, text: 'Total de Agendamentos Registrados', color: '#e2e8f0', font: {size: 14} }, },
        scales: { x: { beginAtZero: true, ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: 'rgba(100, 116, 139, 0.2)' } }, y: { ticks: { color: '#94a3b8' }, grid: { display: false } } },
    };
    // ---------------------------------

    return (
        <>
            <NavBar active="relatorio-cliente-completo"/>
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Título */}
                <h1 className="flex items-center justify-center text-2xl md:text-3xl font-bold mb-8 text-center gap-2">
                    <UserCircle size={32} className="text-sky-400"/> Visão 360º do Cliente
                </h1>

                {/* Formulário de Busca */}
                <div className="bg-slate-800 p-4 md:p-6 rounded-lg shadow-lg max-w-3xl mx-auto mb-8 border border-slate-700">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
                        {/* ... (código do formulário de busca) ... */}
                        <div className="flex-shrink-0 w-full sm:w-auto"> <label htmlFor="tipoBusca" className="block text-sm font-medium mb-1 text-slate-300">Buscar por:</label> <select id="tipoBusca" value={tipoBusca} onChange={(e) => setTipoBusca(e.target.value as TipoBuscaRelatorio)} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"> <option value="documento">Documento</option> <option value="id">Código Cliente</option> </select> </div> <div className="flex-grow w-full"> <label htmlFor="valorBusca" className="block text-sm font-medium mb-1 text-slate-300">Valor:</label> <input id="valorBusca" type={tipoBusca === 'id' ? 'number' : 'text'} value={valorBusca} onChange={(e) => setValorBusca(e.target.value)} required placeholder={tipoBusca === 'id' ? 'Digite o código...' : 'Digite o CPF ou CNPJ...'} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"/> </div> <button type="submit" disabled={isLoading} className={`flex-shrink-0 w-full sm:w-auto h-10 px-5 py-2 rounded text-white flex items-center justify-center font-semibold whitespace-nowrap transition-opacity ${isLoading ? 'bg-sky-800 cursor-not-allowed opacity-70' : 'bg-sky-600 hover:bg-sky-700'}`}> <Search className="mr-2" size={18}/> {isLoading ? 'Buscando...' : 'Gerar Relatório'} </button>
                    </form>
                </div>

                {/* Mensagem de Erro */}
                {error && ( <div className="relative max-w-3xl mx-auto mb-6 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert"> <MdErrorOutline className="inline mr-2" /> {error} <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"> <span className="text-xl" aria-hidden="true">&times;</span> </button> </div> )}

                {/* Loading */}
                {isLoading && <div className='flex justify-center items-center py-10'><Loader2 className="h-8 w-8 animate-spin text-sky-400" /><span className='ml-3 text-sky-300'>Carregando relatório...</span></div>}

                {/* Mensagem Nenhum Cliente Encontrado */}
                {!isLoading && !relatorioData && buscaRealizada && !error && ( <div className="text-center text-slate-400 mt-10 bg-slate-800/50 p-6 rounded-lg max-w-md mx-auto border border-slate-700"> <ListX size={40} className="mx-auto mb-4 text-slate-500" /> <p>Nenhum cliente encontrado para os critérios informados.</p> </div> )}

                {/* Conteúdo do Relatório */}
                {!isLoading && relatorioData && (
                    <div className="space-y-6">

                        {/* --- Card Dados do Cliente --- */}
                        {relatorioData.cliente && (
                            <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                                <h2 className="flex items-center text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-2 gap-2">
                                    <UserCircle size={24}/> Dados do Cliente
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                                    {/* ... (dados do cliente como antes) ... */}
                                    <span className="flex items-center gap-2"><Info size={16} className="text-slate-500 flex-shrink-0"/><strong>Nome:</strong> <span className='truncate' title={`${relatorioData.cliente.nome} ${relatorioData.cliente.sobrenome}`}>{relatorioData.cliente.nome} {relatorioData.cliente.sobrenome}</span></span> <span className="flex items-center gap-2"><MdBadge className="text-slate-500 flex-shrink-0"/><strong>Doc:</strong> {relatorioData.cliente.numeroDocumento} ({relatorioData.cliente.tipoDocumento})</span> <span className="flex items-center gap-2"><Info size={16} className="text-slate-500 flex-shrink-0"/><strong>Tipo:</strong> {relatorioData.cliente.tipoCliente === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span> <span className="flex items-center gap-2"><Calendar size={16} className="text-slate-500 flex-shrink-0"/><strong>Nasc:</strong> {formatarData(relatorioData.cliente.dataNascimento)}</span> <span className="flex items-center gap-2"><Info size={16} className="text-slate-500 flex-shrink-0"/><strong>Sexo:</strong> {relatorioData.cliente.sexo || '-'}</span> <span className="flex items-center gap-2"><Briefcase size={16} className="text-slate-500 flex-shrink-0"/><strong>Profissão:</strong> <span className='truncate' title={relatorioData.cliente.atividadeProfissional}>{relatorioData.cliente.atividadeProfissional || '-'}</span></span> <span className="flex items-center gap-2"><PhoneCall size={16} className="text-slate-500 flex-shrink-0"/><strong>Celular:</strong> {relatorioData.cliente.contato?.celular || '-'}</span> <span className="flex items-center gap-2 lg:col-span-2"><Mail size={16} className="text-slate-500 flex-shrink-0"/><strong>Email:</strong> <span className='truncate' title={relatorioData.cliente.contato?.email}>{relatorioData.cliente.contato?.email || '-'}</span></span>

                                    {/* <<< ENDEREÇO CORRIGIDO E REFORMATADO >>> */}
                                    <div className="flex items-start gap-2 col-span-1 sm:col-span-2 lg:col-span-3 mt-2 pt-3 border-t border-slate-700/50">
                                        <MapPin size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm space-y-1">
                                            <p className="text-slate-200"> {relatorioData.cliente.endereco?.logradouro || 'Logradouro não informado'}, {relatorioData.cliente.endereco?.numero || 'S/N'} {relatorioData.cliente.endereco?.complemento ? <span className="text-slate-400 text-xs"> ({relatorioData.cliente.endereco.complemento})</span> : ''} </p>
                                            <p className="text-slate-300"> Bairro: {relatorioData.cliente.endereco?.bairro || '-'} </p>
                                            <p className="text-slate-300"> {relatorioData.cliente.endereco?.localidade || 'Cidade não informada'} / {relatorioData.cliente.endereco?.uf || '--'} </p>
                                            <p className="text-slate-400 text-xs"> CEP: {relatorioData.cliente.endereco?.cep || '-'} </p>
                                        </div>
                                    </div>
                                    {/* <<< FIM ENDEREÇO >>> */}
                                </div>
                            </section>
                        )}

                        {/* --- Layout em Colunas --- */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Coluna Esquerda */}
                            <div className="space-y-6">

                                {/* --- Card Veículos (REFATORADO v2) --- */}
                                <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                                    <h2 className="flex items-center text-lg font-semibold mb-3 text-sky-400 border-b border-slate-700 pb-2 gap-2">
                                        <Car size={20}/> Veículos ({relatorioData.veiculos?.length ?? 0})
                                    </h2>
                                    {relatorioData.veiculos && relatorioData.veiculos.length > 0 ? (
                                        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                                            {relatorioData.veiculos.map(v => (
                                                <div key={v.id} className="bg-slate-800/60 p-3 rounded border border-slate-600 text-xs hover:border-sky-500 transition-colors duration-150">
                                                    {/* Linha 1: Modelo, Montadora, Tipo */}
                                                    <div className='flex flex-wrap justify-between items-start mb-2 gap-x-3'>
                                                        <p className='font-semibold text-sm text-slate-100 truncate flex-grow basis-2/3' title={`${v.modelo} (${v.montadora})`}>
                                                            <Info size={14} className="inline -mt-1 mr-1 text-slate-400"/> {v.modelo || '-'} <span className='text-slate-400 font-normal'>({v.montadora || 'N/I'})</span>
                                                        </p>
                                                        <p className="text-slate-300 flex items-center gap-1 flex-shrink-0 text-xs uppercase font-medium tracking-wider">
                                                            <ListChecks size={14} className="text-slate-400" /> {v.tipoVeiculo || '-'}
                                                        </p>
                                                    </div>
                                                    {/* Linha 2: Placa e Renavam */}
                                                    <div className="flex flex-wrap justify-between items-center gap-x-4 mb-2">
                                                        <p className="flex items-center gap-1">
                                                            <MdBadge className="text-slate-400"/> <strong>Placa:</strong> <span className="ml-1 font-mono bg-slate-600 px-1.5 py-0.5 rounded text-sky-300">{v.placa || '-'}</span> </p>
                                                        <p className="flex items-center gap-1 text-slate-400"> <Hash size={12} /> <strong>Renavam:</strong> <span className='ml-1'>{v.renavam || '-'}</span> </p>
                                                    </div>
                                                    {/* Linha 3: Cor, Ano, Motor */}
                                                    <div className="grid grid-cols-3 gap-x-2 items-center border-t border-slate-700/50 pt-2 mt-2 text-slate-300">
                                                        <p className="flex items-center gap-1 truncate" title={`Cor: ${v.cor}`}> <Palette size={12} className="text-slate-400 flex-shrink-0"/> <span className="text-slate-400 mr-1">Cor:</span> <span className='truncate'>{v.cor || '-'}</span> </p>
                                                        <p className="flex items-center gap-1"> <Calendar size={12} className="text-slate-400 flex-shrink-0"/> <span className="text-slate-400 mr-1">Ano:</span> <span className='truncate'>{extrairAno(v.anoFabricacao)}</span> </p>
                                                        <p className="flex items-center gap-1 truncate" title={`Motor: ${v.motor}`}> <Settings size={12} className="text-slate-400 flex-shrink-0"/> <span className="text-slate-400 mr-1">Motor:</span> <span className='truncate'>{v.motor || '-'}</span> </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-slate-400 text-sm">Nenhum veículo encontrado.</p>}
                                </section>
                                {/* --- Fim Card Veículos --- */}

                                {/* --- Card Orçamentos --- */}
                                <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                                    <h2 className="flex items-center text-lg font-semibold mb-3 text-sky-400 border-b border-slate-700 pb-2 gap-2"> <FileText size={20}/> Orçamentos ({relatorioData.orcamentos?.length ?? 0}) </h2>
                                    {/* ... (código interno orçamento) ... */}
                                    {relatorioData.orcamentos && relatorioData.orcamentos.length > 0 ? ( <div className="space-y-2 max-h-60 overflow-y-auto pr-2"> {relatorioData.orcamentos.map(o => ( <div key={o.id} className="border-l-4 border-sky-600 pl-3 text-xs bg-slate-800/50 p-2 rounded"> <p className='flex justify-between items-center'> <span><strong>Data:</strong> {formatarData(o.dataOrcamento)}</span> <span className='font-bold text-base text-sky-300'>R$ {o.valorTotal?.toFixed(2) ?? '-'}</span> </p> <p className="text-slate-400">M.O: R$ {o.maoDeObra?.toFixed(2) ?? '-'} ({o.quantidadeHoras ?? '-'}h @ R$ {o.valorHora?.toFixed(2) ?? '-'}/h)</p> </div> ))} </div> ) : <p className="text-slate-400 text-sm">Nenhum orçamento encontrado.</p>}
                                </section>

                                {/* --- Card Pagamentos --- */}
                                <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                                    <h2 className="flex items-center text-lg font-semibold mb-3 text-sky-400 border-b border-slate-700 pb-2 gap-2"> <DollarSign size={20}/> Pagamentos ({relatorioData.pagamentos?.length ?? 0}) </h2>
                                    {/* ... (código interno pagamento) ... */}
                                    {relatorioData.pagamentos && relatorioData.pagamentos.length > 0 ? ( <div className="space-y-2 max-h-60 overflow-y-auto pr-2"> {relatorioData.pagamentos.map(p => ( <div key={p.id} className="border-l-4 border-green-600 pl-3 text-xs bg-slate-800/50 p-2 rounded"> <p className='flex justify-between items-center'> <span><strong>Data:</strong> {formatarData(p.dataPagamento)}</span> <span className='font-semibold text-green-400'>R$ {p.totalComDesconto?.toFixed(2) ?? '-'}</span> </p> <p className="text-slate-400">Tipo: {p.tipoPagamento} | {p.totalParcelas}x R$ {p.valorParcelas?.toFixed(2) ?? '-'} (Desc: R$ {p.desconto?.toFixed(2) ?? '-'})</p> </div> ))} </div> ) : <p className="text-slate-400 text-sm">Nenhum pagamento encontrado.</p>}
                                </section>
                            </div>

                            {/* Coluna Direita */}
                            <div className="space-y-6">
                                {/* --- Card Gráfico --- */}
                                <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                                    <h2 className="flex items-center text-lg font-semibold mb-3 text-sky-400 border-b border-slate-700 pb-2 gap-2"> <BarChart3 size={20}/> Volume Total de Agendamentos </h2>
                                    <div className="relative h-24"> {(relatorioData.totalAgendamentos ?? 0) > 0 ? ( <Bar options={chartOptions} data={chartData} /> ) : ( <p className="text-slate-400 text-xs text-center flex items-center justify-center h-full">Sem dados para exibir gráfico.</p> )} </div>
                                </section>

                                {/* --- Card Histórico Agendamentos --- */}
                                <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                                    <h2 className="flex items-center text-lg font-semibold mb-3 text-sky-400 border-b border-slate-700 pb-2 gap-2"> <CalendarClock size={20}/> Histórico Agendamentos ({relatorioData.agendamentos?.length ?? 0}) </h2>
                                    {/* ... (código interno histórico) ... */}
                                    {relatorioData.agendamentos && relatorioData.agendamentos.length > 0 ? ( <div className="space-y-3 max-h-96 overflow-y-auto pr-2"> {relatorioData.agendamentos.map(a => ( <div key={`ag-${a.id}`} className="bg-slate-800/50 p-3 rounded border border-slate-700 text-xs hover:border-sky-600 transition-colors"> <div className="flex justify-between items-center mb-1"> <span className="flex items-center gap-1 font-semibold text-sky-300"><CalendarDays size={14}/> {formatarData(a.dataAgendamento)}</span> <span className="font-mono bg-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1"><Car size={14}/> {a.veiculoPlaca || 'N/I'}</span> </div> <p className="text-slate-300"><strong className='text-slate-400'>Obs:</strong> {a.observacao || '-'}</p> </div> ))} </div> ) : <p className="text-slate-400 text-sm">Nenhum agendamento encontrado.</p>}
                                </section>

                                {/* --- Card Serviços / Oficina --- */}
                                <section className="bg-slate-900 p-4 md:p-6 rounded-lg shadow-lg border border-slate-700">
                                    <h2 className="flex items-center text-lg font-semibold mb-3 text-sky-400 border-b border-slate-700 pb-2 gap-2"> <Wrench size={20}/> Serviços Realizados ({relatorioData.servicosOficina?.length ?? 0}) </h2>
                                    {/* ... (código interno serviços) ... */}
                                    {relatorioData.servicosOficina && relatorioData.servicosOficina.length > 0 ? ( <div className="space-y-3 max-h-96 overflow-y-auto pr-2"> {relatorioData.servicosOficina.map(s => ( <div key={`sv-${s.idOficina}`} className="bg-slate-800/50 p-3 rounded border border-slate-700 text-xs hover:border-teal-600 transition-colors"> <div className="flex justify-between items-center mb-1"> <span className="flex items-center gap-1 font-semibold text-sky-300"><CalendarDays size={14}/> {formatarData(s.dataOficina)}</span> <span className="font-mono bg-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1"><Car size={14}/> {s.veiculoPlaca || 'N/I'}</span> </div> <p className="text-slate-300 mb-0.5"><strong>Problema:</strong> {s.descricaoProblema || '-'}</p> <p className="text-slate-300"><strong>Diagnóstico:</strong> {s.diagnostico || '-'}</p> <p className="text-slate-400 mt-1">Partes: {s.partesAfetadas || '-'} | Horas: {s.horasTrabalhadas || '-'}</p> {s.pecasUtilizadas && s.pecasUtilizadas.length > 0 && ( <div className="mt-2 pt-2 border-t border-slate-600/50"> <p className="font-semibold text-slate-400 mb-1 flex items-center gap-1"><Puzzle size={14}/> Peças:</p> <ul className="list-disc list-inside text-slate-300 space-y-0.5 pl-4"> {s.pecasUtilizadas.map(p => ( <li key={p.idPeca}>{p.descricaoPeca} ({p.fabricante})</li> ))} </ul> </div> )} </div> ))} </div> ) : <p className="text-slate-400 text-sm">Nenhum serviço encontrado.</p>}
                                </section>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mensagem inicial */}
                {!isLoading && !relatorioData && !buscaRealizada && !error && (
                    <div className="text-center text-slate-400 mt-10 bg-slate-800/50 p-6 rounded-lg max-w-md mx-auto border border-slate-700">
                        <Search size={40} className="mx-auto mb-4 text-sky-500" />
                        <p>Utilize a busca acima para gerar o relatório completo de um cliente.</p>
                    </div>
                )}

            </main>
        </>
    );
}