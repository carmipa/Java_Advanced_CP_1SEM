// src/app/page.tsx  (Substitua o conteúdo do seu page.tsx atual por este)
import NavBar from "@/components/nav-bar"; // Corrigido para NavBar

export default function HomePage() { // Renomeado para HomePage por clareza
    return (
        <>
            {/* Verifica se o NavBar está sendo importado corretamente */}
            <NavBar active="inicio" />

            {/* Conteúdo e Estilo da sua página de início original */}
            <main
                className="flex items-center justify-center min-h-screen text-white bg-cover bg-center bg-no-repeat"
                // Define a imagem de fundo
                style={{
                    backgroundImage: `url('/admin-ajax.png')`, // Caminho relativo à pasta /public
                    backgroundColor: '#012A46', // Cor de fundo fallback
                }}
            >
                {/* Conteúdo sobre a imagem */}
                <section className="bg-black/50 backdrop-blur-sm max-w-2xl p-8 m-4 rounded-xl text-center">
                    <h1 className="mb-4 text-4xl font-bold">Bem-vindo à Oficina Virtual</h1>
                    <p className="mb-8 text-lg">
                        Descubra uma nova forma de cuidar do seu veículo com praticidade e eficiência. Experimente nossa plataforma e agende seu serviço online.
                    </p>
                    {/* Verifique se o botão ou link desejado está aqui */}
                    <button className="px-6 py-3 font-semibold text-white transition bg-[#075985] rounded-md shadow hover:bg-[#075985]/90">
                        Agendar Serviço
                    </button>
                </section>
            </main>
        </>
    );
}