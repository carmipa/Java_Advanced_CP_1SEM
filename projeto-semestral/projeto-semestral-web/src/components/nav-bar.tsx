// src/components/nav-bar.tsx
"use client";

import Link from 'next/link';
import { useState } from 'react';
// Importar ícones do react-icons
import {
    MdHome,
    MdPeople,
    MdDirectionsCar,
    MdBuild,
    MdSchedule,
    MdBarChart,
    MdPayment,
    MdContactMail
} from 'react-icons/md';

interface NavBarProps {
    active:
        | "inicio"
        | "clientes"
        | "cadastrar"
        | "oficinaOnline"
        | "agendamento"
        | "veiculo"
        | "veiculo-listar"
        | "veiculo-cadastrar"
        | "veiculo-buscar"
        | "veiculo-alterar"
        | "veiculo-deletar"
        | "relatorio"
        | "pagamento"
        | "contato"
        | "relatorio-agendamentos-futuros"
        | "relatorio-contagem-mensal"
        | "relatorio-historico-cliente"
        | "relatorio-cliente-completo"
        | "relatorio-servicos-agendados";

}

type OpenMenuType = null | 'clientes' | 'veiculo' | 'oficina' | 'agendamento' | 'relatorio';

export default function NavBar({ active }: NavBarProps) {
    const baseLinkClass = "flex items-center px-1 pb-1 transition-colors duration-200 ease-in-out";
    const activeLinkClass = "text-sky-100 font-semibold";
    const inactiveLinkClass = "hover:text-sky-200";

    const [openMenu, setOpenMenu] = useState<OpenMenuType>(null);

    const toggleMenu = (menu: OpenMenuType) => {
        setOpenMenu(current => (current === menu ? null : menu));
    };

    const getItemClass = (section: string): string => {
        if ((section === "inicio" && active === "inicio") ||
            (section === "pagamento" && active === "pagamento") ||
            (section === "contato" && active === "contato")) {
            return `${baseLinkClass} ${activeLinkClass}`;
        } else if (section !== "inicio" && section !== "pagamento" && section !== "contato" && active.startsWith(section)) {
            return `${baseLinkClass} ${activeLinkClass}`;
        } else {
            return `${baseLinkClass} ${inactiveLinkClass}`;
        }
    };

    return (
        <nav className="flex justify-between items-center p-4 md:p-6 bg-gradient-to-r from-[#075985] to-[#012A46] text-white shadow-md relative z-50">
            {/* Logo/Título */}
            <Link href="/inicio">
                <h1 className="flex items-center text-xl md:text-2xl font-bold cursor-pointer hover:text-sky-200 transition-colors">
                    <MdBuild className="inline-block mr-2 text-2xl" />
                    Oficina On-line
                </h1>
            </Link>

            <ul className="flex flex-wrap gap-3 md:gap-5 text-sm md:text-base items-center">
                {/* Início */}
                <li>
                    <Link href="/inicio" className={getItemClass("inicio")}>
                        <MdHome className="inline-block mr-1" /> Início
                    </Link>
                </li>

                {/* Clientes */}
                <li className="relative">
                    <button
                        type="button"
                        onClick={() => toggleMenu('clientes')}
                        className={`${getItemClass("clientes")} cursor-pointer`}
                    >
                        <MdPeople className="inline-block mr-1" /> Clientes
                    </button>
                    {openMenu === 'clientes' && (
                        <ul className="absolute left-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 animate-fade-in-down">
                            <li><Link href="/clientes/listar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Listar Clientes</Link></li>
                            <li><Link href="/clientes/cadastrar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Cadastrar Cliente</Link></li>
                            <li><Link href="/clientes/buscar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Buscar Cliente</Link></li>
                        </ul>
                    )}
                </li>

                {/* Veículo */}
                <li className="relative">
                    <button
                        type="button"
                        onClick={() => toggleMenu('veiculo')}
                        className={`${getItemClass("veiculo")} cursor-pointer`}
                    >
                        <MdDirectionsCar className="inline-block mr-1" /> Veículo
                    </button>
                    {openMenu === 'veiculo' && (
                        <ul className="absolute left-0 mt-2 w-52 bg-slate-700 rounded-md shadow-lg py-1 animate-fade-in-down">
                            <li><Link href="/veiculo/listar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Listar Veículos</Link></li>
                            <li><Link href="/veiculo/cadastrar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Cadastrar Veículo</Link></li>
                            <li><Link href="/veiculo/buscar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Buscar Veículo</Link></li>
                        </ul>
                    )}
                </li>

                {/* Oficina Online */}
                <li className="relative">
                    <button
                        type="button"
                        onClick={() => toggleMenu('oficina')}
                        className={`${getItemClass("oficinaOnline")} cursor-pointer`}
                    >
                        <MdBuild className="inline-block mr-1" /> Oficina On-line
                    </button>
                    {openMenu === 'oficina' && (
                        <ul className="absolute left-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 animate-fade-in-down">
                            <li><Link href="/oficinaOnline/listar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Listar Registros</Link></li>
                            <li><Link href="/oficinaOnline/cadastrar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Novo Diagnóstico</Link></li>
                            <li><Link href="/oficinaOnline/buscar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Buscar Registro</Link></li>
                        </ul>
                    )}
                </li>

                {/* Agendamento */}
                <li className="relative">
                    <button
                        type="button"
                        onClick={() => toggleMenu('agendamento')}
                        className={`${getItemClass("agendamento")} cursor-pointer`}
                    >
                        <MdSchedule className="inline-block mr-1" /> Agendamento
                    </button>
                    {openMenu === 'agendamento' && (
                        <ul className="absolute left-0 mt-2 w-52 bg-slate-700 rounded-md shadow-lg py-1 animate-fade-in-down">
                            <li><Link href="/agendamento/listar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Listar Agendamentos</Link></li>
                            <li><Link href="/agendamento/cadastrar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Novo Agendamento</Link></li>
                            <li><Link href="/agendamento/buscar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Buscar Agendamento</Link></li>
                        </ul>
                    )}
                </li>

                {/* Relatório */}
                <li className="relative">
                    <button
                        type="button"
                        onClick={() => toggleMenu('relatorio')}
                        className={`${getItemClass("relatorio")} cursor-pointer`}
                    >
                        <MdBarChart className="inline-block mr-1" /> Relatório
                    </button>
                    {openMenu === 'relatorio' && (
                        <ul className="absolute left-0 mt-2 w-56 bg-slate-700 rounded-md shadow-lg py-1 animate-fade-in-down">
                            <li><Link href="/relatorio/agendamentos-futuros" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Agendamentos Futuros</Link></li>
                            <li><Link href="/relatorio/contagem-mensal" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Contagem Mensal</Link></li>
                            <li><Link href="/relatorio/historico-cliente" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Histórico por Cliente</Link></li>
                            <li><Link href="/relatorio/servicos-agendados" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Serviços Agendados</Link></li>
                            <li><Link href="/relatorio/cliente-completo" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors">Relatorio de Cliente</Link></li>
                        </ul>
                    )}
                </li>

                {/* Pagamento */}
                <li>
                    <Link href="/pagamento" className={getItemClass("pagamento")}>
                        <MdPayment className="inline-block mr-1" /> Pagamento
                    </Link>
                </li>

                {/* Contato */}
                <li>
                    <Link href="/contato" className={getItemClass("contato")}>
                        <MdContactMail className="inline-block mr-1" /> Contato
                    </Link>
                </li>
            </ul>

            {/* Avatar */}
            <img
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-sky-200"
                src="https://avatars.githubusercontent.com/u/4350623?v=4"
                alt="Avatar do usuário"
            />

            {/* Animação fade-in-down */}
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
