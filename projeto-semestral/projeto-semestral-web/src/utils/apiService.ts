// src/utils/apiService.ts

import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

// URL base da sua API Java
const API_BASE_URL = "http://localhost:8080"; // <<< Sua URL base do backend

// Função auxiliar para obter o token JWT armazenado
function getAuthToken(): string | null {
    // Esta função só deve ser chamada em ambientes onde 'window' existe (Client Components)
    if (typeof window === 'undefined') {
        return null;
    }
    return localStorage.getItem('jwtToken'); // Assume que o token está em localStorage
}

/**
 * Faz uma requisição HTTP autenticada para a API backend.
 * Adiciona automaticamente o cabeçalho Authorization com o token JWT.
 * Redireciona para a página de login se o token não for encontrado ou se a resposta for 401/403.
 *
 * @param endpoint O caminho do endpoint relativo à URL base (ex: '/rest/clientes/all').
 * @param options As opções padrão do fetch (method, body, headers, etc.).
 * @returns A Promise da Response do fetch.
 * @throws Error em caso de falha na comunicação de rede.
 */
export async function fetchAuthenticated(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {

    const token = getAuthToken();

    // Verifica a presença do token ANTES de fazer a requisição.
    // Se não houver token, redireciona para login.
    if (!token) {
        console.warn(`[fetchAuthenticated] Token JWT não encontrado para ${endpoint}. Redirecionando para login.`);
        // Limpa qualquer token inválido/parcial localmente antes de redirecionar
        localStorage.removeItem('jwtToken');
        // Usa redirect do next/navigation. Isto funciona em Client Components.
        // Para Server Components ou Route Handlers, o manejo seria diferente (cookies + NextResponse.redirect)
        redirect('/login'); // Redireciona o usuário
        // O código abaixo não é alcançado após o redirect()
    }

    // Adiciona o cabeçalho de autorização
    const headers = {
        ...options.headers, // Mantém outros headers passados
        'Authorization': `Bearer ${token}`, // Adiciona o cabeçalho JWT
    };

    // Constrói a URL completa
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        console.log(`[fetchAuthenticated] Fazendo ${options.method || 'GET'} para ${url}`);
        const response = await fetch(url, {
            ...options,
            headers, // Usa os headers atualizados
        });

        console.log(`[fetchAuthenticated] Resposta recebida para ${endpoint}: Status ${response.status}`);

        // Intercepta respostas de autenticação falha (401 Unauthorized ou 403 Forbidden)
        // O Spring Security pode retornar 401 ou 403 dependendo da configuração e do estado.
        if (response.status === 401 || response.status === 403) {
            console.warn(`[fetchAuthenticated] Acesso negado para ${endpoint} (Status ${response.status}). Token inválido/expirado ou permissão insuficiente. Limpando token e redirecionando para login.`);
            // Limpa o token inválido ou expirado
            localStorage.removeItem('jwtToken');
            // Redireciona o usuário para a página de login
            redirect('/login'); // Redireciona
            // O código abaixo não é alcançado
        }

        // Para outros status (incluindo 2xx, 400, 404, 500 etc.), retorna a resposta.
        // O código que CHAMOU fetchAuthenticated é responsável por tratar
        // status como 200 OK (para sucesso), 204 No Content, 400 Bad Request, 404 Not Found, 500 Internal Server Error, etc.
        return response;

    } catch (err: any) {
        // Captura erros de rede (ex: servidor backend offline, problemas de CORS ANTES do OPTIONS, etc.)
        console.error(`[fetchAuthenticated] Erro de rede/comunicação para ${url}:`, err);
        // Lança o erro para que a página/componente que chamou possa tratá-lo
        throw new Error(`Falha na comunicação com a API (${API_BASE_URL}). Verifique se o backend está rodando. Detalhes: ${err.message || 'Erro desconhecido'}`);
    }
}