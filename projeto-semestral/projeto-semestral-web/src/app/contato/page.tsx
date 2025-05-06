// src/app/contato/page.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { FaGithub } from 'react-icons/fa';
import NavBar from '@/components/nav-bar'; // Certifique-se que o caminho está correto
import {
    Phone, // Mantido para o título principal
    Mail,
    MapPin,
    Clock,
    User,
    AtSign,
    FileText,
    MessageCircle,
    MessagesSquare, // <<< ÍCONE ADICIONADO PARA WHATSAPP
    Send
} from 'lucide-react';

// Carregamento Dinâmico do Componente do Mapa
const DynamicLeafletMap = dynamic(() => import('@/components/LeafletMap'), {
    ssr: false,
    loading: () => (
        <div style={{ height: '100%', width: '100%' }} className="flex items-center justify-center bg-slate-800">
            <p className="text-center text-slate-400 py-4">Carregando mapa...</p>
        </div>
    )
});

export default function ContatoPage() {
    // --- Dados de Contato ---
    const contatoTelefoneDisplay = "(11) 97669-2633"; // Número para exibir
    const contatoTelefoneWhatsappNumero = "5511976692633"; // Número formatado para link wa.me
    const linkWhatsapp = `https://wa.me/${contatoTelefoneWhatsappNumero}`; // Link WhatsApp
    const enderecoLinha1 = "Rua Laura, 127";
    const enderecoLinha2 = "Vila Leda, Guarulhos - SP";
    const enderecoLinha3 = "CEP 07062-031";
    const horarioAtendimento1 = "Segunda a Sexta: 10h às 19h";
    const horarioAtendimento2 = "Sábado: 08h às 14h";
    const horarioAtendimento3 = "Domingo: Fechado";
    const mapPosition: [number, number] = [-23.4606621, -46.5490878]; // Suas coordenadas
    const emailDestino: string = "rm557881@fiap.com.br"; // Seu e-mail de destino

    // Estados para os campos do formulário
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [emailRemetente, setEmailRemetente] = useState('');
    const [assunto, setAssunto] = useState('');
    const [mensagem, setMensagem] = useState('');

    // Função para lidar com o envio do formulário (via Gmail)
    const handleSubmitEmail = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Formulário submetido para abrir webmail (Gmail).");

        if (!nomeCompleto || !emailRemetente || !assunto || !mensagem) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        // A verificação do emailDestino é mantida como segurança
        if (!emailDestino || emailDestino === "seu_email_de_atendimento@example.com") {
            alert("Erro de configuração: O e-mail de destino não foi definido.");
            return;
        }
        const corpoEmailFormatado = `Nome: ${nomeCompleto}\nE-mail do Remetente (para resposta): ${emailRemetente}\n\nMensagem:\n${mensagem}`;
        const encodedSubject = encodeURIComponent(assunto);
        const encodedBody = encodeURIComponent(corpoEmailFormatado);
        const encodedTo = encodeURIComponent(emailDestino);
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`;
        console.log("Abrindo Gmail com URL:", gmailUrl);
        window.open(gmailUrl, '_blank');
    };

    // Retorno do JSX
    return (
        <>
            <NavBar active="contato" />
            <main className="pt-24 pb-16 min-h-screen bg-[#012A46] text-slate-300">
                <div className="container mx-auto px-4">
                    {/* Título Principal */}
                    <h1 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
                        <Phone className="mr-2 text-4xl text-sky-400" /> {/* Ícone de telefone mantido no título */}
                        Entre em Contato
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Coluna de Informações de Contato */}
                        <div className="lg:col-span-1">
                            <div className="bg-slate-900 rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-sky-300 mb-6 flex items-center">
                                    <Mail className="mr-2" />
                                    Informações de Contato
                                </h2>
                                <div className="space-y-6">
                                    {/* --- SEÇÃO DO WHATSAPP/TELEFONE ALTERADA --- */}
                                    <div className="flex items-start">
                                        {/* Novo ícone */}
                                        <MessagesSquare className="h-5 w-5 text-sky-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            {/* Título alterado */}
                                            <h3 className="font-medium text-white">WhatsApp / Telefone</h3>
                                            {/* Número vira um link para WhatsApp */}
                                            <a
                                                href={linkWhatsapp}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1 text-slate-400 hover:text-sky-400 transition-colors underline"
                                            >
                                                {contatoTelefoneDisplay} {/* Exibe o número formatado */}
                                            </a>
                                        </div>
                                    </div>
                                    {/* --- FIM DA SEÇÃO ALTERADA --- */}

                                    {/* Email */}
                                    <div className="flex items-start">
                                        <Mail className="h-5 w-5 text-sky-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-medium text-white">Email de Atendimento</h3>
                                            <p className="mt-1 text-slate-400 break-all">{emailDestino}</p>
                                        </div>
                                    </div>
                                    {/* Endereço */}
                                    <div className="flex items-start">
                                        <MapPin className="h-5 w-5 text-sky-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-medium text-white">Endereço</h3>
                                            <p className="mt-1 text-slate-400">
                                                {enderecoLinha1}<br />
                                                {enderecoLinha2}<br />
                                                {enderecoLinha3}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Horário */}
                                    <div className="flex items-start">
                                        <Clock className="h-5 w-5 text-sky-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-medium text-white">Horário</h3>
                                            <p className="mt-1 text-slate-400">{horarioAtendimento1}</p>
                                            <p className="text-slate-400">{horarioAtendimento2}</p>
                                            <p className="text-slate-400">{horarioAtendimento3}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Desenvolvido Por */}
                                <div className="mt-8 pt-6 border-t border-slate-700">
                                    <h3 className="font-medium text-white mb-4">Desenvolvido por:</h3>
                                    <div className="space-y-3">
                                        <a
                                            href="https://github.com/carmipa"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-sky-400 hover:text-sky-300 transition-colors"
                                        >
                                            {/* Substituído aqui */}
                                            <FaGithub className="h-4 w-4 mr-2" />
                                            Paulo André Carminati
                                        </a>
                                        <a
                                            href="https://github.com/gabimaced0"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-sky-400 hover:text-sky-300 transition-colors"
                                        >
                                            {/* Substituído aqui */}
                                            <FaGithub className="h-4 w-4 mr-2" />
                                            Gabrielly Macedo
                                        </a>
                                        <a
                                            href="https://github.com/carmipa/Java_Advanced_CP_1SEM/tree/main/projeto-semestral" // Verifique se este link ainda é relevante
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-sky-400 hover:text-sky-300 transition-colors mt-2"
                                        >
                                            {/* Substituído aqui */}
                                            <FaGithub className="h-4 w-4 mr-2" />
                                            Repositório do Projeto
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coluna do Formulário e Mapa */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Formulário de Contato */}
                            <div className="bg-slate-900 rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-sky-300 mb-6 flex items-center">
                                    <Mail className="mr-2" />
                                    Envie uma Mensagem (via Webmail)
                                </h2>
                                <form className="space-y-6" onSubmit={handleSubmitEmail}>
                                    {/* Nome Completo */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="nomeCompleto" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                                                <User className="mr-2 text-slate-400 h-4 w-4" /> Nome Completo
                                            </label>
                                            <input id="nomeCompleto" name="nomeCompleto" type="text" required placeholder="Seu nome completo" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 text-white placeholder-slate-500" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} />
                                        </div>
                                        {/* Seu Email */}
                                        <div>
                                            <label htmlFor="emailRemetente" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                                                <AtSign className="mr-2 text-slate-400 h-4 w-4" /> Seu Email (para resposta)
                                            </label>
                                            <input id="emailRemetente" name="emailRemetente" type="email" required placeholder="seu@email.com" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 text-white placeholder-slate-500" value={emailRemetente} onChange={(e) => setEmailRemetente(e.target.value)} />
                                        </div>
                                    </div>
                                    {/* Assunto */}
                                    <div>
                                        <label htmlFor="assunto" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                                            <FileText className="mr-2 text-slate-400 h-4 w-4" /> Assunto
                                        </label>
                                        <input id="assunto" name="assunto" type="text" required placeholder="Assunto da mensagem" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 text-white placeholder-slate-500" value={assunto} onChange={(e) => setAssunto(e.target.value)} />
                                    </div>
                                    {/* Mensagem */}
                                    <div>
                                        <label htmlFor="mensagem" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                                            <MessageCircle className="mr-2 text-slate-400 h-4 w-4" /> Mensagem
                                        </label>
                                        <textarea id="mensagem" name="mensagem" rows={6} required placeholder="Digite sua mensagem aqui..." className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 text-white placeholder-slate-500" value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
                                    </div>
                                    {/* Botão Enviar */}
                                    <div className="text-right">
                                        <button type="submit" className="inline-flex items-center px-6 py-3 font-semibold text-white bg-sky-600 rounded-md shadow hover:bg-sky-700 transition-colors disabled:opacity-50">
                                            <Send className="mr-2 h-4 w-4" /> Enviar Mensagem
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Mapa com Leaflet */}
                            <div className="bg-slate-900 rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-sky-300 mb-4 flex items-center">
                                    <MapPin className="mr-2" />
                                    Minha Localização
                                </h2>
                                <div className="w-full h-[400px] rounded-md overflow-hidden bg-slate-800">
                                    <DynamicLeafletMap
                                        position={mapPosition}
                                        markerText={`${enderecoLinha1}, ${enderecoLinha2}`}
                                        className="h-full w-full"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2 text-center">
                                    {enderecoLinha1}, {enderecoLinha2}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}