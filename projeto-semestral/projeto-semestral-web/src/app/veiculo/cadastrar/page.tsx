// src/app/veiculo/cadastrar/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importar useRouter
import Link from 'next/link'; // Importar Link
import NavBar from '@/components/nav-bar'; // <<< 1. IMPORTAR A NAVBAR
import {
    Car,
    Hash,
    ScanLine as ScanLicense,
    Palette,
    Calendar,
    User,
    Building,
    ListChecks,
    Settings,
    Info
} from 'lucide-react';

interface VeiculoFormData {
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

const tiposVeiculo = [
    "Carro","Moto","Caminhão","Ônibus","Utilitário","Outro"
];

const cores = [
    "Preto","Branco","Prata","Cinza","Vermelho","Azul","Verde","Amarelo","Marrom","Bege","Dourado","Laranja","Roxo","Vinho","Outra"
];

const montadorasPorTipo: Record<string, string[]> = {
    Carro: [
        "Acura","Agrale","Alfa Romeo","Aston Martin","Audi","BAIC","Bentley","BMW","Bugatti","Buick","CAOA Chery","Cadillac",
        "Changan","Chery","Chevrolet","Chrysler","Citroën","Daihatsu","Dodge","DS Automobiles","Effa","Ferrari","Fiat","Ford",
        "Geely","Genesis","GMC","GWM","Hafei","Honda","Hyundai","Infiniti","Iveco","Jac","Jaguar","Jeep","Jinbei","Kia","Koenigsegg",
        "Lamborghini","Land Rover","Lexus","Lifan","Li Auto","Lincoln","Lucid","Lotus","Mahindra","Maserati","McLaren","Mazda","Mercedes-AMG",
        "Mercedes-Benz","Mini","Mitsubishi","NIO","Nissan","Oldsmobile","Opel","Peugeot","Polestar","Pontiac","Porsche","RAM","Renault",
        "Rivian","Rolls-Royce","Saab","Seat","Shineray","Skoda","SsangYong","Subaru","Suzuki","Tata","Tesla","Toyota","Troller","UAZ","Vauxhall",
        "Volkswagen","Volvo","XPeng","Yugo","MG","Outra"
    ].sort(),
    Moto: [
        "Aprilia","Bajaj","Benelli","Bimota","Cagiva","CFMoto","Ducati","Gas Gas","Harley-Davidson","Hero MotoCorp","Husqvarna","Indian Motorcycle",
        "Kawasaki","KTM","Kymco","Malaguti","Moto Guzzi","MV Agusta","Norton","Piaggio","Rieju","Royal Enfield","Sherco","SYM","TVS Motor Company",
        "Ural","Vespa","Yamaha","Outra"
    ].sort(),
    Caminhão: [
        "Agrale","Ashok Leyland","BharatBenz","BYD","DAF","Dongfeng","Eicher","FAW","Foton","Freightliner","Hino","International","Isuzu","Iveco",
        "KAMAZ","Kenworth","Mack Trucks","MAN","Mahindra","Mercedes-Benz Trucks","Mitsubishi Fuso","Navistar","Nikola","Peterbilt","Renault Trucks",
        "Scania","Shacman","Sinotruk","Sterling","Tata Motors","Tesla","Volvo Trucks","Western Star","Outra"
    ].sort(),
    Ônibus: [
        "Alexander Dennis","Blue Bird","Busscar","Caio","Comil","Federal Coach","Gillig","Irizar","Isuzu","Marcopolo","Mascarello","McCoy Miller",
        "Mercedes-Benz","MCI","Neoplan","Neobus","New Flyer","Nova Bus","Prevost","Scania","Setra","Thomas Built Buses","Van Hool","Volvo","Wrightbus",
        "Volkswagen","Outra"
    ].sort(),
    Utilitário: [
        "BYD","Chevrolet","Citroën","Daihatsu","Dongfeng","Fiat","Ford","Foton","GMC","GWM","Hyundai","Iveco","Isuzu","JAC Motors","Mahindra","Maxus",
        "Mercedes-Benz","Mitsubishi Fuso","Nissan","Opel","Peugeot","Renault","RAM","Toyota","UAZ","Vauxhall","Volkswagen","Volvo","Outra"
    ].sort(),
    Outro: ["Outra"]
};

const motoresPorTipo: Record<string, string[]> = {
    Carro: [
        "1.0 Aspirado","1.0 Turbo","1.0 TSI","1.2 Aspirado","1.2 16V Aspirado","1.2 Turbo","1.4 Aspirado","1.4 8V","1.4 16V","1.4 Turbo","1.5 Aspirado",
        "1.5 16V","1.5 Turbo","1.6 Aspirado","1.6 16V","1.6 Turbo","1.8 Aspirado","1.8 16V","1.8 Turbo","2.0 Aspirado","2.0 16V","2.0 Turbo","2.0 Bi-Turbo",
        "2.0 TFSI","2.0 TDI","2.0 HDi","2.0 Diesel","2.2 TDI","2.5 Turbo","3.0 Aspirado","3.0 V6","3.0 Turbo","3.0 Bi-Turbo","3.3 V6 Twin Turbo","4.0 V8",
        "4.2 V8","5.0 V8","5.0 V8 32V","5.5 V8","6.2 V8","V6","V8","W12","V12","Turbodiesel","Turbo Diesel","Aspirado Diesel","Gasolina","Álcool","Flex",
        "Flex 1.0","Flex 1.4","Flex 1.6","Flex 2.0","GNV","Elétrico","Híbrido","Plug-in Hybrid","Mild Hybrid","Micro Hybrid","Fuel Cell","Hidrogenio","Outro"
    ],
    Moto: [
        "50cc","80cc","100cc","125cc","150cc","160cc","200cc","250cc","300cc","350cc","400cc","450cc","500cc","600cc","650cc","700cc","750cc","800cc","900cc",
        "1000cc","1200cc","1300cc","1400cc","1500cc","Dois Tempos","Quatro Tempos","Elétrico","Híbrido","Single-Cylinder","Parallel Twin","V-Twin","Inline-Triple",
        "Inline-Four","Boxer","Rotary","Outro"
    ],
    Caminhão: [
        "Diesel 3.0L","Diesel 4.0L","Diesel 5.9L","Diesel 6.7L","Diesel 8.3L","Diesel 10.8L","Diesel 12.0L","Gasolina 5.0L","GNV","GNL","Híbrido","Elétrico","Turbo Diesel",
        "Injeção Direta","Common Rail","Euro V","Euro VI","Hidrogêncio","Outro"
    ],
    Ônibus: [
        "Diesel Traseiro","Diesel Dianteiro","Diesel Intercooler","Turbodiesel","Common Rail","Diesel Euro III","Diesel Euro V","Diesel Euro VI","GNV","Biometano","Biodiesel",
        "HVO Diesel","Elétrico","Híbrido","Fuel Cell","Trolleybus","Outro"
    ],
    Utilitário: [
        "1.3 Turbo","1.4","1.4 Turbo","1.6","1.6 Turbo","2.0","2.2","2.2 Turbo","2.8 Diesel","3.0 Diesel","Álcool","Biodiesel","Biometano","Common Rail","Diesel","Diesel Euro V",
        "Flex","Flex 1.0","Flex 1.4","Flex 1.5","Flex 1.6","Fuel Cell","GNV","Gasolina","Gasolina 1.0","Gasolina 1.3","Gasolina 1.4","Gasolina 1.5","Gasolina 1.6","Micro Hybrid",
        "Mild Hybrid","Plug-in Hybrid","Turbo Diesel","Turbo Diesel Intercooler","Elétrico","Híbrido","Outro"
    ],
    Outro: ["Outro"]
};

export default function CadastrarVeiculoPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<VeiculoFormData>({
        tipoVeiculo: '',
        renavam: '',
        placa: '',
        modelo: '',
        proprietario: '',
        montadora: '',
        cor: '',
        motor: '',
        anoFabricacao: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'tipoVeiculo') {
            setFormData(prev => ({
                ...prev,
                tipoVeiculo: value,
                montadora: '',
                motor: '',
                modelo: ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('http://localhost:8080/rest/veiculo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || `Erro HTTP ${res.status}`);
            }
            router.push('/veiculo/listar');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const listaMontadoras = formData.tipoVeiculo
        ? montadorasPorTipo[formData.tipoVeiculo] || []
        : [];
    const listaMotores = formData.tipoVeiculo
        ? motoresPorTipo[formData.tipoVeiculo] || []
        : [];

    return (
        <div className="min-h-screen bg-[#012A46] text-white flex flex-col">
            {/* Menu de navegação */}
            <NavBar active="veiculo-cadastrar" />

            <header className="bg-slate-800 py-4 px-6">
                <h1 className="text-xl font-bold flex items-center">
                    <Car className="mr-2 text-sky-400" /> Sistema de Veículos
                </h1>
            </header>

            <main className="container mx-auto px-4 py-8 flex-grow">
                <div className="bg-slate-900 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
                    <h1 className="flex items-center justify-center text-2xl md:text-3xl font-bold mb-8 gap-2">
                        <Car size={30} className="text-sky-400" /> Cadastrar Novo Veículo
                    </h1>
                    {error && (
                        <div className="mb-4 text-red-400 bg-red-900/50 p-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Detalhes do Veículo */}
                        <section>
                            <h2 className="flex items-center text-xl font-semibold text-sky-400 mb-4 border-b border-slate-700 pb-2 gap-2">
                                <ListChecks size={22} /> Detalhes do Veículo
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {/* Tipo de Veículo */}
                                <div>
                                    <label htmlFor="tipoVeiculo" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300">
                                        <Car size={16} /> Tipo de Veículo
                                    </label>
                                    <select
                                        id="tipoVeiculo"
                                        name="tipoVeiculo"
                                        value={formData.tipoVeiculo}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 h-10"
                                    >
                                        <option value="" disabled>Selecione...</option>
                                        {tiposVeiculo.map(tv => (
                                            <option key={tv} value={tv}>{tv}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Montadora */}
                                <div>
                                    <label htmlFor="montadora" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300">
                                        <Building size={16} /> Montadora
                                    </label>
                                    <select
                                        id="montadora"
                                        name="montadora"
                                        value={formData.montadora}
                                        onChange={handleChange}
                                        required
                                        disabled={!formData.tipoVeiculo}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 disabled:opacity-50 h-10"
                                    >
                                        <option value="" disabled>
                                            {formData.tipoVeiculo ? 'Selecione...' : 'Escolha o tipo'}
                                        </option>
                                        {listaMontadoras.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Modelo */}
                                <div>
                                    <label htmlFor="modelo" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300">
                                        <Info size={16} /> Modelo
                                    </label>
                                    <input
                                        type="text"
                                        id="modelo"
                                        name="modelo"
                                        value={formData.modelo}
                                        onChange={handleChange}
                                        required
                                        maxLength={100}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 h-10"
                                    />
                                </div>

                                {/* Ano de Fabricação */}
                                <div>
                                    <label htmlFor="anoFabricacao" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300">
                                        <Calendar size={16} /> Ano de Fabricação
                                    </label>
                                    <input
                                        type="date"
                                        id="anoFabricacao"
                                        name="anoFabricacao"
                                        value={formData.anoFabricacao}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 h-10"
                                    />
                                </div>

                                {/* Cor */}
                                <div>
                                    <label htmlFor="cor" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300">
                                        <Palette size={16} /> Cor
                                    </label>
                                    <select
                                        id="cor"
                                        name="cor"
                                        value={formData.cor}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 h-10"
                                    >
                                        <option value="" disabled>Selecione...</option>
                                        {cores.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Motor */}
                                <div>
                                    <label htmlFor="motor" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300">
                                        <Settings size={16} /> Motor
                                    </label>
                                    <select
                                        id="motor"
                                        name="motor"
                                        value={formData.motor}
                                        onChange={handleChange}
                                        required
                                        disabled={!formData.tipoVeiculo}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 disabled:opacity-50 h-10"
                                    >
                                        <option value="" disabled>
                                            {formData.tipoVeiculo ? 'Selecione...' : 'Escolha o tipo'}
                                        </option>
                                        {listaMotores.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Identificação */}
                        <section>
                            <h2 className="flex items-center text-xl font-semibold text-sky-400 mb-4 border-b border-slate-700 pb-2 gap-2">
                                <ScanLicense size={22} /> Identificação
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {/* Placa */}
                                <div>
                                    <label htmlFor="placa" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300">
                                        <Hash size={16} /> Placa
                                    </label>
                                    <input
                                        type="text"
                                        id="placa"
                                        name="placa"
                                        placeholder="AAA1234 ou ABC1D23"
                                        value={formData.placa}
                                        onChange={handleChange}
                                        required
                                        maxLength={7}
                                        pattern="[A-Z]{3}[0-9][A-Z][0-9]{2}|[A-Z]{3}[0-9]{4}"
                                        title="Formato AAA1234 ou ABC1D23"
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 h-10 font-mono uppercase"
                                    />
                                </div>

                                {/* Renavam */}
                                <div>
                                    <label htmlFor="renavam" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300">
                                        <Hash size={16} /> Renavam
                                    </label>
                                    <input
                                        type="text"
                                        id="renavam"
                                        name="renavam"
                                        placeholder="Apenas números"
                                        inputMode="numeric"
                                        pattern="[0-9]{11}"
                                        title="O Renavam deve conter exatamente 11 dígitos numéricos"
                                        maxLength={11}
                                        required
                                        value={formData.renavam}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 h-10"
                                    />
                                </div>

                                {/* Proprietário */}
                                <div className="md:col-span-2">
                                    <label htmlFor="proprietario" className="flex items-center gap-1 mb-1 text-sm font-medium text-slate-300">
                                        <User size={16} /> Proprietário
                                    </label>
                                    <input
                                        type="text"
                                        id="proprietario"
                                        name="proprietario"
                                        value={formData.proprietario}
                                        onChange={handleChange}
                                        required
                                        maxLength={50}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 h-10"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Botões */}
                        <div className="flex justify-end gap-4 pt-6">
                            <button
                                type="button"
                                className="px-5 py-2 bg-slate-600 hover:bg-slate-700 rounded-md text-white"
                                onClick={() => window.history.back()}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`px-5 py-2 rounded-md font-semibold ${isLoading ? 'bg-sky-800 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}
                            >
                                {isLoading ? 'Salvando...' : 'Salvar Veículo'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}