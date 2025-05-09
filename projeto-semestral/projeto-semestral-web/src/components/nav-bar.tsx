// src/components/nav-bar.tsx
"use client";

import Link from 'next/link';
import { useState } from 'react';
import {
    MdHome, MdPeople, MdDirectionsCar, MdBuild, MdSchedule, MdBarChart,
    MdPayment, MdContactMail, MdList, MdAddCircleOutline, MdSearch,
    MdDescription, MdEventNote, MdTrendingUp, MdPersonSearch, MdAssessment
} from 'react-icons/md';
import { ListChecks, Package } from 'lucide-react';

interface NavBarProps {
    active:
        | "inicio"
        | "clientes" | "clientes-listar" | "clientes-cadastrar" | "clientes-buscar" | "clientes-alterar" | "clientes-deletar"
        | "veiculo" | "veiculo-listar" | "veiculo-cadastrar" | "veiculo-buscar" | "veiculo-alterar" | "veiculo-deletar"
        | "oficinaOnline" | "oficinaOnline-listar" | "oficinaOnline-cadastrar" | "oficinaOnline-buscar" | "oficinaOnline-alterar" | "oficinaOnline-deletar"
        | "agendamento" | "agendamento-listar" | "agendamento-cadastrar" | "agendamento-buscar" | "agendamento-alterar" | "agendamento-deletar"
        | "orcamento" | "orcamento-listar" | "orcamento-gerar" | "orcamento-buscar" | "orcamento-alterar" | "orcamento-deletar" | "orcamento-iniciar" // Adicionado orcamento-iniciar
        | "pecas" | "pecas-listar" | "pecas-cadastrar" | "pecas-buscar" | "pecas-alterar" | "pecas-deletar"
        | "pagamento" | "pagamento-listar" | "pagamento-cadastrar" | "pagamento-buscar" | "pagamento-alterar" | "pagamento-deletar"
        | "relatorio" | "relatorio-agendamentos-futuros" | "relatorio-contagem-mensal" | "relatorio-historico-cliente"
        | "relatorio-cliente-completo" | "relatorio-servicos-agendados"
        | "relatorio-financeiro-pagamentos"
        | "contato";
}

type OpenMenuType = null | 'clientes' | 'veiculo' | 'oficina' | 'agendamento' | 'orcamento' | 'pecas' | 'pagamento' | 'relatorio';

