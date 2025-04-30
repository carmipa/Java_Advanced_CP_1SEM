// src/app/veiculo/deletar/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar'; // Ajuste o path

// Defina ou importe a interface aqui
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

export default function DeletarVeiculoPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [veiculo, setVeiculo] = useState<VeiculoResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Busca dados para confirmação
    useEffect(() => {
        if (!id) {
            setError("ID do veículo não fornecido.");
            setIsFetching(false);
            return;
        }
        const fetchVeiculo = async () => {
            setIsFetching(true);
            setError(null);
            const apiUrl = `http://localhost:8080/rest/veiculo/${id}`; // Endpoint GET por ID
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    let errorMsg = `Erro ao buscar veículo ${id}: ${response.status}`;
                    try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {}
                    throw new Error(errorMsg);
                }
                const data: VeiculoResponse = await response.json();
                setVeiculo(data);
            } catch (err: any) {
                setError(err.message || "Falha ao carregar dados do veículo para exclusão.");
                console.error("Erro ao buscar veículo:", err);
                setVeiculo(null);
            } finally {
                setIsFetching(false);
            }
        };
        fetchVeiculo();
    }, [id]);

    // Executa a exclusão
    const handleDelete = async () => {
        if (!id) { setError("ID inválido para exclusão."); return; }
        setIsLoading(true);
        setError(null);
        const apiUrl = `http://localhost:8080/rest/veiculo/${id}`; // Endpoint DELETE
        try {
            const response = await fetch(apiUrl, { method: 'DELETE' });
            if (!response.ok) {
                let errorMsg = `Erro ${response.status} ao deletar veículo.`;
                if(response.status === 404) errorMsg = "Veículo não encontrado para exclusão.";
                try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {}
                throw new Error(errorMsg);
            }
            if (response.status === 204) { // No Content = Sucesso
                console.log('Veículo deletado com sucesso!');
                router.push('/veiculo/listar');
            } else {
                console.warn("Resposta inesperada após DELETE:", response.status);
                router.push('/veiculo/listar');
            }
        } catch (err: any) {
            setError(err.message || "Falha ao deletar veículo.");
            console.error("Erro ao deletar veículo:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Renderização condicional
    if (isFetching) {
        return (
            <>
                <NavBar active="veiculo" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                    <p className="text-sky-300">Carregando dados para confirmação...</p>
                </main>
            </>
        );
    }
    if (!veiculo) { // Erro ao buscar
        return (
            <>
                <NavBar active="veiculo" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                    <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg max-w-lg mx-auto text-center">
                        <h1 className="text-xl font-bold mb-4 text-red-400">Erro</h1>
                        <p className="mb-4 text-red-300">{error || "Não foi possível carregar os dados do veículo."}</p>
                        <Link href="/veiculo/listar">
                            <button className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow">Voltar para Lista</button>
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    // Página de confirmação
    return (
        <>
            <NavBar active="veiculo" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg max-w-lg mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center text-red-400">Confirmar Exclusão</h1>
                    <p className="text-center mb-6 text-slate-300">Tem certeza que deseja excluir o veículo abaixo? Esta ação não pode ser desfeita.</p>
                    <div className="mb-6 p-4 bg-slate-800 rounded border border-slate-700 text-sm">
                        <p><strong>ID:</strong> {veiculo.id}</p>
                        <p><strong>Placa:</strong> {veiculo.placa}</p>
                        <p><strong>Modelo:</strong> {veiculo.modelo}</p>
                        <p><strong>Proprietário:</strong> {veiculo.proprietario}</p>
                    </div>
                    {error && (
                        <div className="mb-4 text-red-400 bg-red-900/50 p-3 rounded border border-red-500 text-sm">{error}</div>
                    )}
                    <div className="flex justify-center gap-4">
                        <Link href="/veiculo/listar">
                            <button type="button" className="px-5 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md shadow" disabled={isLoading}>Cancelar</button>
                        </Link>
                        <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className={`px-5 py-2 font-semibold rounded-md shadow ${isLoading ? 'bg-red-800 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            {isLoading ? 'Excluindo...' : 'Excluir Veículo'}
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
} // <<< FIM DO ARQUIVO - Sem chaves extras