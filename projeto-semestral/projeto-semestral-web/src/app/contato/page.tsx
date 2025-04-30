// src/app/contato/page.tsx
'use client';

import React from 'react';
import NavBar from '@/components/nav-bar';
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Github,
    User,
    AtSign,
    FileText,
    MessageCircle,
    Send
} from 'lucide-react';

export default function ContatoPage() {
    // --- Dados Atualizados ---
    const fiapTelefone = "(11) 3385-8010";
    const fiapEnderecoLinha1 = "Av. Paulista, 1106 - 7º andar";
    const fiapEnderecoLinha2 = "Bela Vista, São Paulo - SP";
    const fiapEnderecoLinha3 = "CEP 01311-000";
    const fiapHorario1 = "Segunda a Sexta: 07h às 23h";
    const fiapHorario2 = "Sábado: 08h às 14h";
    const fiapHorario3 = "Domingo: Fechado";
    const enderecoQuery = encodeURIComponent(
        "Av. Paulista, 1106 - Bela Vista, São Paulo - SP, 01311-000"
    );
    // --- Fim dos Dados Atualizados ---

    return (
        <>
            <NavBar active="contato" />
            <main className="pt-24 pb-16 min-h-screen bg-[#012A46] text-slate-300">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
                        <Phone className="mr-2 text-4xl text-sky-400" />
                        Entre em Contato
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Informações de Contato */}
                        <div className="lg:col-span-1">
                            <div className="bg-slate-900 rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-sky-300 mb-6 flex items-center">
                                    <Mail className="mr-2" />
                                    Informações de Contato
                                </h2>
                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <Phone className="h-5 w-5 text-sky-400 mt-0.5 mr-3" />
                                        <div>
                                            <h3 className="font-medium text-white">Telefone</h3>
                                            <p className="mt-1 text-slate-400">{fiapTelefone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Mail className="h-5 w-5 text-sky-400 mt-0.5 mr-3" />
                                        <div>
                                            <h3 className="font-medium text-white">Email</h3>
                                            <p className="mt-1 text-slate-400">contato@oficinavirtual.com.br</p>
                                            <p className="text-slate-400">suporte@oficinavirtual.com.br</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <MapPin className="h-5 w-5 text-sky-400 mt-0.5 mr-3" />
                                        <div>
                                            <h3 className="font-medium text-white">Endereço</h3>
                                            <p className="mt-1 text-slate-400">
                                                {fiapEnderecoLinha1}<br />
                                                {fiapEnderecoLinha2}<br />
                                                {fiapEnderecoLinha3}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Clock className="h-5 w-5 text-sky-400 mt-0.5 mr-3" />
                                        <div>
                                            <h3 className="font-medium text-white">Horário</h3>
                                            <p className="mt-1 text-slate-400">{fiapHorario1}</p>
                                            <p className="text-slate-400">{fiapHorario2}</p>
                                            <p className="text-slate-400">{fiapHorario3}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-700">
                                    <h3 className="font-medium text-white mb-4">Desenvolvido por:</h3>
                                    <div className="space-y-3">
                                        <a
                                            href="https://github.com/carmipa"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-sky-400 hover:text-sky-300 transition-colors"
                                        >
                                            <Github className="h-4 w-4 mr-2" />
                                            Paulo André Carminati
                                        </a>
                                        <a
                                            href="https://github.com/gabimaced0"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-sky-400 hover:text-sky-300 transition-colors"
                                        >
                                            <Github className="h-4 w-4 mr-2" />
                                            Gabrielly Macedo
                                        </a>
                                        <a
                                            href="https://github.com/carmipa/Java_Advanced_CP_1SEM/tree/main/projeto-semestral"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-sky-400 hover:text-sky-300 transition-colors mt-2"
                                        >
                                            <Github className="h-4 w-4 mr-2" />
                                            Repositório do Projeto
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Formulário e Mapa */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Formulário de Contato */}
                            <div className="bg-slate-900 rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-sky-300 mb-6 flex items-center">
                                    <Mail className="mr-2" />
                                    Envie uma Mensagem
                                </h2>
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="nomeCompleto" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                                                <User className="mr-2 text-slate-400" />
                                                Nome Completo
                                            </label>
                                            <input
                                                id="nomeCompleto"
                                                name="nomeCompleto"
                                                type="text"
                                                required
                                                placeholder="Seu nome completo"
                                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 text-white placeholder-slate-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                                                <AtSign className="mr-2 text-slate-400" />
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                placeholder="seu@email.com"
                                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 text-white placeholder-slate-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="assunto" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                                            <FileText className="mr-2 text-slate-400" />
                                            Assunto
                                        </label>
                                        <input
                                            id="assunto"
                                            name="assunto"
                                            type="text"
                                            required
                                            placeholder="Assunto da mensagem"
                                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 text-white placeholder-slate-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="mensagem" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                                            <MessageCircle className="mr-2 text-slate-400" />
                                            Mensagem
                                        </label>
                                        <textarea
                                            id="mensagem"
                                            name="mensagem"
                                            rows={6}
                                            required
                                            placeholder="Digite sua mensagem aqui..."
                                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 text-white placeholder-slate-500"
                                        />
                                    </div>
                                    <div className="text-right">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-6 py-3 font-semibold text-white bg-sky-600 rounded-md shadow hover:bg-sky-700 transition-colors disabled:opacity-50"
                                        >
                                            <Send className="mr-2" />
                                            Enviar Mensagem
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Mapa Incorporado */}
                            <div className="bg-slate-900 rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-sky-300 mb-4 flex items-center">
                                    <MapPin className="mr-2" />
                                    Nossa Localização
                                </h2>
                                <div className="aspect-video w-full rounded-md overflow-hidden">
                                    <iframe
                                        title="Mapa da Localização FIAP Paulista"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen={false}
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://www.google.com/maps/embed/v1/place?key=SUA_CHAVE_DE_API_AQUI&q=${enderecoQuery}`}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2 text-center">
                                    {fiapEnderecoLinha1}, {fiapEnderecoLinha2}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
