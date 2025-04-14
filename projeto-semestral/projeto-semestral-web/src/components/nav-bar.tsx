"use client"; // Necessário para useState

import Link from 'next/link';
import { useState } from 'react'; // Importa useState

// Interface atualizada
interface NabvBarProps {
    active: "inicio" | "clientes" | "cadastrar" | "oficinaOnline" | "agendamento" | "relatorio" | "pagamento"
}

export default function NavBar(props: NabvBarProps) {
    const { active } = props;
    const classActive = "border-b-4 border-white pb-1";
    const isClientesActive = active === "clientes";

    // Estado para controlar dropdown
    const [isClientesMenuOpen, setIsClientesMenuOpen] = useState(false);

    return (
        <nav className="flex justify-between items-center p-4 md:p-6 bg-[#075985] text-white">
            <Link href="/inicio">
                {/* O h1 dentro do Link já tinha cursor-pointer, mantido */}
                <h1 className="text-xl md:text-2xl font-bold cursor-pointer">Oficina On-line</h1>
            </Link>
            <ul className="flex flex-wrap gap-3 md:gap-4 text-sm md:text-base">
                {/* Item Início */}
                <li className={active === "inicio" ? classActive : ""}>
                    {/* Adicionado cursor-pointer ao Link */}
                    <Link href="/inicio" className="hover:text-sky-200 transition-colors cursor-pointer">
                        Início
                    </Link>
                </li>

                {/* --- Item Clientes (Trigger não clicável) --- */}
                <li
                    className={`relative ${isClientesActive ? classActive : ""}`}
                    onMouseEnter={() => setIsClientesMenuOpen(true)}
                    onMouseLeave={() => setIsClientesMenuOpen(false)}
                >
                    {/* Span continua com cursor-default (não clicável) */}
                    <span className="hover:text-sky-200 transition-colors cursor-default px-1">
                        Clientes
                    </span>

                    {/* Dropdown Menu */}
                    {isClientesMenuOpen && (
                        <ul className="absolute left-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 z-50">

                            <li>
                                {/* Adicionado cursor-pointer aos Links do dropdown */}
                                <Link
                                    href="/clientes/cadastrar"
                                    className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer"
                                    onClick={() => setIsClientesMenuOpen(false)}
                                >
                                    Cadastrar Cliente
                                </Link>
                            </li>

                            <li>
                                {/* Adicionado cursor-pointer aos Links do dropdown */}
                                <Link
                                    href="/clientes/listar"
                                    className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer"
                                    onClick={() => setIsClientesMenuOpen(false)}
                                >
                                    Listar Clientes
                                </Link>
                            </li>

                            <li>
                                {/* Adicionado cursor-pointer aos Links do dropdown */}
                                <Link
                                    href="/clientes/buscar"
                                    className="block px-4 py-2 text-sm text-white hover:bg-sky-600 transition-colors cursor-pointer"
                                    onClick={() => setIsClientesMenuOpen(false)}
                                >
                                    Buscar Cliente
                                </Link>
                            </li>



                            {/* Adicione outros links CRUD aqui */}
                        </ul>
                    )}
                </li>

                {/* --- Outros Itens --- */}
                <li className={active === "oficinaOnline" ? classActive : ""}>
                    {/* Adicionado cursor-pointer ao Link */}
                    <Link href="/oficinaOnline" className="hover:text-sky-200 transition-colors cursor-pointer">
                        Oficina On-line
                    </Link>
                </li>
                <li className={active === "agendamento" ? classActive : ""}>
                    {/* Adicionado cursor-pointer ao Link */}
                    <Link href="/agendamento" className="hover:text-sky-200 transition-colors cursor-pointer">
                        Agendamento
                    </Link>
                </li>
                <li className={active === "relatorio" ? classActive : ""}>
                    {/* Adicionado cursor-pointer ao Link */}
                    <Link href="/relatorio" className="hover:text-sky-200 transition-colors cursor-pointer">
                        Relatório
                    </Link>
                </li>
                <li className={active === "pagamento" ? classActive : ""}>
                    {/* Adicionado cursor-pointer ao Link */}
                    <Link href="/pagamento" className="hover:text-sky-200 transition-colors cursor-pointer">
                        Pagamento
                    </Link>
                </li>
            </ul>
            <img className="size-10 md:size-12 rounded-full" src="https://avatars.githubusercontent.com/u/4350623?v=4" alt="Avatar do usuário"/>
        </nav>
    )
}
