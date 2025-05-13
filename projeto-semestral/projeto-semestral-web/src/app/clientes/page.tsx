// app/clientes/page.tsx
"use client";

// Importe fetchAuthenticated se houver chamadas de API nesta página (atualmente não há)
// import { fetchAuthenticated } from '@/utils/apiService';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';

export default function ClientesMenuPage() {

    return (
        <>
            {/* Passa a prop 'active' correta para a NavBar */}
            <NavBar active="clientes" />

            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="text-3xl font-bold mb-8 text-center">Gerenciar Clientes</h1>

                <div className="flex flex-col items-center gap-6 mt-10 md:flex-row md:justify-center">
                    {/* Botão/Link para Listar */}
                    <Link href="/clientes/listar">
                        <button className="w-60 px-6 py-3 text-lg font-semibold text-white bg-sky-600 rounded-md shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors">
                            Listar Clientes
                        </button>
                    </Link>

                    {/* Botão/Link para Cadastrar */}
                    <Link href="/clientes/cadastrar">
                        <button className="w-60 px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors">
                            Cadastrar Novo Cliente
                        </button>
                    </Link>

                    {/* Você pode adicionar mais botões aqui para outras ações se desejar */}

                </div>
            </main>
        </>
    );
}