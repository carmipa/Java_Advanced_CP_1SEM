// --- Arquivo: src/app/clientes/listar/page.tsx (VERSÃO COM CARDS E ORDENAÇÃO POR ID) ---
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Importar se precisar de navegação programática no futuro
import NavBar from '@/components/nav-bar';
// Importando Ícones
import { User, Mail, MapPin, Edit3, Trash2, Hash } from 'lucide-react';
import { MdPersonAdd, MdEdit, MdDelete, MdPeopleAlt, MdBadge, MdErrorOutline } from 'react-icons/md'; // Usar MdBadge para documento

// --- Interfaces ---
interface ClienteParaLista {
    idCli: number;
    idEndereco: number; // Necessário para as ações (editar/deletar)
    nomeCompleto: string;
    documento: string;
    email: string;
    cidadeEstado: string;
    // Adicionar tipoCliente se quiser mostrar PF/PJ no card
    // tipoCliente: string;
}

interface ClienteApiResponseDto {
    idCli: number;
    nome: string;
    sobrenome: string;
    tipoCliente: string;
    numeroDocumento: string;
    endereco: {
        codigo: number;
        cidade: string;
        estado: string;
    } | null;
    contato: {
        celular: string; // Celular não está na ClienteParaLista atual, adicionar se necessário
        email: string;
    } | null;
}
// ------------------

