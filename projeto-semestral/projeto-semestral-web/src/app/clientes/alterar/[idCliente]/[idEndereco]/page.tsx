
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { IMaskInput } from 'react-imask';

// Função auxiliar para limpar máscaras
const cleanMaskedValue = (value: string): string => {
    return value.replace(/\D/g, '');
};

// Interface para a resposta da API
interface ClienteApiResponseDto {
    idCli: number;
    nome: string;
    sobrenome: string;
    tipoCliente: string;
    numeroDocumento: string;
    sexo: string;
    dataNascimento: string;
    atividadeProfissional: string;
    endereco: {
        codigo: number; numero: number; cep: string; logradouro: string;
        cidade: string; bairro: string; estado: string; complemento: string | null;
    } | null;
    contato: {
        codigo: number; celular: string; email: string; contato: string;
    } | null;
}

export default function AlterarClientePage() {
    const params = useParams();
    const router = useRouter();

    const idClienteParam = params?.idCliente;
    const idEnderecoParam = params?.idEndereco;
    const idCliente = typeof idClienteParam === 'string' ? parseInt(idClienteParam, 10) : null;
    const idEndereco = typeof idEnderecoParam === 'string' ? parseInt(idEnderecoParam, 10) : null;

    // Estados do Formulário
    const [tipoCliente, setTipoCliente] = useState("PF");
    const [nome, setNome] = useState("");
    const [sobrenome, setSobrenome] = useState("");
    const [sexo, setSexo] = useState("M");
    const [tipoDocumento, setTipoDocumento] = useState("CPF");
    const [numeroDocumento, setNumeroDocumento] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [atividadeProfissional, setAtividadeProfissional] = useState("");
    const [celular, setCelular] = useState("");
    const [email, setEmail] = useState("");
    const [contato, setContato] = useState("");
    const [numeroCasa, setNumeroCasa] = useState("");
    const [cep, setCep] = useState("");
    const [logradouro, setLogradouro] = useState("");
    const [bairro, setBairro] = useState("");
    const [cidade, setCidade] = useState("");
    const [estado, setEstado] = useState("");
    const [complemento, setComplemento] = useState("");

    // Estados de Controle
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null); // Estado para a mensagem de sucesso

    // useEffect para buscar dados (mantido igual)
    useEffect(() => {
        if (idCliente && idEndereco) {
            setIsLoading(true); setError(null); setSuccess(null);
            const fetchClienteData = async () => {
                try {
                    const apiUrl = `http://localhost:8080/rest/clientes/${idCliente}/${idEndereco}`;
                    const response = await fetch(apiUrl);
                    if (response.status === 404) { throw new Error("Cliente não encontrado."); }
                    if (!response.ok) { throw new Error(`Erro ao buscar dados: ${response.statusText}`); }
                    const data: ClienteApiResponseDto = await response.json();

                    // Preenche estados...
                    setTipoCliente(data.tipoCliente || 'PF');
                    setNome(data.nome || '');
                    setSobrenome(data.sobrenome || '');
                    setSexo(data.sexo || 'M');
                    setTipoDocumento(data.tipoDocumento || 'CPF');
                    setNumeroDocumento(data.numeroDocumento || '');
                    setDataNascimento(data.dataNascimento ? data.dataNascimento.split('T')[0] : '');
                    setAtividadeProfissional(data.atividadeProfissional || '');
                    setCelular(data.contato?.celular || '');
                    setEmail(data.contato?.email || '');
                    setContato(data.contato?.contato || '');
                    setNumeroCasa(data.endereco?.numero?.toString() || '');
                    setCep(data.endereco?.cep || '');
                    setLogradouro(data.endereco?.logradouro || '');
                    setBairro(data.endereco?.bairro || '');
                    setCidade(data.endereco?.cidade || ''); // Assume que DTO de resposta tem 'cidade'
                    setEstado(data.endereco?.estado || ''); // Assume que DTO de resposta tem 'estado'
                    setComplemento(data.endereco?.complemento || '');

                } catch (err: any) {
                    setError(err.message || "Falha ao carregar dados.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchClienteData();
        } else {
            setError("IDs inválidos na URL."); setIsLoading(false);
        }
    }, [idCliente, idEndereco]);

    // --- Manipulador para salvar as alterações (handleUpdate) ---
    const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!idCliente || !idEndereco) { setError("IDs inválidos."); return; }

        setIsSaving(true); setError(null); setSuccess(null);

        const cleanedNumeroDocumento = cleanMaskedValue(numeroDocumento);
        const cleanedCelular = cleanMaskedValue(celular);
        const cleanedCep = cleanMaskedValue(cep);

        const clienteData = {
            tipoCliente, nome, sobrenome, sexo, tipoDocumento,
            numeroDocumento: cleanedNumeroDocumento, dataNascimento, atividadeProfissional,
            endereco: {
                numero: parseInt(numeroCasa, 10), cep: cleanedCep, logradouro, bairro,
                localidade: cidade, uf: estado, complemento,
            },
            contato: { celular: cleanedCelular, email, contato }
        };

        const apiUrl = `http://localhost:8080/rest/clientes/${idCliente}/${idEndereco}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}.` }));
                throw new Error(errorData.message || `Erro ${response.status}`);
            }

            const result = await response.json();
            console.log("Update Success:", result);
            setSuccess("Cliente atualizado com sucesso!"); // <<< Define a mensagem de sucesso

            // Limpa a mensagem de sucesso após alguns segundos
            setTimeout(() => {
                setSuccess(null);
            }, 5000); // 5 segundos

            // Não limpamos o formulário na edição

        } catch (err: any) {
            setError(err.message || "Falha ao salvar alterações.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Lógica de busca de CEP (mantida) ---
    const handleCepChange = async (value: string) => {
        const maskedCep = value;
        const newCep = cleanMaskedValue(maskedCep);
        setCep(maskedCep);
        setLogradouro(''); setBairro(''); setCidade(''); setEstado('');
        if (newCep.length === 8) {
            setIsSaving(true); setError(null); // Reutiliza isSaving para indicar busca CEP
            try {
                const response = await fetch(`https://viacep.com.br/ws/${newCep}/json/`);
                if (!response.ok) throw new Error('CEP não encontrado');
                const data = await response.json();
                if (data.erro) { throw new Error('CEP inválido'); }
                setLogradouro(data.logradouro || ''); setBairro(data.bairro || '');
                setCidade(data.localidade || ''); setEstado(data.uf || '');
            } catch (cepError: any) { setError(`Erro CEP: ${cepError.message}`);
            } finally { setIsSaving(false); }
        }
    };

    const cpfMask = "000.000.000-00";
    const cnpjMask = "00.000.000/0000-00";

    // --- Renderização ---
    if (isLoading) { /* ... código de loading ... */
        return (
            <>
                <NavBar active="clientes" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                    <p className="text-center text-sky-300 py-10">Carregando dados do cliente...</p>
                </main>
            </>
        );
    }
    if (error && !nome) { /* ... código de erro fatal se não carregou nome ... */
        return (
            <>
                <NavBar active="clientes" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                    <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-4xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-red-400">Erro ao Carregar</h2>
                        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500 mb-6">{error}</p>
                        <div className="text-center">
                            <Link href="/clientes/listar">
                                <button className="px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700">
                                    Voltar para Lista
                                </button>
                            </Link>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <NavBar active="clientes" />
            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
                <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Alterar Cliente (ID: {idCliente})</h2>
                    <form onSubmit={handleUpdate}>
                        {/* Caixa de Mensagem de Erro (mantida com botão fechar) */}
                        {error && (
                            <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                                <span className="block sm:inline">{error}</span>
                                <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar">
                                    <span className="text-2xl" aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        )}

                        {/* Fieldsets e Inputs (iguais ao cadastro, usando IMaskInput) */}
                        {/* Dados Pessoais */}
                        <fieldset className="mb-6 border border-slate-700 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2">Dados Pessoais</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label htmlFor="tipo_cliente" className="block mb-1">Tipo de Cliente:</label>
                                    <select id="tipo_cliente" name="tipo_cliente" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value)}>
                                        <option value="PF">Pessoa Física</option>
                                        <option value="PJ">Pessoa Jurídica</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="nome" className="block mb-1">Nome:</label>
                                    <input type="text" id="nome" name="nome" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={nome} onChange={(e) => setNome(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="sobrenome" className="block mb-1">Sobrenome:</label>
                                    <input type="text" id="sobrenome" name="sobrenome" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="sexo" className="block mb-1">Sexo:</label>
                                    <select id="sexo" name="sexo" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={sexo} onChange={(e) => setSexo(e.target.value)}>
                                        <option value="M">Masculino</option>
                                        <option value="F">Feminino</option>
                                        <option value="O">Outro</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="tipo_documento" className="block mb-1">Tipo de Documento:</label>
                                    <select id="tipo_documento" name="tipo_documento" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={tipoDocumento} onChange={(e) => { setTipoDocumento(e.target.value); setNumeroDocumento(''); }}>
                                        <option value="CPF">CPF</option>
                                        <option value="CNPJ">CNPJ</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="numero_documento" className="block mb-1">Número do Documento:</label>
                                    <IMaskInput mask={tipoDocumento === 'CPF' ? cpfMask : cnpjMask} value={numeroDocumento} unmask={false} onAccept={(value) => setNumeroDocumento(value)} id="numero_documento" name="numero_documento" placeholder={tipoDocumento === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'} required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="data_nascimento" className="block mb-1">Data de Nascimento:</label>
                                    <input type="date" id="data_nascimento" name="data_nascimento" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 date-input-fix" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="atividade_profissional" className="block mb-1">Atividade Profissional:</label>
                                    <input type="text" id="atividade_profissional" name="atividade_profissional" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={atividadeProfissional} onChange={(e) => setAtividadeProfissional(e.target.value)} />
                                </div>
                            </div>
                        </fieldset>

                        {/* Contatos */}
                        <fieldset className="mb-6 border border-slate-700 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2">Contatos</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label htmlFor="celular" className="block mb-1">Celular:</label>
                                    <IMaskInput mask="(00) 00000-0000" value={celular} unmask={false} onAccept={(value) => setCelular(value)} type="tel" id="celular" name="celular" placeholder="(99) 99999-9999" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="email" className="block mb-1">E-mail:</label>
                                    <input type="email" id="email" name="email" placeholder="exemplo@dominio.com" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="mb-4 md:col-span-2">
                                    <label htmlFor="contato" className="block mb-1">Nome do Contato Principal:</label>
                                    <input type="text" id="contato" name="contato" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={contato} onChange={(e) => setContato(e.target.value)} />
                                </div>
                            </div>
                        </fieldset>

                        {/* Endereço */}
                        <fieldset className="mb-6 border border-slate-700 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2">Endereço</legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="mb-4 md:col-span-1">
                                    <label htmlFor="cep" className="block mb-1">CEP:</label>
                                    <IMaskInput mask="00000-000" value={cep} unmask={false} onAccept={handleCepChange} id="cep" name="cep" placeholder="00000-000" required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                </div>
                                <div className="mb-4 md:col-span-2">
                                    <label htmlFor="logradouro" className="block mb-1">Logradouro:</label>
                                    <input type="text" id="logradouro" name="logradouro" maxLength={100} required readOnly className="w-full p-2 rounded bg-slate-700 border border-slate-600 cursor-not-allowed" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="numeroCasa" className="block mb-1">Número:</label>
                                    <input type="text" id="numeroCasa" name="numeroCasa" maxLength={8} required className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={numeroCasa} onChange={(e) => setNumeroCasa(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="complemento" className="block mb-1">Complemento:</label>
                                    <input type="text" id="complemento" name="complemento" maxLength={100} className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" value={complemento} onChange={(e) => setComplemento(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="bairro" className="block mb-1">Bairro:</label>
                                    <input type="text" id="bairro" name="bairro" maxLength={100} required readOnly className="w-full p-2 rounded bg-slate-700 border border-slate-600 cursor-not-allowed" value={bairro} onChange={(e) => setBairro(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="cidade" className="block mb-1">Cidade:</label>
                                    <input type="text" id="cidade" name="cidade" maxLength={100} required readOnly className="w-full p-2 rounded bg-slate-700 border border-slate-600 cursor-not-allowed" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="estado" className="block mb-1">Estado:</label>
                                    <input type="text" id="estado" name="estado" maxLength={2} required readOnly className="w-full p-2 rounded bg-slate-700 border border-slate-600 cursor-not-allowed" value={estado} onChange={(e) => setEstado(e.target.value)} />
                                </div>
                            </div>
                        </fieldset>

                        {/* <<< Mensagem de Sucesso Simples (acima dos botões) >>> */}
                        {success && (
                            <p className="text-center text-green-400 mb-4">{success}</p>
                        )}

                        {/* Botões de Ação */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                            <button
                                type="submit"
                                className={`px-6 py-3 font-semibold text-white bg-green-600 rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSaving || isLoading}
                            >
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                            <Link href="/clientes/listar" className="px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                                Voltar para Lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>

            {/* Estilos CSS Globais */}
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: white !important; }
                input[type="date"]::-webkit-datetime-edit { color: white; }
            `}</style>
        </>
    );
}
