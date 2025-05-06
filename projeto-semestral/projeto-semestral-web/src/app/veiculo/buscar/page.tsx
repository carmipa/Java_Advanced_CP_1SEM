// --- Arquivo: src/app/veiculo/buscar/page.tsx (Refatorado com Cards e Novos Filtros) ---
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar'; // Ajuste o path se necessário
// Importando Ícones (Adicionado Filter)
import { Car, Hash, Palette, Calendar, User, Building, Settings, Info, Search, Edit3, Trash2, ListChecks, ScanLine as ScanLicense, Filter } from 'lucide-react';
import { MdBadge, MdErrorOutline } from 'react-icons/md';

// --- Interfaces ---
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

// <<< Tipo de busca ATUALIZADO >>>
type SearchField = 'placa' | 'proprietario' | 'renavam';

export default function BuscarVeiculoPage() {
    const router = useRouter();
    const [searchField, setSearchField] = useState<SearchField>('placa'); // Inicia com 'placa'
    const [searchValue, setSearchValue] = useState('');

    const [todosVeiculos, setTodosVeiculos] = useState<VeiculoResponse[]>([]); // Nome corrigido
    const [resultadosBusca, setResultadosBusca] = useState<VeiculoResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false); // Loading inicial
    const [isSearching, setIsSearching] = useState(false); // Loading da busca/filtro
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // --- Fetch inicial de todos os veículos ---
    const fetchTodasVeiculos = async () => {
        if (todosVeiculos.length > 0 && !isLoading) return;
        setIsLoading(true); setError(null);
        const apiUrl = `http://localhost:8080/rest/veiculo/all`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) { let errorMsg = `Erro HTTP ${response.status}: ${response.statusText}`; try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {} throw new Error(errorMsg); }
            if (response.status === 204) { setTodosVeiculos([]); }
            else { const data: VeiculoResponse[] = await response.json(); setTodosVeiculos(data || []); }
            console.log(`Carregados ${todosVeiculos.length} veículos para busca local.`);
        } catch (err: any) { setError(err.message || "Falha ao carregar dados base de veículos."); console.error("Erro:", err); setTodosVeiculos([]);
        } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchTodasVeiculos(); }, []);

    // Handlers do formulário
    const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSearchField(e.target.value as SearchField);
        setSearchValue(''); setError(null); setResultadosBusca([]); setHasSearched(false);
    };
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSearchValue(e.target.value); };

    // --- Lógica de busca (CLIENT-SIDE FILTERING ATUALIZADA) ---
    const handleSearch = (event?: FormEvent<HTMLFormElement>) => {
        if (event) event.preventDefault();
        setIsSearching(true); setHasSearched(true); setError(null); setResultadosBusca([]);

        if (todosVeiculos.length === 0 && !isLoading) {
            fetchTodasVeiculos().then(() => performSearch());
            return;
        }
        performSearch();
    };

    const performSearch = () => {
        const query = searchValue.trim().toLowerCase();
        console.log(`Filtrando ${todosVeiculos.length} veículos por ${searchField} contendo '${query}'`);

        if (!query) { // Se a busca for vazia, mostra nada
            setResultadosBusca([]); setIsSearching(false); return;
        }

        let resultados: VeiculoResponse[] = [];
        switch (searchField) {
            case 'placa':
                // Busca case-insensitive e remove caracteres não alfanuméricos da placa para comparação flexível
                const placaQuery = query.replace(/[^a-z0-9]/gi, '');
                resultados = todosVeiculos.filter(v => v.placa?.replace(/[^a-z0-9]/gi, '').toLowerCase().includes(placaQuery));
                break;
            case 'proprietario':
                resultados = todosVeiculos.filter(v => v.proprietario?.toLowerCase().includes(query));
                break;
            // <<< REMOVIDO CASO 'modelo' >>>
            case 'renavam': // <<< ADICIONADO CASO 'renavam' >>>
                // Busca case-insensitive e remove caracteres não numéricos do renavam
                const renavamQuery = query.replace(/\D/g, '');
                resultados = todosVeiculos.filter(v => v.renavam?.replace(/\D/g, '').includes(renavamQuery));
                break;
            default:
                resultados = [];
        }
        console.log(`Encontrados ${resultados.length} resultados.`);
        setResultadosBusca(resultados);
        setIsSearching(false);
    };
    // --- Fim da Lógica de Busca ---

    // Navegação para delete (simulada)
    const navigateToDelete = (id: number) => {
        if (window.confirm(`Tem certeza que deseja excluir o veículo ID: ${id}?`)) {
            alert(`Exclusão do veículo ${id} não implementada neste exemplo.`);
            // Implementar delete real aqui (API call + remover das listas 'todosVeiculos' e 'resultadosBusca')
        }
    };

    // Helper para formatar data
    const formatarData = (dataString: string | null | undefined): string => {
        if (!dataString) return '-';
        try { return new Date(dataString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }); }
        catch (e) { return 'Inválida'; }
    };

    // Placeholder dinâmico ATUALIZADO
    const getPlaceholder = (): string => {
        switch (searchField) {
            case 'placa': return 'Digite parte da placa...';
            case 'proprietario': return 'Digite parte do nome...';
            case 'renavam': return 'Digite parte do renavam...'; // Placeholder para Renavam
            default: return 'Digite o termo...';
        }
    }

    return (
        <>
            <NavBar active="veiculo-buscar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="flex items-center justify-center text-2xl md:text-3xl font-bold mb-8 gap-2"> <Search size={28} className="text-sky-400"/> Buscar Veículos </h1>

                {/* Formulário de Busca ATUALIZADO */}
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg max-w-4xl mx-auto mb-8">
                    <form onSubmit={handleSearch}>
                        <div className="flex flex-wrap items-end gap-4">
                            {/* Select Tipo de Busca ATUALIZADO */}
                            <div className="flex-shrink-0 w-full sm:w-auto">
                                <label htmlFor="searchField" className="flex items-center gap-1 block text-sm font-medium text-slate-300 mb-1"><Filter size={16}/>Buscar por:</label>
                                <select
                                    id="searchField" name="searchField" value={searchField}
                                    onChange={handleFieldChange}
                                    className="w-full sm:w-48 h-10 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value="placa">Placa</option>
                                    <option value="proprietario">Proprietário</option>
                                    <option value="renavam">Renavam</option> {/* Removido Modelo, Adicionado Renavam */}
                                </select>
                            </div>
                            {/* Input Termo de Busca */}
                            <div className="flex-grow min-w-[200px]">
                                <label htmlFor="searchValue" className="block text-sm font-medium text-slate-300 mb-1">Termo:</label>
                                <input
                                    type="text" id="searchValue" name="searchValue"
                                    value={searchValue} onChange={handleValueChange}
                                    required={searchField === 'placa' || searchField === 'renavam'} // Placa e Renavam podem requerer valor
                                    placeholder={getPlaceholder()}
                                    className="w-full h-10 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            {/* Botão Buscar */}
                            <div className="flex-shrink-0">
                                <button type="submit" disabled={isLoading || isSearching} className={`h-10 px-5 py-2 font-semibold rounded-md shadow flex items-center justify-center ${isLoading || isSearching ? 'bg-sky-800 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}>
                                    <Search size={18} className="mr-2"/> {isSearching ? 'Buscando...' : 'Buscar'}
                                </button>
                            </div>
                        </div>
                        {error && ( <p className="mt-3 text-sm text-red-400 flex items-center gap-1"><MdErrorOutline/>{error}</p> )}
                    </form>
                </div>

                {/* Loading Inicial */}
                {isLoading && <p className="text-center text-sky-300 py-10">Carregando dados base...</p>}

                {/* <<< Área de Resultados com Cards >>> */}
                {!isLoading && hasSearched && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4 text-center text-sky-300">Resultados da Busca</h2>
                        {isSearching ? (
                            <p className="text-center text-sky-300 py-10">Filtrando...</p>
                        ) : resultadosBusca.length === 0 ? (
                            <p className="text-center text-slate-400 py-10">Nenhum veículo encontrado para os critérios informados.</p>
                        ) : (
                            // Grid Layout para os Cards (Multi-coluna)
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {resultadosBusca.map((veiculo) => { // Mapeia sobre resultadosBusca
                                    const isIdValid = veiculo.id !== null && veiculo.id !== undefined;
                                    return (
                                        // Card Individual (Estrutura idêntica à da ListarVeiculosPage)
                                        <div key={isIdValid ? veiculo.id : `invalid-${Math.random()}`} className={`bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20 transition-shadow duration-300 ${!isIdValid ? 'opacity-50' : ''}`}>
                                            {/* Header do Card */}
                                            <div className="bg-slate-700 p-3 flex justify-between items-center text-sm"> <span className="flex items-center gap-1 font-semibold text-sky-300"> <Hash size={16} /> ID: {isIdValid ? veiculo.id : 'Inválido'} </span> <span className="flex items-center gap-1 text-slate-400"> <Car size={16} /> {veiculo.tipoVeiculo || '-'} </span> </div>
                                            {/* Corpo do Card */}
                                            <div className="p-4 space-y-2 flex-grow text-sm">
                                                <p title={veiculo.placa}><strong><MdBadge className="inline -mt-1 mr-1"/> Placa:</strong> <span className="font-mono bg-slate-700 px-1 rounded">{veiculo.placa || '-'}</span></p>
                                                <p title={veiculo.modelo}><strong><Info size={16} className="inline -mt-1 mr-1"/> Modelo:</strong> {veiculo.modelo || '-'} ({veiculo.montadora || '-'})</p>
                                                <p><strong><Palette size={16} className="inline -mt-1 mr-1"/> Cor:</strong> {veiculo.cor || '-'}</p>
                                                <p><strong><Calendar size={16} className="inline -mt-1 mr-1"/> Ano:</strong> {formatarData(veiculo.anoFabricacao)}</p>
                                                <p><strong><Settings size={16} className="inline -mt-1 mr-1"/> Motor:</strong> {veiculo.motor || '-'}</p>
                                                <p><strong><Hash size={16} className="inline -mt-1 mr-1"/> Renavam:</strong> {veiculo.renavam || '-'}</p>
                                                <p title={veiculo.proprietario}><strong><User size={16} className="inline -mt-1 mr-1"/> Proprietário:</strong> {veiculo.proprietario || '-'}</p>
                                            </div>
                                            {/* Footer do Card (Ações) */}
                                            <div className="bg-slate-900 p-3 mt-auto border-t border-slate-700 flex justify-end gap-2">
                                                {isIdValid ? (
                                                    <>
                                                        <Link href={`/veiculo/alterar/${veiculo.id}`}> <button className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-xs font-medium gap-1"> <Edit3 size={14} /> Editar </button> </Link>
                                                        <button onClick={() => navigateToDelete(veiculo.id)} className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium gap-1"> <Trash2 size={14} /> Deletar </button>
                                                    </>
                                                ) : ( <span className="text-xs text-red-400 italic">ID Inválido</span> )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
                {/* <<< Fim da Área de Resultados >>> */}

                {/* Botão Voltar para Lista Completa (Opcional) */}
                <div className="mt-8 text-center">
                    <Link href="/veiculo/listar"> <button className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md shadow"> Voltar para Lista Completa </button> </Link>
                </div>
            </main>
        </>
    );
}