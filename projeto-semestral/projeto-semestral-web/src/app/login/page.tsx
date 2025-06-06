// src/app/login/page.tsx
"use client"; // Este é um Client Component

// IMPORTANTE: Readicionar o import de useEffect.
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdLogin, MdEmail, MdLock } from 'react-icons/md';
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';

// Interface para o DTO de resposta do login (vindo do backend Java)
interface LoginResponseDto {
    token: string;
    // Adicione outros campos se o backend retornar (ex: username, roles)
    // username?: string;
    // roles?: string[];
}

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Estado para controlar a visibilidade da senha
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    // !!! READICIONAR ESTE useEffect !!!
    // AGORA ELE NÃO CAUSARÁ CONFLITO COM O MIDDLEWARE SIMPLIFICADO
    useEffect(() => {
        console.log("[Login Page] useEffect rodando para verificar token...");
        // Esta lógica roda APENAS no ambiente do navegador (devido ao "use client")
        const token = localStorage.getItem('jwtToken');

        if (token) {
            // Se encontrar um token, significa que o utilizador já está autenticado.
            // Redireciona para a página inicial para evitar que ele veja o formulário de login novamente.
            console.log("[Login Page] Token encontrado no localStorage. Redirecionando para /inicio.");
            // Use router.replace para não adicionar a página de login ao histórico de navegação
            router.replace('/inicio');
        } else {
            // Se não houver token, garante que o estado de erro está limpo ao carregar (se houver algum de uma tentativa anterior)
            console.log("[Login Page] Nenhum token encontrado no localStorage ao carregar.");
            setError(null); // Limpa qualquer erro anterior ao mostrar o formulário
        }
    }, [router]); // Roda uma vez na montagem do componente. 'router' na dependência é boa prática.
    // !!! FIM DO useEffect READICIONADO !!!


    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Evita o recarregamento da página
        setIsLoading(true);
        setError(null); // Limpa erro em cada tentativa

        // Endpoint de login da sua API Java
        const apiUrl = "http://localhost:8080/auth/login"; // URL CORRETA PARA SEU ENDPOINT DE LOGIN NO BACKEND

        try {
            console.log(`[Login Page] Tentando POST para ${apiUrl} com usuário: ${username}`);
            // Usamos o fetch nativo AQUI na página de login, pois este endpoint é PÚBLICO.
            // fetchAuthenticated é para endpoints PROTEGIDOS.
            const response = await fetch(apiUrl, {
                method: 'POST', // Usar POST para enviar credenciais
                headers: {
                    'Content-Type': 'application/json', // Indica que o corpo é JSON
                },
                // Enviar usuário e senha no corpo da requisição como JSON
                body: JSON.stringify({
                    usuario: username, // O nome do campo deve bater com o DTO LoginRequestDto no Java
                    senha: password    // O nome do campo deve bater com o DTO LoginRequestDto no Java
                }),
            });
            console.log(`[Login Page] Resposta recebida do backend: Status ${response.status}`);

            // Verifica a resposta
            if (!response.ok) {
                // Se o status for 401 (Unauthorized), são credenciais inválvidas
                if (response.status === 401) {
                    setError("Credenciais inválidas. Por favor, tente novamente.");
                    console.warn("[Login Page] Login falhou: Credenciais inválidas (Status 401).");
                } else {
                    // Para outros erros HTTP, tentamos ler a mensagem de erro do corpo da resposta.
                    const errorBody = await response.text().catch(() => "Erro desconhecido");
                    let errorMessage = `Erro ao fazer login: ${response.status}.`;
                    try {
                        // Tenta parsear o corpo como JSON para obter a mensagem de erro detalhada (se o backend enviar JSON de erro)
                        const errorJson = JSON.parse(errorBody);
                        errorMessage = errorJson.message || errorMessage;
                        console.error("[Login Page] Erro API Detalhes (lido do corpo da resposta):", errorJson);
                    } catch (e) {
                        // Se o corpo não for JSON válido, usa o texto da resposta ou o statusText padrão.
                        errorMessage = `${errorMessage} Detalhes: ${errorBody || response.statusText}`;
                        console.error("[Login Page] Erro API Texto (corpo não-JSON):", errorBody);
                    }
                    setError(errorMessage);
                    console.error(`[Login Page] Login falhou: Status ${response.status}`, errorMessage);
                }
                return; // Se a resposta não foi OK, para o processo de login.
            }

            // Se a resposta for OK (HTTP 200), o login foi bem-sucedido.
            const data: LoginResponseDto = await response.json();
            // *** 1. Armazenar o Token JWT ***
            localStorage.setItem('jwtToken', data.token);
            console.log("[Login Page] Login bem-sucedido! Token armazenado em localStorage.");

            // *** 2. Redirecionar para uma página protegida ***
            // Agora, simplesmente navegamos. O useEffect acima irá detectar o token
            // e redirecionar se o utilizador tentar acessar a página de login novamente.
            // Mas após um login bem sucedido, queremos ir para a página inicial protegida.
            router.replace('/inicio'); // Redireciona para /inicio (ou outra página inicial protegida)
            console.log("[Login Page] Navegando para /inicio após login bem-sucedido.");

        } catch (err: any) {
            // Captura erros de rede que impediram o fetch de completar (ex: servidor backend offline)
            console.error("[Login Page] Erro na requisição de login (catch):", err);
            if (err instanceof TypeError && err.message === 'Failed to fetch') {
                setError("Não foi possível conectar ao servidor backend (API). Verifique se o backend está rodando.");
            } else {
                // Outros erros inesperados durante o fetch
                setError("Ocorreu um erro inesperado durante a comunicação com o servidor.");
            }
        } finally {
            // Garante que o estado de loading é sempre false ao final
            setIsLoading(false);
        }
    };

    // Handler para alternar a visibilidade da senha
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };


    return (
        <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
            <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-sm border border-slate-700">
                <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-8 text-center">
                    <MdLogin className="text-4xl text-sky-400" /> Fazer Login
                </h1>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Mensagens de Feedback */}
                    {error && (
                        <div
                            className="relative mb-4 text-red-400 bg-red-900/50 p-3 rounded border border-red-500 text-sm"
                            role="alert"
                        >
                            <div className="flex items-center gap-2"> <AlertCircle size={18} /> <span>{error}</span> </div>
                            <button
                                type="button"
                                className="absolute top-1 right-1 p-1 hover:text-red-200 text-red-400" // Corrigido cor do botão fechar
                                onClick={() => setError(null)}
                                aria-label="Fechar"
                            >
                                &times;
                            </button>
                        </div>
                    )}
                    {/* Removendo a exibição da mensagem de sucesso aqui para simplificar o fluxo */}

                    {/* Campo Nome de Usuário */}
                    <div>
                        <label htmlFor="username" className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1">
                            <MdEmail size={16} /> Nome de Usuário:
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>

                    {/* Campo Senha com Olho Mágico */}
                    <div>
                        <label htmlFor="password" className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1">
                            <MdLock size={16} /> Senha:
                        </label>
                        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-md focus-within:ring-2 focus-within:ring-sky-500">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-transparent outline-none border-none"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="p-2 text-slate-400 hover:text-sky-400 focus:outline-none"
                                aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Botão de Login */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white bg-sky-600 rounded-md shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <><Loader2 size={20} className="animate-spin"/> Entrando...</>
                        ) : (
                            <><MdLogin size={20} /> Fazer Login</>
                        )}
                    </button>

                    {/* Opcional: Link para página de registro, se houver */}
                    {/* <div className="text-center mt-4">
                         <Link href="/register" className="text-sm text-sky-400 hover:underline">
                            Não tem conta? Cadastre-se
                        </Link>
                    </div> */}
                </form>
            </div>
        </main>
    );
}