// src/components/ProtectedRoute.tsx
'use client';

import React, { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // Ícone de loading

interface ProtectedRouteProps {
    children: ReactNode;
}

/**
 * Componente que protege rotas do lado do cliente.
 * Verifica a existência de um token JWT no localStorage.
 * Se o token não for encontrado, redireciona para a página de login.
 * Caso contrário, renderiza o conteúdo filho.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true); // Estado para mostrar um loading enquanto verifica

    useEffect(() => {
        console.log("[ProtectedRoute] Verificando token no localStorage...");
        const token = localStorage.getItem('jwtToken');

        if (!token) {
            console.log("[ProtectedRoute] Token não encontrado. Redirecionando para /login.");
            // Se não houver token, redireciona para a página de login
            // Usamos replace para que a página protegida não fique no histórico do navegador
            router.replace('/login');
        } else {
            console.log("[ProtectedRoute] Token encontrado. Permitindo acesso.");
            // Opcional: Adicionar uma chamada ao backend para validar o token (expiração, etc.)
            // Se a validação falhar, remover o token do localStorage e redirecionar para /login.
            // Exemplo básico (requer implementação de um endpoint de validação no backend e adaptar fetchAuthenticated):
            // async function validateToken() {
            //   try {
            //     const isValid = await fetchAuthenticated('/auth/validate', { method: 'POST' }); // Exemplo de endpoint no backend
            //     if (!isValid.ok) {
            //       console.log("[ProtectedRoute] Token inválido ou expirado. Redirecionando para /login.");
            //       localStorage.removeItem('jwtToken');
            //       router.replace('/login');
            //     } else {
            //        setIsLoading(false); // Token válido, para o loading e renderiza children
            //     }
            //   } catch (error) {
            //     console.error("[ProtectedRoute] Erro na validação do token:", error);
            //     localStorage.removeItem('jwtToken'); // Em caso de erro na validação (rede, etc.), assume que o token é inválido por segurança
            //     router.replace('/login');
            //   }
            // }
            // validateToken();

            // Para esta implementação simples, apenas a existência do token já permite renderizar.
            // A validação mais completa pode ser um passo futuro.
            setIsLoading(false); // Assume que a existência do token é suficiente por agora e para o loading.
        }
    }, [router]); // Dependência 'router' é boa prática

    // Enquanto verifica, pode renderizar um loading simples
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#012A46] text-white flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
                <p className="ml-4 text-lg text-sky-300">Verificando autenticação...</p>
            </div>
        );
    }

    // Se o token for encontrado e a verificação terminar (ou for ignorada inicialmente), renderiza o conteúdo filho.
    // Se o redirecionamento ocorreu no useEffect, este ponto não será alcançado para utilizadores não autenticados.
    return <>{children}</>;
};

export default ProtectedRoute;