export default function NavBar({ active }: NavBarProps) {
    const baseLinkClass = "flex items-center px-1 pb-1 transition-colors duration-200 ease-in-out";
    const activeLinkClass = "text-sky-100 font-semibold border-b-2 border-sky-300";
    const inactiveLinkClass = "text-slate-300 hover:text-sky-200";
    const [openMenu, setOpenMenu] = useState<OpenMenuType>(null);

    const toggleMenu = (menu: OpenMenuType) => {
        setOpenMenu(current => (current === menu ? null : menu));
    };

    const getItemClass = (section: string): string => {
        // Ajusta para marcar o menu pai como ativo se uma subpágina estiver ativa
        const baseSection = section.split('-')[0];
        const activeBase = active.split('-')[0];
        if (activeBase === baseSection) {
            return `${baseLinkClass} ${activeLinkClass}`;
        }
        // Verificação específica para o link direto que queremos inativo se uma subpágina estiver ativa
        if (section === active) {
            return `${baseLinkClass} ${activeLinkClass}`;
        }

        return `${baseLinkClass} ${inactiveLinkClass}`;
    };

    return (
        <nav className="flex justify-between items-center p-4 md:p-6 bg-gradient-to-r from-[#075985] to-[#012A46] text-white shadow-md relative z-50">
            <Link href="/inicio" onClick={() => setOpenMenu(null)}>
                <h1 className="flex items-center text-xl md:text-2xl font-bold cursor-pointer hover:text-sky-200 transition-colors">
                    <MdBuild className="inline-block mr-2 text-2xl" />
                    Oficina On-line
                </h1>
            </Link>

            <ul className="flex flex-wrap gap-3 md:gap-5 text-sm md:text-base items-center">
                {/* Início */}
                <li><Link href="/inicio" className={getItemClass("inicio")} onClick={() => setOpenMenu(null)}><MdHome className="mr-1" /> Início</Link></li>

                {/* Clientes */}
                <li className="relative">
                    <button type="button" onClick={() => toggleMenu('clientes')} className={`${getItemClass("clientes")} cursor-pointer`}><MdPeople className="mr-1" /> Clientes</button>
                    {openMenu === 'clientes' && ( <ul className="absolute left-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 animate-fade-in-down z-10"> <li><Link href="/clientes/listar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdList />Listar</Link></li> <li><Link href="/clientes/cadastrar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdAddCircleOutline/>Cadastrar</Link></li> <li><Link href="/clientes/buscar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdSearch/>Buscar</Link></li> </ul> )}
                </li>

                {/* Veículo */}
                <li className="relative">
                    <button type="button" onClick={() => toggleMenu('veiculo')} className={`${getItemClass("veiculo")} cursor-pointer`}><MdDirectionsCar className="mr-1" /> Veículo</button>
                    {openMenu === 'veiculo' && ( <ul className="absolute left-0 mt-2 w-52 bg-slate-700 rounded-md shadow-lg py-1 animate-fade-in-down z-10"> <li><Link href="/veiculo/listar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdList />Listar</Link></li> <li><Link href="/veiculo/cadastrar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdAddCircleOutline/>Cadastrar</Link></li> <li><Link href="/veiculo/buscar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdSearch/>Buscar</Link></li> </ul> )}
                </li>

                {/* Oficina Online */}
                <li className="relative">
                    <button type="button" onClick={() => toggleMenu('oficina')} className={`${getItemClass("oficinaOnline")} cursor-pointer`}><MdBuild className="mr-1" /> Oficina On-line</button>
                    {openMenu === 'oficina' && ( <ul className="absolute left-0 mt-2 w-52 bg-slate-700 rounded-md shadow-lg py-1 animate-fade-in-down z-10"> <li><Link href="/oficinaOnline/listar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdList />Listar</Link></li> <li><Link href="/oficinaOnline/cadastrar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdAddCircleOutline/>Novo Diag.</Link></li> <li><Link href="/oficinaOnline/buscar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdSearch/>Buscar</Link></li> </ul> )}
                </li>

                {/* Peças */}
                <li className="relative">
                    <button type="button" onClick={() => toggleMenu('pecas')} className={`${getItemClass("pecas")} cursor-pointer`}>
                        <Package className="mr-1" /> Peças
                    </button>
                    {openMenu === 'pecas' && (
                        <ul className="absolute left-0 mt-2 w-52 bg-slate-700 rounded-md shadow-lg py-1 animate-fade-in-down z-10">
                            <li><Link href="/pecas/listar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdList />Listar</Link></li>
                            <li><Link href="/pecas/cadastrar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdAddCircleOutline/>Cadastrar</Link></li>
                            <li><Link href="/pecas/buscar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdSearch/>Buscar</Link></li>
                        </ul>
                    )}
                </li>

                {/* Agendamento */}
                <li className="relative">
                    <button type="button" onClick={() => toggleMenu('agendamento')} className={`${getItemClass("agendamento")} cursor-pointer`}><MdSchedule className="mr-1" /> Agendamento</button>
                    {openMenu === 'agendamento' && ( <ul className="absolute left-0 mt-2 w-52 bg-slate-700 rounded-md shadow-lg py-1 animate-fade-in-down z-10"> <li><Link href="/agendamento/listar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdList />Listar</Link></li> <li><Link href="/agendamento/cadastrar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdAddCircleOutline/>Novo</Link></li> <li><Link href="/agendamento/buscar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdSearch/>Buscar</Link></li> </ul> )}
                </li>

                {/* Orçamento */}
                <li className="relative">
                    <button type="button" onClick={() => toggleMenu('orcamento')} className={`${getItemClass("orcamento")} cursor-pointer`}>
                        <MdDescription className="mr-1" /> Orçamento
                    </button>
                    {openMenu === 'orcamento' && (
                        <ul className="absolute left-0 mt-2 w-56 bg-slate-700 rounded-md shadow-lg py-1 animate-fade-in-down z-10">
                            <li><Link href="/orcamento/listar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdList /> Listar Orçamentos</Link></li>
                            {/* ----- ALTERAÇÃO AQUI ----- */}
                            <li><Link href="/orcamento/iniciar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><ListChecks /> Gerar Orçamento</Link></li>
                            {/* -------------------------- */}
                            <li><Link href="/orcamento/buscar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdSearch /> Buscar Orçamento</Link></li>
                        </ul>
                    )}
                </li>

                {/* Pagamento */}
                <li className="relative">
                    <button type="button" onClick={() => toggleMenu('pagamento')} className={`${getItemClass("pagamento")} cursor-pointer`}>
                        <MdPayment className="mr-1" /> Pagamento
                    </button>
                    {openMenu === 'pagamento' && (
                        <ul className="absolute left-0 mt-2 w-56 bg-slate-700 rounded-md shadow-lg py-1 animate-fade-in-down z-10">
                            <li><Link href="/pagamento/listar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdList /> Listar Registros</Link></li>
                            <li><Link href="/pagamento/cadastrar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdAddCircleOutline /> Registrar Pagamento</Link></li>
                            <li><Link href="/pagamento/buscar" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdSearch /> Buscar Pagamento</Link></li>
                        </ul>
                    )}
                </li>

                {/* Relatório */}
                <li className="relative">
                    <button type="button" onClick={() => toggleMenu('relatorio')} className={`${getItemClass("relatorio")} cursor-pointer`}><MdBarChart className="mr-1" /> Relatório</button>
                    {openMenu === 'relatorio' && (
                        <ul className="absolute right-0 sm:left-auto mt-2 w-64 bg-slate-700 rounded-md shadow-lg py-1 animate-fade-in-down z-10">
                            <li><Link href="/relatorio/agendamentos-futuros" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdEventNote /> Agendamentos Futuros</Link></li>
                            <li><Link href="/relatorio/contagem-mensal" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdTrendingUp /> Contagem Mensal</Link></li>
                            <li><Link href="/relatorio/historico-cliente" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdPersonSearch /> Histórico Cliente</Link></li>
                            <li><Link href="/relatorio/servicos-agendados" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdEventNote /> Serviços Agendados</Link></li>
                            <li><Link href="/relatorio/cliente-completo" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdPersonSearch /> Cliente Completo</Link></li>
                            <li><Link href="/relatorio/financeiro-pagamentos" className="flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors" onClick={() => setOpenMenu(null)}><MdAssessment /> Financeiro Pagamentos</Link></li>
                        </ul>
                    )}
                </li>

                {/* Contato */}
                <li><Link href="/contato" className={getItemClass("contato")} onClick={() => setOpenMenu(null)}><MdContactMail className="mr-1" /> Contato</Link></li>
            </ul>

            <img
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-sky-200"
                src="https://avatars.githubusercontent.com/u/4350623?v=4" // Seu avatar
                alt="Avatar do usuário"
            />

            {/* Animação do Menu Dropdown */}
            <style jsx>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.2s ease-out forwards; }
            `}</style>
        </nav>
    );
}