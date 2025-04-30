// src/app/veiculo/alterar/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar'; // Ajuste o path

// Defina ou importe as interfaces aqui
interface VeiculoResponse { id: number; tipoVeiculo: string; renavam: string; placa: string; modelo: string; proprietario: string; montadora: string; cor: string; motor: string; anoFabricacao: string; }
interface VeiculoFormData { tipoVeiculo: string; renavam: string; placa: string; modelo: string; proprietario: string; montadora: string; cor: string; motor: string; anoFabricacao: string; }

// --- LISTA EXPANDIDA DE MONTADORAS (IDÊNTICA AO CADASTRO) ---
const montadoras = [
    "Agrale", "Aston Martin", "Audi", "Bentley", "BMW", "BYD",
    "CAOA Chery", "Chery", "Chevrolet", "Chrysler", "Citroën",
    "Dodge", "Effa", "Ferrari", "Fiat", "Ford",
    "GMC", "GWM", "Hafei", "Honda", "Hyundai",
    "Iveco", "Jac", "Jaguar", "Jeep", "Jinbei",
    "Kia", "Lamborghini", "Land Rover", "Lexus", "Lifan",
    "Maserati", "Mercedes-AMG", "Mercedes-Benz", "Mini", "Mitsubishi",
    "Nissan", "Peugeot", "Porsche",
    "RAM", "Renault", "Rolls-Royce",
    "Shineray", "SsangYong", "Subaru", "Suzuki",
    "Toyota", "Troller",
    "Volkswagen", "Volvo",
    "Outra"
].sort();
// -------------------------------------------------------------

// Opções de exemplo para outros selects (IDÊNTICO AO CADASTRO)
const tiposVeiculo = ["Carro", "Moto", "Caminhão", "Ônibus", "Utilitário", "Outro"];
const cores = ["Preto", "Branco", "Prata", "Cinza", "Vermelho", "Azul", "Verde", "Amarelo", "Marrom", "Bege", "Dourado", "Laranja", "Roxo", "Vinho", "Outra"];

