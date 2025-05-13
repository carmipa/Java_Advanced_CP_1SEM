// app/clientes/alterar/[idCliente]/[idEndereco]/page.tsx
"use client";

import { fetchAuthenticated } from '@/utils/apiService'; // <<< Adicionado import
import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { IMaskInput } from 'react-imask';
import {
    MdEdit,
    MdPerson,
    MdBadge,
    MdCalendarToday,
    MdWork,
    MdPhone,
    MdEmail,
    MdLocationOn,
    MdHome
} from 'react-icons/md';
// Função auxiliar para limpar máscaras
const cleanMaskedValue = (value: string): string =>
    value.replace(/\D/g, '');
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
        codigo: number;
        numero: number;
        cep: string;
        logradouro: string;
        cidade: string;
        bairro: string;
        estado: string;
        complemento: string | null;
    } | null;
    contato: {
        codigo: number;
        celular: string;
        email: string;
        contato: string;
    } | null;
}

export default function AlterarClientePage() {
    const params = useParams();
    const router = useRouter();
    const idCliente = typeof params?.idCliente === 'string'
        ? parseInt(params.idCliente, 10)
        : null;
    const idEndereco = typeof params?.idEndereco === 'string'
        ? parseInt(params.idEndereco, 10)
        : null;
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
    // Controle de UI
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    // Busca inicial dos dados
    useEffect(() => {
        if (idCliente && idEndereco) {
            setIsLoading(true);
            setError(null);
            const fetchData = async () => {
                try {
                    const resp = await fetchAuthenticated(`/rest/clientes/${idCliente}/${idEndereco}`); // <<< Alterado call
                    if (resp.status === 404) throw new Error("Cliente não encontrado.");
                    if (!resp.ok) throw new Error(`Erro: ${resp.statusText}`);
                    const data: ClienteApiResponseDto = await resp.json();

                    setTipoCliente(data.tipoCliente || "PF");
                    setNome(data.nome || "");
                    setSobrenome(data.sobrenome || "");
                    setSexo(data.sexo || "M");
                    setTipoDocumento(data.tipoDocumento || "CPF");
                    setNumeroDocumento(data.numeroDocumento || "");
                    setDataNascimento(data.dataNascimento.split('T')[0] || "");
                    setAtividadeProfissional(data.atividadeProfissional || "");
                    setCelular(data.contato?.celular || "");
                    setEmail(data.contato?.email || "");
                    setContato(data.contato?.contato || "");
                    setNumeroCasa(data.endereco?.numero.toString() || "");
                    setCep(data.endereco?.cep || "");
                    setLogradouro(data.endereco?.logradouro || "");
                    setBairro(data.endereco?.bairro || "");
                    setCidade(data.endereco?.cidade || "");
                    setEstado(data.endereco?.estado || "");
                    setComplemento(data.endereco?.complemento || "");
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        } else {
            setError("IDs inválidos na URL.");
            setIsLoading(false);
        }
    }, [idCliente, idEndereco]);

    // Submissão do formulário atualizado
    const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!idCliente || !idEndereco) {
            setError("IDs inválidos.");
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        const cleanedDoc = cleanMaskedValue(numeroDocumento);
        const cleanedCel = cleanMaskedValue(celular);
        const cleanedCep = cleanMaskedValue(cep);

        const payload = {
            tipoCliente,
            nome,
            sobrenome,
            sexo,
            tipoDocumento,
            numeroDocumento: cleanedDoc,
            dataNascimento,
            atividadeProfissional,
            endereco: {
                numero: parseInt(numeroCasa, 10),
                cep: cleanedCep,
                logradouro,
                bairro,
                localidade: cidade,
                uf: estado,
                complemento
            },
            contato: { celular: cleanedCel, email, contato }
        };
        try {
            const resp = await fetchAuthenticated(`/rest/clientes/${idCliente}/${idEndereco}`, { // <<< Alterado call
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!resp.ok) {
                const errJson = await resp.json().catch(() => ({}));
                throw new Error(errJson.message || resp.statusText);
            }
            setSuccess("✅ Cliente atualizado com sucesso!");
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(`❌ ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    // Busca de CEP
    const handleCepChange = async (value: string) => {
        const mask = cleanMaskedValue(value);
        setCep(value);
        setLogradouro("");
        setBairro("");
        setCidade("");
        setEstado("");

        if (mask.length === 8) {
            setIsSaving(true);
            setError(null);
            try {
                const resp = await fetch(`https://viacep.com.br/ws/${mask}/json/`);
                if (!resp.ok) throw new Error("CEP não encontrado.");
                const data = await resp.json();
                if (data.erro) throw new Error("CEP inválido.");
                setLogradouro(data.logradouro || "");
                setBairro(data.bairro || "");
                setCidade(data.localidade || "");
                setEstado(data.uf || "");
            } catch (e: any) {
                setError(`Erro CEP: ${e.message}`);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const cpfMask = "000.000.000-00";
    const cnpjMask = "00.000.000/0000-00";

    if (isLoading) {
        return (
            <>
                <NavBar active="clientes" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                    <p className="text-center text-sky-300 py-10">Carregando dados do cliente...</p>
                </main>
            </>
        );
    }

    if (error && !nome) {
        return (
            <>
                <NavBar active="clientes" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                    <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl max-w-2xl mx-auto">
                        <h2 className="flex items-center justify-center text-2xl font-bold mb-4 text-red-400">
                            <MdEdit className="mr-2 text-3xl" />
                            Erro ao Carregar
                        </h2>
                        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500 mb-6">
                            {error}
                        </p>
                        <div className="text-center">
                            <Link href="/clientes/listar">
                                <button className="px-6 py-3 bg-slate-600 text-white rounded-md shadow hover:bg-slate-700">
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
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-4xl">
                    <h2 className="flex items-center justify-center text-2xl md:text-3xl font-bold mb-6">
                        <MdEdit className="mr-2 text-3xl" />
                        Alterar Cliente (ID: {idCliente})
                    </h2>

                    {error && (
                        <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 rounded border border-red-500" role="alert">
                            <span className="block sm:inline">{error}</span>
                            <button
                                type="button"
                                className="absolute top-0 right-0 px-4 py-3 text-red-400 hover:text-red-200"
                                onClick={() => setError(null)}
                                aria-label="Fechar"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleUpdate}>

                        {/* Dados Pessoais */}
                        <fieldset className="mb-6 border border-slate-700 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2">Dados Pessoais</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Tipo de Cliente */}
                                <div>
                                    <label htmlFor="tipo_cliente" className="block mb-1 flex items-center">
                                        <MdBadge className="mr-2" /> Tipo de Cliente:
                                    </label>
                                    <select
                                        id="tipo_cliente"
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                        value={tipoCliente}
                                        onChange={e => setTipoCliente(e.target.value)}
                                    >
                                        <option value="PF">Pessoa Física</option>
                                        <option value="PJ">Pessoa Jurídica</option>
                                    </select>
                                </div>
                                {/* Nome */}
                                <div>
                                    <label htmlFor="nome" className="block mb-1 flex items-center">
                                        <MdPerson className="mr-2" /> Nome:
                                    </label>
                                    <input
                                        id="nome"
                                        type="text"
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                        value={nome}
                                        onChange={e => setNome(e.target.value)}
                                    />
                                </div>
                                {/* Sobrenome */}
                                <div>
                                    <label htmlFor="sobrenome" className="block mb-1 flex items-center">
                                        <MdBadge className="mr-2" /> Sobrenome:
                                    </label>
                                    <input
                                        id="sobrenome"
                                        type="text"
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                        value={sobrenome}
                                        onChange={e => setSobrenome(e.target.value)}
                                    />
                                </div>
                                {/* Sexo */}
                                <div>
                                    <label htmlFor="sexo" className="block mb-1 flex items-center">
                                        <MdPerson className="mr-2" /> Sexo:
                                    </label>
                                    <select
                                        id="sexo"
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                        value={sexo}
                                        onChange={e => setSexo(e.target.value)}
                                    >
                                        <option value="M">Masculino</option>
                                        <option value="F">Feminino</option>
                                        <option value="O">Outro</option>
                                    </select>
                                </div>
                                {/* Documento */}
                                <div>
                                    <label htmlFor="tipo_documento" className="block mb-1 flex items-center">
                                        <MdBadge className="mr-2" /> Documento:
                                    </label>
                                    <select
                                        id="tipo_documento"
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                        value={tipoDocumento}
                                        onChange={e => { setTipoDocumento(e.target.value); setNumeroDocumento(''); }}
                                    >
                                        <option value="CPF">CPF</option>
                                        <option value="CNPJ">CNPJ</option>
                                    </select>
                                </div>
                                {/* Nº Documento */}
                                <div>
                                    <label htmlFor="numero_documento" className="block mb-1 flex items-center">
                                        <MdBadge className="mr-2" /> Número:
                                    </label>
                                    <IMaskInput
                                        id="numero_documento"
                                        mask={tipoDocumento === 'CPF' ? cpfMask : cnpjMask}
                                        unmask={false}
                                        value={numeroDocumento}
                                        onAccept={v => setNumeroDocumento(v)}
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                    />
                                </div>
                                {/* Nascimento */}
                                <div>
                                    <label htmlFor="data_nascimento" className="block mb-1 flex items-center">
                                        <MdCalendarToday className="mr-2" /> Nascimento:
                                    </label>
                                    <input
                                        id="data_nascimento"
                                        type="date"
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 date-input-fix"
                                        value={dataNascimento}
                                        onChange={e => setDataNascimento(e.target.value)}
                                    />
                                </div>
                                {/* Profissão */}
                                <div>
                                    <label htmlFor="atividade_profissional" className="block mb-1 flex items-center">
                                        <MdWork className="mr-2" /> Profissão:
                                    </label>
                                    <input
                                        id="atividade_profissional"
                                        type="text"
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                        value={atividadeProfissional}
                                        onChange={e => setAtividadeProfissional(e.target.value)}
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* Contatos */}
                        <fieldset className="mb-6 border border-slate-700 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2">Contatos</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Celular */}
                                <div>
                                    <label htmlFor="celular" className="block mb-1 flex items-center">
                                        <MdPhone className="mr-2" /> Celular:
                                    </label>
                                    <IMaskInput
                                        id="celular"
                                        mask="(00) 00000-0000"
                                        unmask={false}
                                        value={celular}
                                        onAccept={v => setCelular(v)}
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                    />
                                </div>
                                {/* E-mail */}
                                <div>
                                    <label htmlFor="email" className="block mb-1 flex items-center">
                                        <MdEmail className="mr-2" /> E-mail:
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                                {/* Contato */}
                                <div className="md:col-span-2">
                                    <label htmlFor="contato" className="block mb-1 flex items-center">
                                        <MdPerson className="mr-2" /> Contato:
                                    </label>
                                    <input
                                        id="contato"
                                        type="text"
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                        value={contato}
                                        onChange={e => setContato(e.target.value)}
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* Endereço */}
                        <fieldset className="mb-6 border border-slate-700 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2">Endereço</legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* CEP */}
                                <div>
                                    <label htmlFor="cep" className="block mb-1 flex items-center">
                                        <MdLocationOn className="mr-2" /> CEP:
                                    </label>
                                    <IMaskInput
                                        id="cep"
                                        mask="00000-000"
                                        unmask={false}
                                        value={cep}
                                        onAccept={handleCepChange}
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                    />
                                </div>
                                {/* Logradouro */}
                                <div className="md:col-span-2">
                                    <label htmlFor="logradouro" className="block mb-1 flex items-center">
                                        <MdLocationOn className="mr-2" /> Logradouro:
                                    </label>
                                    <input
                                        id="logradouro"
                                        type="text"
                                        readOnly
                                        required
                                        className="w-full p-2 rounded bg-slate-700 border border-slate-600 cursor-not-allowed"
                                        value={logradouro}
                                    />
                                </div>
                                {/* Número */}
                                <div>
                                    <label htmlFor="numeroCasa" className="block mb-1 flex items-center">
                                        <MdHome className="mr-2" /> Número:
                                    </label>
                                    <input
                                        id="numeroCasa"
                                        type="text"
                                        maxLength={8}
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                        value={numeroCasa}
                                        onChange={e => setNumeroCasa(e.target.value)}
                                    />
                                </div>
                                {/* Complemento */}
                                <div>
                                    <label htmlFor="complemento" className="block mb-1 flex items-center">
                                        <MdHome className="mr-2" /> Complemento:
                                    </label>
                                    <input
                                        id="complemento"
                                        type="text"
                                        maxLength={100}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-sky-500"
                                        value={complemento}
                                        onChange={e => setComplemento(e.target.value)}
                                    />
                                </div>
                                {/* Bairro */}
                                <div>
                                    <label htmlFor="bairro" className="block mb-1 flex items-center">
                                        <MdLocationOn className="mr-2" /> Bairro:
                                    </label>
                                    <input
                                        id="bairro"
                                        type="text"
                                        readOnly
                                        required
                                        className="w-full p-2 rounded bg-slate-700 border border-slate-600 cursor-not-allowed"
                                        value={bairro}
                                    />
                                </div>
                                {/* Cidade */}
                                <div>
                                    <label htmlFor="cidade" className="block mb-1 flex items-center">
                                        <MdLocationOn className="mr-2" /> Cidade:
                                    </label>
                                    <input
                                        id="cidade"
                                        type="text"
                                        readOnly
                                        required
                                        className="w-full p-2 rounded bg-slate-700 border border-slate-600 cursor-not-allowed"
                                        value={cidade}
                                    />
                                </div>
                                {/* Estado */}
                                <div>
                                    <label htmlFor="estado" className="block mb-1 flex items-center">
                                        <MdLocationOn className="mr-2" /> Estado:
                                    </label>
                                    <input
                                        id="estado"
                                        type="text"
                                        maxLength={2}
                                        readOnly
                                        required
                                        className="w-full p-2 rounded bg-slate-700 border border-slate-600 cursor-not-allowed"
                                        value={estado}
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {success && (
                            <p className="text-center text-green-400 mb-4">{success}</p>
                        )}

                        {/* Botões */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`px-6 py-3 bg-green-600 text-white rounded-md shadow hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition ${
                                    isSaving ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                {isSaving ? (
                                    'Salvando...'
                                ) : (
                                    <span className="flex items-center">
                                        <MdEdit className="mr-2" />
                                        Salvar Alterações
                                    </span>
                                )}
                            </button>
                            <Link
                                href="/clientes/listar"
                                className="px-6 py-3 bg-slate-600 text-white rounded-md shadow hover:bg-slate-700 text-center focus:ring-2 focus:ring-slate-500"
                            >
                                Voltar para Lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>

            {/* CSS global */}
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: white !important; }
                input[type="date"]::-webkit-datetime-edit { color: white; }
            `}</style>
        </>
    );
}