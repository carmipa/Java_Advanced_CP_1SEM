// /src/app/veiculo/listar/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar'; // Ajuste o path se necessário

// Defina ou importe a interface (se você não criou /types/veiculo.ts)
interface VeiculoResponse {
    id: number;
    tipoVeiculo: string;
    renavam: string;
    placa: string;
    modelo: string;
    proprietario: string;
    montadora: string;
    cor: string;
    motor: string;
    anoFabricacao: string;
}
// Ou importe se o arquivo existe:
// import { VeiculoResponse } from '@/types/veiculo';


export default function ListarVeiculosPage() {
    const [veiculos, setVeiculos] = useState<VeiculoResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // --- Fetch direto no useEffect ---
    useEffect(() => {
        const fetchVeiculos = async () => {
            setIsLoading(true);
            setError(null);
            const apiUrl = `http://localhost:8080/rest/veiculo/all`;
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    let errorMsg = `Erro HTTP ${response.status}: ${response.statusText}`;
                    try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {}
                    throw new Error(errorMsg);
                }
                if (response.status === 204) {
                    setVeiculos([]);
                } else {
                    const data: VeiculoResponse[] = await response.json();
                    setVeiculos(data || []);
                }
            } catch (err: any) {
                setError(err.message || "Falha ao carregar veículos.");
                console.error("Erro ao buscar veículos:", err);
                setVeiculos([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVeiculos();
    }, []);

    const navigateToDelete = (id: number) => {
        if (!id && id !== 0) {
            console.error("Tentativa de navegar para deletar com ID inválido:", id);
            setError("Não é possível deletar: ID do veículo inválido na lista.");
            return;
        }
        router.push(`/veiculo/deletar/${id}`);
    };

    return (
        <>
            <NavBar active="veiculo-listar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Cabeçalho e Botões - BOTÃO "NOVO VEÍCULO" REMOVIDO */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-center sm:text-left">Lista de Veículos</h1>
                    <div className="flex gap-2 flex-wrap justify-center">
                        {/* O botão "Novo Veículo" foi removido daqui */}
                        <Link href="/veiculo/buscar">
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow whitespace-nowrap">
                                Buscar Veículo
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Mensagens */}
                {error && (
                    <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                        <span className="block sm:inline">{error}</span>
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-2xl" aria-hidden="true">&times;</span></button>
                    </div>
                )}

                {/* Tabela de Veículos */}
                {isLoading ? (
                    <p className="text-center text-sky-300 py-10">Carregando veículos...</p>
                ) : (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                {/* Colunas */}
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ID</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Tipo</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Placa</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Modelo</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Montadora</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Cor</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Ano</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Proprietário</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Renavam</th>
                                <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {veiculos.length === 0 ? (
                                <tr><td colSpan={10} className="px-6 py-4 text-center text-slate-400">Nenhum veículo encontrado.</td></tr>
                            ) : (
                                veiculos.map((veiculo, index) => {
                                    const isIdValid = veiculo.id !== null && veiculo.id !== undefined;
                                    if (!isIdValid) { console.error("Veículo com ID inválido:", veiculo); }
                                    const rowClass = index % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50';

                                    return (
                                        <tr key={isIdValid ? veiculo.id : `invalid-${index}`} className={`${rowClass} hover:bg-sky-900/50 ${!isIdValid ? 'opacity-50' : ''}`}>
                                            {/* Células */}
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{isIdValid ? veiculo.id : 'Inválido'}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{veiculo.tipoVeiculo || '-'}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-mono">{veiculo.placa || '-'}</td>
                                            <td className="px-4 sm:px-6 py-4 text-sm whitespace-normal break-words min-w-[150px]">{veiculo.modelo || '-'}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{veiculo.montadora || '-'}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{veiculo.cor || '-'}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{veiculo.anoFabricacao ? veiculo.anoFabricacao.split('-')[0] : '-'}</td>
                                            <td className="px-4 sm:px-6 py-4 text-sm whitespace-normal break-words min-w-[150px]">{veiculo.proprietario || '-'}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{veiculo.renavam || '-'}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center text-sm space-x-2">
                                                {isIdValid ? (
                                                    <>
                                                        <Link href={`/veiculo/alterar/${veiculo.id}`}><button className="px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded">Editar</button></Link>
                                                        <button onClick={() => navigateToDelete(veiculo.id)} className="px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm bg-red-600 hover:bg-red-700 text-white rounded">Deletar</button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-red-400">ID Inválido</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </>
    );
}