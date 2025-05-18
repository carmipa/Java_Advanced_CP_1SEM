// src/app/veiculo/listar/page.tsx (COM ORDENAÇÃO POR ID)
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar'; // Ajuste o path se necessário
import { fetchAuthenticated } from '@/utils/apiService'; // <<< ADICIONADO PARA CHAMADAS AUTENTICADAS
// Importando Ícones Lucide e React-Icons
import {
    Car,
    Hash,
    Palette,
    Calendar,
    User,
    Building,
    Settings,
    Info,
    CirclePlus,
    Search,
    Edit3,
    Trash2,
    ListChecks,
    ScanLine as ScanLicense
} from 'lucide-react';
import { MdBadge, MdErrorOutline } from 'react-icons/md'; // Usando MdBadge para placa/renavam

// --- Interface ---
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
    anoFabricacao: string; // Espera-se formatar na exibição
}

export default function ListarVeiculosPage() {
    const [veiculos, setVeiculos] = useState<VeiculoResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // --- Fetch dos veículos ---
    useEffect(() => {
        const fetchVeiculos = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // <<< USANDO fetchAuthenticated EM VEZ DE fetch >>>
                const response = await fetchAuthenticated('/rest/veiculo/all');
                if (!response.ok) {
                    let errorMsg = `Erro HTTP ${response.status}: ${response.statusText}`;
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.message || errorMsg;
                    } catch {
                        // sem JSON de erro
                    }
                    throw new Error(errorMsg);
                }

                if (response.status === 204) {
                    setVeiculos([]);
                } else {
                    const data: VeiculoResponse[] = await response.json();
                    // <<< ORDENAÇÃO POR ID ADICIONADA AQUI >>>
                    const sortedData = (data || []).sort((a, b) => a.id - b.id);
                    setVeiculos(sortedData);
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
    }, []); // Roda apenas na montagem

    // --- Navegação para delete ---
    const navigateToDelete = (id: number) => {
        if (id == null) {
            console.error("Tentativa de navegar para deletar com ID inválido:", id);
            setError("Não é possível deletar: ID do veículo inválido na lista.");
            return;
        }
        if (window.confirm(`Tem certeza que deseja excluir o veículo ID: ${id}?`)) {
            router.push(`/veiculo/deletar/${id}`);
        }
    };

    // Helper para formatar data
    const formatarData = (dataString: string | null | undefined): string => {
        if (!dataString) return '-';
        try {
            return new Date(dataString + 'T00:00:00Z')
                .toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch {
            return 'Inválida';
        }
    };

    return (
        <>
            <NavBar active="veiculo-listar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Cabeçalho e Botões */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-center sm:text-left">
                        <Car size={28} className="text-sky-400" /> Lista de Veículos Cadastrados
                    </h1>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <Link href="/veiculo/cadastrar">
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow whitespace-nowrap">
                                <CirclePlus size={18} /> Novo Veículo
                            </button>
                        </Link>
                        <Link href="/veiculo/buscar">
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow whitespace-nowrap">
                                <Search size={18} /> Buscar Veículo
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Mensagens */}
                {isLoading && (
                    <p className="text-center text-sky-300 py-10">Carregando veículos...</p>
                )}
                {error && (
                    <div
                        className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500 max-w-3xl mx-auto"
                        role="alert"
                    >
                        <MdErrorOutline className="inline mr-2" />
                        {error}
                        <button
                            type="button"
                            className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200"
                            onClick={() => setError(null)}
                            aria-label="Fechar"
                        >
                            <span className="text-2xl" aria-hidden="true">
                                &times;
                            </span>
                        </button>
                    </div>
                )}

                {/* <<< Lista de Cards >>> */}
                {!isLoading && !error && (
                    <div>
                        {veiculos.length === 0 ? (
                            <p className="text-center text-slate-400 py-10">
                                Nenhum veículo cadastrado.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {veiculos.map((veiculo) => {
                                    const isIdValid = veiculo.id != null;
                                    return (
                                        <div
                                            key={isIdValid ? veiculo.id : `invalid-${Math.random()}`}
                                            className={`bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20 transition-shadow duration-300 ${
                                                !isIdValid ? 'opacity-50' : ''
                                            }`}
                                        >
                                            {/* Header do Card */}
                                            <div className="bg-slate-700 p-3 flex justify-between items-center text-sm">
                                                <span className="flex items-center gap-1 font-semibold text-sky-300">
                                                    <Hash size={16} /> ID: {isIdValid ? veiculo.id : 'Inválido'}
                                                </span>
                                                <span className="flex items-center gap-1 text-slate-400">
                                                    <Car size={16} /> {veiculo.tipoVeiculo || '-'}
                                                </span>
                                            </div>

                                            {/* Corpo do Card */}
                                            <div className="p-4 space-y-2 flex-grow text-sm">
                                                <p title={veiculo.modelo}>
                                                    <strong>
                                                        <Info size={16} className="inline -mt-1 mr-1" />
                                                        Modelo:
                                                    </strong>{' '}
                                                    {veiculo.modelo || '-'} ({veiculo.montadora || '-'})
                                                </p>
                                                <p title={veiculo.placa}>
                                                    <strong>
                                                        <MdBadge className="inline -mt-1 mr-1" />
                                                        Placa:
                                                    </strong>{' '}
                                                    <span className="font-mono bg-slate-700 px-1 rounded">
                                                        {veiculo.placa || '-'}
                                                    </span>
                                                </p>
                                                <p>
                                                    <strong>
                                                        <Palette size={16} className="inline -mt-1 mr-1" />
                                                        Cor:
                                                    </strong>{' '}
                                                    {veiculo.cor || '-'}
                                                </p>
                                                <p>
                                                    <strong>
                                                        <Calendar size={16} className="inline -mt-1 mr-1" />
                                                        Ano:
                                                    </strong>{' '}
                                                    {formatarData(veiculo.anoFabricacao)}
                                                </p>
                                                <p>
                                                    <strong>
                                                        <Settings size={16} className="inline -mt-1 mr-1" />
                                                        Motor:
                                                    </strong>{' '}
                                                    {veiculo.motor || '-'}
                                                </p>
                                                <p>
                                                    <strong>
                                                        <Hash size={16} className="inline -mt-1 mr-1" />
                                                        Renavam:
                                                    </strong>{' '}
                                                    {veiculo.renavam || '-'}
                                                </p>
                                                <p title={veiculo.proprietario}>
                                                    <strong>
                                                        <User size={16} className="inline -mt-1 mr-1" />
                                                        Proprietário:
                                                    </strong>{' '}
                                                    {veiculo.proprietario || '-'}
                                                </p>
                                            </div>

                                            {/* Footer do Card (Ações) */}
                                            <div className="bg-slate-900 p-3 mt-auto border-t border-slate-700 flex justify-end gap-2">
                                                {isIdValid ? (
                                                    <>
                                                        <Link href={`/veiculo/alterar/${veiculo.id}`}>
                                                            <button className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-xs font-medium gap-1">
                                                                <Edit3 size={14} /> Editar
                                                            </button>
                                                        </Link>
                                                        <button
                                                            onClick={() => navigateToDelete(veiculo.id)}
                                                            className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium gap-1"
                                                        >
                                                            <Trash2 size={14} /> Deletar
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-red-400 italic">
                                                        ID Inválido
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
                {/* <<< Fim da Lista de Cards >>> */}
            </main>
        </>
    );
}
