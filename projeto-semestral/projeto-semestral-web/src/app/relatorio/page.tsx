// app/relatorio/page.tsx
import Link from 'next/link';
import NavBar from '@/components/nav-bar'; // Ajuste o caminho se necessário

export default function RelatoriosPage() {
    return (
        <>
            <NavBar active="relatorio"/> {/* Marca "Relatório" como ativo aqui */}
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="text-3xl font-bold mb-8 text-center">Central de Relatórios</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card para Agendamentos Futuros */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg hover:shadow-sky-500/30 transition-shadow">
                        <h2 className="text-xl font-semibold mb-3 text-sky-400">Agendamentos Futuros</h2>
                        <p className="text-slate-300 mb-4">Visualize os próximos agendamentos registrados.</p>
                        {/* Link correto para a subpasta */}
                        <Link href="/relatorio/agendamentos-futuros">
                            <button className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500">
                                Ver Relatório
                            </button>
                        </Link>
                    </div>

                    {/* Card para Contagem Mensal (Exemplo) */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg hover:shadow-sky-500/30 transition-shadow">
                        <h2 className="text-xl font-semibold mb-3 text-sky-400">Contagem Mensal</h2>
                        <p className="text-slate-300 mb-4">Veja a quantidade de agendamentos por mês.</p>
                        {/* Link correto para a subpasta */}
                        <Link href="/relatorio/contagem-mensal">
                            <button className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500">
                                Ver Relatório
                            </button>
                        </Link>
                    </div>

                    {/* Card para Histórico por Cliente (Exemplo) */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg hover:shadow-sky-500/30 transition-shadow">
                        <h2 className="text-xl font-semibold mb-3 text-sky-400">Histórico por Cliente</h2>
                        <p className="text-slate-300 mb-4">Consulte o histórico de agendamentos de um cliente.</p>
                        {/* Link correto para a subpasta */}
                        <Link href="/relatorio/historico-cliente">
                            <button className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500">
                                Ver Relatório
                            </button>
                        </Link>
                    </div>

                    {/* Card para Serviços Agendados (Exemplo) */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg hover:shadow-sky-500/30 transition-shadow">
                        <h2 className="text-xl font-semibold mb-3 text-sky-400">Serviços Agendados</h2>
                        <p className="text-slate-300 mb-4">Detalhes dos serviços e diagnósticos agendados.</p>
                        {/* Link correto para a subpasta */}
                        <Link href="/relatorio/servicos-agendados">
                            <button className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-sky-500">
                                Ver Relatório
                            </button>
                        </Link>
                    </div>

                    {/* Adicione mais cards para outros relatórios aqui */}

                </div>
            </main>
        </>
    );
}