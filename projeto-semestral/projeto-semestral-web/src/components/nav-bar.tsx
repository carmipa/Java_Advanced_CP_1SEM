// src/components/nav-bar.tsx (ou o caminho correto no seu projeto)
"use client";

import Link from 'next/link';
import { useState } from 'react';

interface NabvBarProps {
    active: "inicio" | "clientes" | "cadastrar" | "oficinaOnline" | "agendamento" | "relatorio" | "pagamento"
}

export default function NavBar(props: NabvBarProps) {
    const { active } = props;
    const baseItemClass = "border-b-4 pb-1";
    const activeClass = `${baseItemClass} border-white`;
    const inactiveClass = `${baseItemClass} border-transparent`;

    const [isClientesMenuOpen, setIsClientesMenuOpen] = useState(false);
    const [isOficinaMenuOpen, setIsOficinaMenuOpen] = useState(false);
    const [isAgendamentoMenuOpen, setIsAgendamentoMenuOpen] = useState(false);

    const isClientesActive = active === "clientes";
    const isOficinaActive = active === "oficinaOnline";
    const isAgendamentoActive = active === "agendamento";

    return (
        <nav className="flex justify-between items-center p-4 md:p-6 bg-[#075985] text-white">
            <Link href="/inicio">
                <h1 className="text-xl md:text-2xl font-bold cursor-pointer">Oficina On-line</h1>
            </Link>
            <ul className="flex flex-wrap gap-3 md:gap-4 text-sm md:text-base">

                {/* --- Item Início --- */}
                <li className={active === "inicio" ? activeClass : inactiveClass}>
                    <Link href="/inicio" className="hover:text-sky-200 transition-colors cursor-pointer">Início</Link>
                </li>

                {/* --- Item Clientes (Dropdown) --- */}
                <li
                    className={`relative`}
                    onMouseEnter={() => setIsClientesMenuOpen(true)}
                    onMouseLeave={() => setIsClientesMenuOpen(false)}
                >
                    <span className={`hover:text-sky-200 transition-colors cursor-default px-1 ${ (isClientesActive || isClientesMenuOpen) ? activeClass : inactiveClass }`}>
                        Clientes
                    </span>
                    {isClientesMenuOpen && (
                        <ul className="absolute left-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 z-50">
                            <li><Link href="/clientes/listar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer" onClick={() => setIsClientesMenuOpen(false)}>Listar Clientes</Link></li>
                            <li><Link href="/clientes/cadastrar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer" onClick={() => setIsClientesMenuOpen(false)}>Cadastrar Cliente</Link></li>
                            <li><Link href="/clientes/buscar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer" onClick={() => setIsClientesMenuOpen(false)}>Buscar Cliente</Link></li>
                        </ul>
                    )}
                </li>

                {/* --- Item Oficina Online (Dropdown) --- */}
                <li
                    className={`relative`}
                    onMouseEnter={() => setIsOficinaMenuOpen(true)}
                    onMouseLeave={() => setIsOficinaMenuOpen(false)}
                >
                    <span className={`hover:text-sky-200 transition-colors cursor-default px-1 ${ (isOficinaActive || isOficinaMenuOpen) ? activeClass : inactiveClass }`}>
                        Oficina On-line
                    </span>
                    {isOficinaMenuOpen && (
                        <ul className="absolute left-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 z-50">
                            {/* ***** CORREÇÃO APLICADA AQUI ***** */}
                            <li><Link href="/oficinaOnline/listar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer" onClick={() => setIsOficinaMenuOpen(false)}>Listar Registros</Link></li>
                            <li><Link href="/oficinaOnline/cadastrar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer" onClick={() => setIsOficinaMenuOpen(false)}>Novo Diagnóstico</Link></li>
                            <li><Link href="/oficinaOnline/buscar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer" onClick={() => setIsOficinaMenuOpen(false)}>Buscar Registro</Link></li>
                        </ul>
                    )}
                </li>

                {/* --- Item Agendamento (Dropdown) --- */}
                <li
                    className={`relative`}
                    onMouseEnter={() => setIsAgendamentoMenuOpen(true)}
                    onMouseLeave={() => setIsAgendamentoMenuOpen(false)}
                >
                    <span className={`hover:text-sky-200 transition-colors cursor-default px-1 ${ (isAgendamentoActive || isAgendamentoMenuOpen) ? activeClass : inactiveClass }`}>
                        Agendamento
                    </span>
                    {isAgendamentoMenuOpen && (
                        <ul className="absolute left-0 mt-2 w-52 bg-slate-700 rounded-md shadow-lg py-1 z-50">
                            <li><Link href="/agendamento/listar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer" onClick={() => setIsAgendamentoMenuOpen(false)}>Listar Agendamentos</Link></li>
                            <li><Link href="/agendamento/cadastrar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer" onClick={() => setIsAgendamentoMenuOpen(false)}>Novo Agendamento</Link></li>
                            <li><Link href="/agendamento/buscar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer" onClick={() => setIsAgendamentoMenuOpen(false)}>Buscar Agendamento</Link></li>
                        </ul>
                    )}
                </li>

                {/* --- Outros Itens --- */}
                <li className={active === "relatorio" ? activeClass : inactiveClass}>
                    <Link href="/relatorio" className="hover:text-sky-200 transition-colors cursor-pointer">Relatório</Link>
                </li>
                <li className={active === "pagamento" ? activeClass : inactiveClass}>
                    <Link href="/pagamento" className="hover:text-sky-200 transition-colors cursor-pointer">Pagamento</Link>
                </li>
            </ul>
            <img className="size-10 md:size-12 rounded-full" src="https://avatars.githubusercontent.com/u/4350623?v=4" alt="Avatar do usuário"/>
        </nav>
    )
}