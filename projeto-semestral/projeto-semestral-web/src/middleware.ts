// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de caminhos (prefixes ou exatos) que são acessíveis publicamente.
// O middleware NUNCA REDIRECIONARÁ para o login se a requisição for para um desses caminhos.
// Certifique-se de incluir sua página de login e quaisquer outras páginas de acesso livre.
const publicPaths = [
    '/login', // Sua página de login
    '/register', // Sua página de registro (se houver)
    '/', // Sua página inicial (ajuste se sua home page exigir autenticação)
    '/contato', // Página de contato (se for pública)
    // Adicione outros caminhos de páginas publicamente acessíveis aqui.
    // Não inclua prefixes de API backend aqui, apenas caminhos de páginas renderizadas pelo Next.js.
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    console.log(`[Middleware] Interceptando requisição para: ${pathname}`);

    // 1. Verificar se o caminho que está sendo acessado é uma rota pública da APLICAÇÃO (Frontend)
    // Usamos startsWith para incluir sub-caminhos (ex: /login/...)
    const isPublicRoute = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

    // 2. Se o caminho NÃO for uma rota pública:
    // Assumimos que é uma rota protegida (uma página Next.js que exige login).
    // Redirecionamos o usuário para a página de login.
    // A verificação REAL da autenticação (presença/validade do token JWT)
    // acontecerá na página de login ou no layout protegido após o redirecionamento.
    // Este middleware apenas garante que o usuário não "pule" a tela de login
    // ao tentar acessar uma rota protegida.

    if (!isPublicRoute) {
        console.log(`[Middleware] Rota (${pathname}) não é pública. Redirecionando para /login.`);
        // Redireciona para a página de login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Se a rota for pública, permite que a requisição continue normalmente.
    console.log(`[Middleware] Rota pública (${pathname}). Permitindo acesso.`);
    return NextResponse.next();
}

// Configuração do matcher para o middleware
// Define quais caminhos o middleware deve interceptar.
// A regra '/((?!...).*)' aplica o middleware a tudo que NÃO CASA com os padrões dentro do '?!'
export const config = {
    matcher: [
        // Exclui os caminhos que começam com:
        // - /_next (Next.js internals: static files, image optimization)
        // - /.*\\..* (arquivos com extensão no root, como favicon.ico)
        // - /rest (PREFIXO DOS SEUS ENDPOINTS DE API BACKEND) - CRUCIAL para que o middleware do frontend não intercepte as chamadas fetch para o backend
        // - /auth (PREFIXO DOS SEUS ENDPOINTS DE AUTENTICAÇÃO DO BACKEND) - CRUCIAL
        // Certifique-se que '/rest' e '/auth' correspondem aos @RequestMapping do seu backend.
        // Certifique-se de que os caminhos públicos DEFINIDOS EM publicPaths acima *não* sejam excluídos aqui, a menos que intencional.
        '/((?!_next|.*\\..*|/rest/.*|/auth/.*).*)',
        // Este matcher irá incluir paths como '/', '/clientes', '/agendamento/listar', etc.,
        // que são as rotas da sua aplicação Next.js que o middleware deve proteger.
    ],
};