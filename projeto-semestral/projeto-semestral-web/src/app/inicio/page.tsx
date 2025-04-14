import NavBar from "@/components/nav-bar";

export default function InicioPage() {
    return (
        <>
            <NavBar active="inicio" />

            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white">
                <section className="bg-white/10 backdrop-blur-md max-w-2xl p-8 m-4 rounded-xl text-center">
                    <h1 className="mb-4 text-4xl font-bold">Bem-vindo à Oficina Virtual</h1>
                    <p className="mb-8 text-lg">
                        Descubra uma nova forma de cuidar do seu veículo com praticidade e eficiência. Experimente nossa plataforma e agende seu serviço online.
                    </p>
                    <button className="px-6 py-3 font-semibold text-white transition bg-[#075985] rounded-md shadow hover:bg-[#075985]/90">

                    </button>
                </section>
            </main>
        </>
    );
}
