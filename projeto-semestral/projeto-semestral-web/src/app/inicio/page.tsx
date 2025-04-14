import NavBar from "@/components/nav-bar";

export default function InicioPage() {
    return (
        <>
            <NavBar active="inicio" />

            {/* --- Modificações aqui --- */}
            <main
                className="flex items-center justify-center min-h-screen text-white bg-cover bg-center bg-no-repeat"
                // Define a imagem de fundo usando valor arbitrário do Tailwind
                // e define uma cor de fundo sólida como fallback caso a imagem não carregue
                style={{
                    backgroundImage: `url('/admin-ajax.png')`, // Caminho para a imagem na pasta public
                    backgroundColor: '#012A46', // Cor de fundo de fallback
                }}
            >
                {/* O conteúdo da seção agora fica sobre a imagem de fundo */}
                <section className="bg-black/50 backdrop-blur-sm max-w-2xl p-8 m-4 rounded-xl text-center"> {/* Ajustei o fundo da seção para melhor contraste */}
                    <h1 className="mb-4 text-4xl font-bold">Bem-vindo à Oficina Virtual</h1>
                    <p className="mb-8 text-lg">
                        Descubra uma nova forma de cuidar do seu veículo com praticidade e eficiência. Experimente nossa plataforma e agende seu serviço online.
                    </p>
                    {/* Você precisa adicionar o texto ou ícone do botão aqui */}
                    <button className="px-6 py-3 font-semibold text-white transition bg-[#075985] rounded-md shadow hover:bg-[#075985]/90">
                        Agendar Serviço {/* Exemplo de texto para o botão */}
                    </button>
                </section>
            </main>
            {/* --- Fim das Modificações --- */}
        </>
    );
}