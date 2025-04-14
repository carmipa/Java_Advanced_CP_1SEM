"use client"; // Necessário para useState

import Link from 'next/link';
import { useState } from 'react'; // Importa useState

// Interface atualizada (sem mudanças necessárias aqui por enquanto)
interface NabvBarProps {
    active: "inicio" | "clientes" | "cadastrar" | "oficinaOnline" | "agendamento" | "relatorio" | "pagamento"
}

export default function NavBar(props: NabvBarProps) {
    const { active } = props;
    const classActive = "border-b-4 border-white pb-1";

    // --- Estados para controlar dropdowns ---
    const [isClientesMenuOpen, setIsClientesMenuOpen] = useState(false);
    const [isOficinaMenuOpen, setIsOficinaMenuOpen] = useState(false); // <<< Novo estado para Oficina

    // Verifica se a seção ativa é 'clientes' ou 'oficinaOnline'
    const isClientesActive = active === "clientes" || active === "cadastrar"; // Mantém 'cadastrar' por compatibilidade se ainda usar
    const isOficinaActive = active === "oficinaOnline";

    return (
        <nav className="flex justify-between items-center p-4 md:p-6 bg-[#075985] text-white">
            <Link href="/inicio">
                <h1 className="text-xl md:text-2xl font-bold cursor-pointer">Oficina On-line</h1>
            </Link>
            <ul className="flex flex-wrap gap-3 md:gap-4 text-sm md:text-base">
                {/* Item Início */}
                <li className={active === "inicio" ? classActive : ""}>
                    <Link href="/inicio" className="hover:text-sky-200 transition-colors cursor-pointer">Início</Link>
                </li>

                {/* --- Item Clientes (com Dropdown) --- */}
                <li
                    className={`relative ${isClientesActive ? classActive : ""}`}
                    onMouseEnter={() => setIsClientesMenuOpen(true)}
                    onMouseLeave={() => setIsClientesMenuOpen(false)}
                >
                    <span className="hover:text-sky-200 transition-colors cursor-default px-1">Clientes</span>
                    {isClientesMenuOpen && (
                        <ul className="absolute left-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 z-50">
                            <li><Link href="/clientes/listar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer" onClick={() => setIsClientesMenuOpen(false)}>Listar Clientes</Link></li>
                            <li><Link href="/clientes/cadastrar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer" onClick={() => setIsClientesMenuOpen(false)}>Cadastrar Cliente</Link></li>
                            <li><Link href="/clientes/buscar" className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer" onClick={() => setIsClientesMenuOpen(false)}>Buscar Cliente</Link></li>
                        </ul>
                    )}
                </li>

                {/* --- Item Oficina Online (com Dropdown) --- */}
                <li
                    className={`relative ${isOficinaActive ? classActive : ""}`} // <<< Aplica classe ativa
                    onMouseEnter={() => setIsOficinaMenuOpen(true)} // <<< Abre menu Oficina
                    onMouseLeave={() => setIsOficinaMenuOpen(false)} // <<< Fecha menu Oficina
                >
                    {/* <<< Trigger não clicável para Oficina >>> */}
                    <span className="hover:text-sky-200 transition-colors cursor-default px-1">
                        Oficina On-line
                    </span>

                    {/* <<< Dropdown Menu para Oficina >>> */}
                    {isOficinaMenuOpen && (
                        <ul className="absolute left-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 z-50">

                            <li>
                                <Link
                                    href="/oficinaOnline/cadastrar" // Link para Cadastrar novo diagnóstico
                                    className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer"
                                    onClick={() => setIsOficinaMenuOpen(false)}
                                >
                                    Novo Diagnóstico
                                </Link>
                            </li>
                            {/* Adicione links para buscar/alterar oficina aqui quando existirem */}
                            <li>
                                <Link
                                    href="/oficinaOnline/listar" // Link para Cadastrar novo diagnóstico
                                    className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer"
                                    onClick={() => setIsOficinaMenuOpen(false)}
                                >
                                    Listar Registros de Diagnósticos
                                </Link>
                            </li>
                        </ul>
                    )}
                </li>

                {/* --- Outros Itens --- */}
                <li className={active === "agendamento" ? classActive : ""}>
                    <Link href="/agendamento" className="hover:text-sky-200 transition-colors cursor-pointer">Agendamento</Link>
                </li>
                <li className={active === "relatorio" ? classActive : ""}>
                    <Link href="/relatorio" className="hover:text-sky-200 transition-colors cursor-pointer">Relatório</Link>
                </li>
                <li className={active === "pagamento" ? classActive : ""}>
                    <Link href="/pagamento" className="hover:text-sky-200 transition-colors cursor-pointer">Pagamento</Link>
                </li>
            </ul>
            <img className="size-10 md:size-12 rounded-full" src="https://avatars.githubusercontent.com/u/4350623?v=4" alt="Avatar do usuário"/>
        </nav>
    )
}