export default function AlterarVeiculoPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [formData, setFormData] = useState<VeiculoFormData>({
        tipoVeiculo: '', renavam: '', placa: '', modelo: '', proprietario: '',
        montadora: '', cor: '', motor: '', anoFabricacao: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [originalData, setOriginalData] = useState<VeiculoResponse | null>(null);

    // Busca dados do veículo (sem alterações na lógica)
    useEffect(() => {
        if (!id) { setError("ID do veículo não fornecido."); setIsFetching(false); return; }
        const fetchVeiculo = async () => {
            setIsFetching(true); setError(null);
            const apiUrl = `http://localhost:8080/rest/veiculo/${id}`;
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) { throw new Error(`Erro ao buscar veículo ${id}: ${response.status}`); }
                const data: VeiculoResponse = await response.json();
                setOriginalData(data);
                setFormData({
                    tipoVeiculo: data.tipoVeiculo || '', renavam: data.renavam || '',
                    placa: data.placa || '', modelo: data.modelo || '',
                    proprietario: data.proprietario || '', montadora: data.montadora || '',
                    cor: data.cor || '', motor: data.motor || '',
                    anoFabricacao: data.anoFabricacao || '',
                });
            } catch (err: any) { setError(err.message || "Falha ao carregar dados."); }
            finally { setIsFetching(false); }
        };
        fetchVeiculo();
    }, [id]);

    // Handler genérico (sem alterações)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Submete a atualização (sem alterações na lógica)
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setIsLoading(true); setError(null);
        const apiUrl = `http://localhost:8080/rest/veiculo/${id}`;
        try {
            const response = await fetch(apiUrl, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(formData),
            });
            if (!response.ok) { throw new Error(`Erro ao atualizar veículo ${id}: ${response.status}`); }
            router.push('/veiculo/listar');
        } catch (err: any) { setError(err.message || "Falha ao atualizar."); }
        finally { setIsLoading(false); }
    };

    // Renderização condicional (sem alterações)
    if (isFetching) { /* ... JSX de carregando ... */
        return (
            <>
                <NavBar active="veiculo" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                    <p className="text-sky-300">Carregando dados do veículo...</p>
                </main>
            </>
        );
    }
    if (error && !isFetching && !originalData) { /* ... JSX de erro ao carregar ... */
        return (
            <>
                <NavBar active="veiculo" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                    <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
                        <h1 className="text-xl font-bold mb-4 text-red-400">Erro ao Carregar Veículo</h1>
                        <p className="mb-4 text-red-300">{error}</p>
                        <Link href="/veiculo/listar">
                            <button className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow">Voltar para Lista</button>
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    // Renderização do formulário (com a lista de montadoras atualizada)
    return (
        <>
            <NavBar active="veiculo-alterar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">Alterar Veículo (ID: {id})</h1>
                    {error && ( /* Erro do submit */
                        <div className="mb-4 text-red-400 bg-red-900/50 p-3 rounded border border-red-500 text-sm">{error}</div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* --- Seção: Detalhes do Veículo --- */}
                        <section>
                            <h2 className="text-xl font-semibold text-sky-300 mb-4 border-b border-slate-700 pb-2">Detalhes do Veículo</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <label htmlFor="tipoVeiculo" className="block text-sm font-medium text-slate-300 mb-1">Tipo Veículo</label>
                                    <select id="tipoVeiculo" name="tipoVeiculo" value={formData.tipoVeiculo} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500">
                                        <option value="" disabled>Selecione o tipo</option>
                                        {tiposVeiculo.map(tipo => (<option key={tipo} value={tipo}>{tipo}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="modelo" className="block text-sm font-medium text-slate-300 mb-1">Modelo</label>
                                    <input type="text" id="modelo" name="modelo" value={formData.modelo} onChange={handleChange} required maxLength={100} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                                </div>
                                {/* --- SELECT MONTADORA ATUALIZADO --- */}
                                <div>
                                    <label htmlFor="montadora" className="block text-sm font-medium text-slate-300 mb-1">Montadora</label>
                                    <select id="montadora" name="montadora" value={formData.montadora} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500">
                                        <option value="" disabled>Selecione a montadora</option>
                                        {montadoras.map(m => (<option key={m} value={m}>{m}</option>))}
                                    </select>
                                </div>
                                {/* ----------------------------------- */}
                                <div>
                                    <label htmlFor="anoFabricacao" className="block text-sm font-medium text-slate-300 mb-1">Ano Fabricação</label>
                                    <input type="date" id="anoFabricacao" name="anoFabricacao" value={formData.anoFabricacao} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                                </div>
                                <div>
                                    <label htmlFor="cor" className="block text-sm font-medium text-slate-300 mb-1">Cor</label>
                                    <select id="cor" name="cor" value={formData.cor} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500">
                                        <option value="" disabled>Selecione a cor</option>
                                        {cores.map(c => (<option key={c} value={c}>{c}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="motor" className="block text-sm font-medium text-slate-300 mb-1">Motor</label>
                                    <input type="text" id="motor" name="motor" value={formData.motor} onChange={handleChange} required maxLength={50} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                                </div>
                            </div>
                        </section>

                        {/* --- Seção: Identificação --- */}
                        <section>
                            <h2 className="text-xl font-semibold text-sky-300 mb-4 border-b border-slate-700 pb-2">Identificação</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <label htmlFor="placa" className="block text-sm font-medium text-slate-300 mb-1">Placa</label>
                                    <input type="text" id="placa" name="placa" placeholder="AAA1234 ou ABC1D23" value={formData.placa} onChange={handleChange} required maxLength={7} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                                </div>
                                <div>
                                    <label htmlFor="renavam" className="block text-sm font-medium text-slate-300 mb-1">Renavam</label>
                                    <input type="text" id="renavam" name="renavam" placeholder="Apenas números" value={formData.renavam} onChange={handleChange} required maxLength={13} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="proprietario" className="block text-sm font-medium text-slate-300 mb-1">Proprietário</label>
                                    <input type="text" id="proprietario" name="proprietario" value={formData.proprietario} onChange={handleChange} required maxLength={50} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                                </div>
                            </div>
                        </section>

                        {/* Botões */}
                        <div className="flex justify-end gap-4 pt-6">
                            <Link href="/veiculo/listar"><button type="button" className="px-5 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md shadow">Cancelar</button></Link>
                            <button type="submit" disabled={isLoading || isFetching} className={`px-5 py-2 font-semibold rounded-md shadow ${isLoading || isFetching ? 'bg-sky-800 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}>{isLoading ? 'Atualizando...' : 'Atualizar Veículo'}</button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
} // <<< FIM DO ARQUIVO