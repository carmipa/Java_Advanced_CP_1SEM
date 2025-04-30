// src/app/veiculo/buscar/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar'; // Ajuste o path se necessário

// Defina ou importe as interfaces aqui (ou de @/types/veiculo)
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

// Tipo para definir as opções de busca
type SearchField = 'placa' | 'proprietario' | 'modelo'; // Adicione 'modelo' se desejar

export default function BuscarVeiculoPage() {
    const router = useRouter();
    // Estado para o campo de busca selecionado
    const [searchField, setSearchField] = useState<SearchField>('placa'); // Inicia com 'placa'
    // Estado para o valor único de busca
    const [searchValue, setSearchValue] = useState('');

    const [results, setResults] = useState<VeiculoResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Handlers (sem alterações na lógica)
    const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSearchField(e.target.value as SearchField);
        setSearchValue(''); setError(null); setResults([]); setHasSearched(false);
    };
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    // Lógica de busca (sem alterações na lógica)
    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setIsLoading(true); setError(null); setResults([]); setHasSearched(true);
        if (!searchValue.trim()) { setError("Por favor, digite um valor para buscar."); setIsLoading(false); return; }
        const queryParams = new URLSearchParams();
        queryParams.append(searchField, searchValue.trim());
        const apiUrl = `http://localhost:8080/rest/veiculo/all?${queryParams.toString()}`;
        console.log("Buscando em:", apiUrl);
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                let errorMsg = `Erro HTTP ${response.status}: ${response.statusText}`;
                try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {}
                throw new Error(errorMsg);
            }
            if (response.status === 204) { setResults([]); }
            else { const data: VeiculoResponse[] = await response.json(); setResults(data || []); }
        } catch (err: any) {
            setError(err.message || "Falha ao buscar veículos."); console.error("Erro:", err); setResults([]);
        } finally { setIsLoading(false); }
    };

    const navigateToDelete = (id: number) => { router.push(`/veiculo/deletar/${id}`); };

    return (
        <>
            <NavBar active="veiculo-buscar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">Buscar Veículos</h1> {/* Aumentei margem inferior */}

                {/* Formulário de Busca Atualizado com Layout Horizontal */}
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg max-w-4xl mx-auto mb-8"> {/* Aumentei max-w */}
                    <form onSubmit={handleSearch}>
                        {/* Container Flex para alinhar horizontalmente */}
                        <div className="flex flex-wrap items-end gap-4"> {/* items-end para alinhar na base */}

                            {/* Grupo: Label + Select */}
                            <div className="flex-shrink-0"> {/* Evita que o select estique demais */}
                                <label htmlFor="searchField" className="block text-sm font-medium text-slate-300 mb-1">Buscar por:</label>
                                <select
                                    id="searchField"
                                    name="searchField"
                                    value={searchField}
                                    onChange={handleFieldChange}
                                    className="h-10 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" // Ajuste altura (h-10)
                                >
                                    <option value="placa">Placa</option>
                                    <option value="proprietario">Proprietário</option>
                                    <option value="modelo">Modelo</option>
                                </select>
                            </div>

                            {/* Grupo: Label + Input (ocupa espaço restante) */}
                            <div className="flex-grow"> {/* Faz o input ocupar o espaço */}
                                <label htmlFor="searchValue" className="block text-sm font-medium text-slate-300 mb-1">Termo de Busca:</label>
                                <input
                                    type="text"
                                    id="searchValue"
                                    name="searchValue"
                                    value={searchValue}
                                    onChange={handleValueChange}
                                    required
                                    placeholder={`Digite ${searchField === 'placa' ? 'a placa' : searchField === 'proprietario' ? 'parte do nome' : 'parte do modelo'}`}
                                    className="w-full h-10 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" // Ajuste altura (h-10)
                                />
                            </div>

                            {/* Botão Buscar */}
                            <div className="flex-shrink-0"> {/* Evita que o botão estique */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`h-10 px-5 py-2 font-semibold rounded-md shadow ${isLoading ? 'bg-sky-800 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`} // Ajuste altura (h-10)
                                >
                                    {isLoading ? 'Buscando...' : 'Buscar'}
                                </button>
                            </div>
                        </div>
                        {error && (
                            <p className="mt-3 text-sm text-red-400">{error}</p> // Erro abaixo do form
                        )}
                    </form>
                </div>

                {/* Área de Resultados (sem alterações na estrutura da tabela) */}
                {hasSearched && !isLoading && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Resultados da Busca</h2>
                        {results.length > 0 ? (
                            <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                                <table className="min-w-full table-auto">
                                    <thead className="bg-slate-800 border-b border-slate-700">
                                    <tr>{/* ... th iguais ao listar ... */}
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
                                    {results.map((veiculo, index) => {
                                        const isIdValid = veiculo.id !== null && veiculo.id !== undefined;
                                        if (!isIdValid) { console.error("Veículo com ID inválido:", veiculo); }
                                        const rowClass = index % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50';
                                        return (
                                            <tr key={isIdValid ? veiculo.id : `invalid-${index}`} className={`${rowClass} hover:bg-sky-900/50 ${!isIdValid ? 'opacity-50' : ''}`}>
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
                                                    ) : ( <span className="text-xs text-red-400">ID Inválido</span> )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            hasSearched && <p className="text-center text-slate-400 py-6">Nenhum veículo encontrado para os critérios informados.</p>
                        )}
                    </div>
                )}
                {isLoading && (
                    <p className="text-center text-sky-300 py-10">Buscando veículos...</p>
                )}

                <div className="mt-8 text-center">
                    <Link href="/veiculo/listar">
                        <button className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md shadow">
                            Voltar para Lista Completa
                        </button>
                    </Link>
                </div>
            </main>
        </>
    );
}