export default function ListarClientesPage() {
    const [clientes, setClientes] = useState<ClienteParaLista[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // const router = useRouter(); // Descomentar se usar router.push

    const fetchClientes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("http://localhost:8080/rest/clientes/all");
            if (!response.ok) {
                let errorMsg = `Erro HTTP ${response.status}: ${response.statusText}`;
                try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {}
                throw new Error(errorMsg);
            }
            if (response.status === 204) { // Sem conteúdo
                setClientes([]);
                return;
            }

            const data: ClienteApiResponseDto[] = await response.json();

            // <<< ORDENAÇÃO POR ID_CLI ANTES DE MAPEAR >>>
            const sortedData = (data || []).sort((a, b) => a.idCli - b.idCli);

            const clientesFormatados: ClienteParaLista[] = sortedData.map(dto => ({
                idCli: dto.idCli,
                idEndereco: dto.endereco?.codigo || 0, // Pega idEndereco para a chave composta
                nomeCompleto: `${dto.nome || ''} ${dto.sobrenome || ''}`.trim(),
                documento: dto.numeroDocumento || 'N/A',
                email: dto.contato?.email || 'N/A',
                cidadeEstado: dto.endereco ? `${dto.endereco.cidade || 'N/A'} / ${dto.endereco.estado || 'N/A'}` : 'N/A', // Ajustado separador
                // tipoCliente: dto.tipoCliente // Descomentar se quiser usar no card
            }));
            setClientes(clientesFormatados);
        } catch (err: any) {
            console.error("Erro ao buscar clientes:", err);
            setError(err.message || "Falha ao carregar dados dos clientes.");
            setClientes([]); // Garante que está vazio em caso de erro
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    // --- Função de Delete (sem alterações na lógica interna) ---
    const handleDelete = async (idCliente: number, idEndereco: number) => {
        // Validação simples de ID (pode melhorar)
        if (!idCliente || isNaN(idCliente) || !idEndereco || isNaN(idEndereco) || idEndereco === 0) {
            setError("ID inválido ou endereço não associado corretamente para exclusão.");
            return;
        }
        if (!window.confirm(`Tem certeza que deseja excluir o cliente ID ${idCliente} (Endereço ID ${idEndereco})?`)) {
            return;
        }

        // Aqui poderia setar um estado de loading específico para o botão clicado
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/rest/clientes/${idCliente}/${idEndereco}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => `Erro ${response.status}`);
                throw new Error(`Falha ao deletar cliente: ${errorText}`);
            }

            alert("Cliente excluído com sucesso!"); // Usar um modal/toast seria melhor UX
            // Remove o cliente da lista local
            setClientes(prev => prev.filter(c => !(c.idCli === idCliente && c.idEndereco === idEndereco)));

        } catch (err: any) {
            console.error("Erro ao deletar cliente:", err);
            setError(err.message || "Falha ao excluir cliente.");
        } finally {
            // Resetar loading específico do botão se implementado
        }
    };

    return (
        <>
            <NavBar active="clientes" /> {/* Ajuste 'active' se o link na NavBar for diferente */}

            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                {/* Cabeçalho e Botões */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-center sm:text-left">
                        <MdPeopleAlt className="text-4xl text-sky-400" /> Lista de Clientes
                    </h1>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <Link href="/clientes/cadastrar">
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow whitespace-nowrap"> <MdPersonAdd /> Cadastrar Cliente </button>
                        </Link>
                        {/* Adicionar botão de busca se existir a página /clientes/buscar */}
                        {/*
                         <Link href="/clientes/buscar">
                             <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow whitespace-nowrap"> <Search size={18} /> Buscar Cliente </button>
                         </Link>
                          */}
                    </div>
                </div>

                {/* Mensagens */}
                {isLoading && <p className="text-center text-sky-300 py-10">Carregando clientes...</p>}
                {error && ( <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500 max-w-3xl mx-auto" role="alert"><MdErrorOutline className="inline mr-1"/>{error}<button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-xl">&times;</span></button></div> )}


                {/* <<< Lista de Cards >>> */}
                {!isLoading && !error && (
                    <div>
                        {clientes.length === 0 ? (
                            <p className="text-center text-slate-400 py-10">Nenhum cliente cadastrado.</p>
                        ) : (
                            // Grid Layout para os Cards
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {/* Mapeia sobre os clientes JÁ ORDENADOS */}
                                {clientes.map((cliente) => {
                                    // Chave composta para o card e para as ações
                                    const cardKey = `${cliente.idCli}-${cliente.idEndereco}`;
                                    const isIdValid = cliente.idCli !== null && cliente.idCli !== undefined && cliente.idEndereco !== 0; // Valida se temos ambos IDs

                                    return (
                                        // Card Individual
                                        <div key={cardKey} className={`bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col overflow-hidden hover:shadow-sky-700/20 transition-shadow duration-300 ${!isIdValid ? 'opacity-50' : ''}`}>
                                            {/* Header do Card */}
                                            <div className="bg-slate-700 p-3 flex justify-between items-center text-sm">
                                                <span className="flex items-center gap-1 font-semibold text-sky-300"> <Hash size={16} /> ID Cliente: {isIdValid ? cliente.idCli : 'Inválido'} </span>
                                                {/* Poderia adicionar o Tipo Cliente aqui se o trouxesse no DTO */}
                                            </div>

                                            {/* Corpo do Card */}
                                            <div className="p-4 space-y-2 flex-grow text-sm">
                                                <p title={cliente.nomeCompleto}><strong><User size={16} className="inline -mt-1 mr-1"/> Nome:</strong> {cliente.nomeCompleto || '-'}</p>
                                                <p><strong><MdBadge className="inline -mt-1 mr-1"/> Documento:</strong> {cliente.documento || '-'}</p>
                                                <p title={cliente.email}><strong><Mail size={16} className="inline -mt-1 mr-1"/> Email:</strong> {cliente.email || '-'}</p>
                                                <p><strong><MapPin size={16} className="inline -mt-1 mr-1"/> Local:</strong> {cliente.cidadeEstado || '-'}</p>
                                            </div>

                                            {/* Footer do Card (Ações) */}
                                            <div className="bg-slate-900 p-3 mt-auto border-t border-slate-700 flex justify-end gap-2">
                                                {isIdValid ? (
                                                    <>
                                                        <Link href={`/clientes/alterar/${cliente.idCli}/${cliente.idEndereco}`}>
                                                            <button className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-xs font-medium gap-1"> <Edit3 size={14} /> Alterar </button>
                                                        </Link>
                                                        <button onClick={() => handleDelete(cliente.idCli, cliente.idEndereco)} className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium gap-1" disabled={isLoading}> <MdDelete size={16} /> Deletar </button>
                                                    </>
                                                ) : ( <span className="text-xs text-red-400 italic">IDs Inválidos</span> )}
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