// src/app/inicio/page.tsx
'use client';

// IMPORTANTE: Remover o import de useEffect daqui, pois a verificação será feita pelo ProtectedRoute.
// import React, { useEffect } from 'react';
import React from 'react';
// IMPORTANTE: Remover o import de useRouter daqui, pois o redirecionamento será feito pelo ProtectedRoute.
// import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';
// import { fetchAuthenticated } from '@/utils/apiService'; // Pode manter se a página fizer chamadas autenticadas
import ProtectedRoute from '@/components/ProtectedRoute'; // <<< IMPORTAR O ProtectedRoute

export default function InicioPage() {
    // IMPORTANTE: Remover a inicialização de useRouter e o useEffect daqui.
    // const router = useRouter();
    // useEffect(() => { /* ... lógica de verificação de token removida ... */ }, [router]);

    return (
        // Envolve todo o conteúdo da página com o ProtectedRoute
        <ProtectedRoute>
            <>
                <NavBar active="inicio" />

                <main
                    className="flex items-center justify-center min-h-screen text-white bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('/admin-ajax.png')`,
                        backgroundColor: '#012A46',
                    }}
                >
                    <section className="bg-black/50 backdrop-blur-sm max-w-2xl p-8 m-4 rounded-xl text-center">
                        <h1 className="mb-4 text-4xl font-bold">Bem-vindo à Oficina Virtual</h1>
                        <p className="mb-8 text-lg">
                            Descubra uma nova forma de cuidar do seu veículo com praticidade e eficiência. Experimente nossa plataforma e agende seu serviço online.
                        </p>
                        <button className="px-6 py-3 font-semibold text-white transition bg-[#075985] rounded-md shadow hover:bg-[#075985]/90">
                            Agendar Serviço
                        </button>
                    </section>
                </main>
            </>
        </ProtectedRoute>
    );
}