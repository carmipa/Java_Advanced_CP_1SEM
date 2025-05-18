// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Este middleware protege *chamadas de API* que vão para /rest/ (exceto /auth)
// As rotas de PÁGINA serão protegidas no lado do CLIENTE usando ProtectedRoute.

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const authHeader = request.headers.get('Authorization'); // Verifica o header padrão de JWT

    console.log(`[Middleware] Interceptando: ${pathname}`);
    // console.log(`[Middleware] Authorization Header: ${authHeader ? 'Presente' : 'Ausente'}`); // Pode ser útil para debug

    // Condição para REDIRECIONAR para o login:
    // 1. A requisição é para uma rota de API REST que deve ser protegida (começa com /rest/ e NÃO com /auth/)
    // E
    // 2. A requisição NÃO possui o header Authorization (onde o token JWT seria enviado)
    if (pathname.startsWith('/rest/') && !pathname.startsWith('/auth/') && !authHeader) {
        console.log(`[Middleware] Acesso a rota REST protegida sem Authorization. Redirecionando para /login.`);
        // Redireciona para a página de login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Para todas as outras requisições (rotas públicas de API, rotas de autenticação,
    // ou rotas de página do Next.js, mesmo as "protegidas"),
    // permite que a requisição continue. A proteção de rotas de página
    // será feita pelo componente ProtectedRoute no lado do cliente.
    console.log(`[Middleware] Permitindo requisição para: ${pathname}`);
    return NextResponse.next();
}

// Configuração do matcher para o middleware
export const config = {
    // Exclui apenas os caminhos internos do Next.js e arquivos estáticos diretos.
    // Isso garante que o middleware NÃO interfere com as requisições de autenticação
    // nem com o carregamento de recursos essenciais do Next.js.
    // Ele irá INTERCEPTAR chamadas para /rest/... (que não sejam /auth/...)
    // e rotas de PÁGINA como /inicio, /clientes/listar, etc.
    // No entanto, a lógica interna AGORA só age no caso específico das APIs protegidas sem token.
    matcher: [
        '/((?!_next|.*\\..*).*)',
    ],
};