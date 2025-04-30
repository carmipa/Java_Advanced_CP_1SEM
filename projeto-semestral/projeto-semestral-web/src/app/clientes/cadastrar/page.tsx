"use client";

import NavBar from "@/components/nav-bar";
import { useState, FormEvent } from "react";
import { IMaskInput } from "react-imask";
import {
    MdPersonAddAlt1,
    MdPerson,
    MdBadge,
    MdCalendarToday,
    MdWork,
    MdPhone,
    MdEmail,
    MdLocationOn,
    MdHome
} from "react-icons/md";

// Função auxiliar para limpar máscaras (remover não-dígitos)
const cleanMaskedValue = (value: string): string => value.replace(/\D/g, '');

export default function CadastrarPage() {
    // --- Estados Iniciais ---
    const initialState = {
        tipoCliente: "PF", nome: "", sobrenome: "", sexo: "M", tipoDocumento: "CPF",
        numeroDocumento: "", dataNascimento: "", atividadeProfissional: "",
        celular: "", email: "", contato: "", numeroCasa: "", cep: "",
        logradouro: "", bairro: "", cidade: "", estado: "", complemento: ""
    };

    // --- Variáveis de Estado ---
    const [tipoCliente, setTipoCliente] = useState(initialState.tipoCliente);
    const [nome, setNome] = useState(initialState.nome);
    const [sobrenome, setSobrenome] = useState(initialState.sobrenome);
    const [sexo, setSexo] = useState(initialState.sexo);
    const [tipoDocumento, setTipoDocumento] = useState(initialState.tipoDocumento);
    const [numeroDocumento, setNumeroDocumento] = useState(initialState.numeroDocumento);
    const [dataNascimento, setDataNascimento] = useState(initialState.dataNascimento);
    const [atividadeProfissional, setAtividadeProfissional] = useState(initialState.atividadeProfissional);
    const [celular, setCelular] = useState(initialState.celular);
    const [email, setEmail] = useState(initialState.email);
    const [contato, setContato] = useState(initialState.contato);
    const [numeroCasa, setNumeroCasa] = useState(initialState.numeroCasa);
    const [cep, setCep] = useState(initialState.cep);
    const [logradouro, setLogradouro] = useState(initialState.logradouro);
    const [bairro, setBairro] = useState(initialState.bairro);
    const [cidade, setCidade] = useState(initialState.cidade);
    const [estado, setEstado] = useState(initialState.estado);
    const [complemento, setComplemento] = useState(initialState.complemento);

    // --- Feedback da API ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // --- Limpa o formulário ---
    const resetForm = () => {
        setTipoCliente(initialState.tipoCliente);
        setNome(initialState.nome);
        setSobrenome(initialState.sobrenome);
        setSexo(initialState.sexo);
        setTipoDocumento(initialState.tipoDocumento);
        setNumeroDocumento(initialState.numeroDocumento);
        setDataNascimento(initialState.dataNascimento);
        setAtividadeProfissional(initialState.atividadeProfissional);
        setCelular(initialState.celular);
        setEmail(initialState.email);
        setContato(initialState.contato);
        setNumeroCasa(initialState.numeroCasa);
        setCep(initialState.cep);
        setLogradouro(initialState.logradouro);
        setBairro(initialState.bairro);
        setCidade(initialState.cidade);
        setEstado(initialState.estado);
        setComplemento(initialState.complemento);
        setError(null);
    };

    // --- Envia para API ---
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

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

        try {
            const response = await fetch("http://localhost:8080/rest/clientes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clienteData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    message: `Erro ${response.status}: ${response.statusText}.`
                }));
                throw new Error(errorData.message);
            }

            await response.json();
            setSuccess("✅ Cliente cadastrado com sucesso!");
            resetForm();

            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(`❌ ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Busca CEP via viacep ---
    const handleCepChange = async (value: string) => {
        const maskedCep = value;
        const newCep = cleanMaskedValue(maskedCep);
        setCep(maskedCep);
        setLogradouro(''); setBairro(''); setCidade(''); setEstado('');

        if (newCep.length === 8) {
            setIsLoading(true);
            setError(null);
            try {
                const resp = await fetch(`https://viacep.com.br/ws/${newCep}/json/`);
                if (!resp.ok) throw new Error('CEP não encontrado');
                const data = await resp.json();
                if (data.erro) throw new Error('CEP inválido');
                setLogradouro(data.logradouro || '');
                setBairro(data.bairro || '');
                setCidade(data.localidade || '');
                setEstado(data.uf || '');
            } catch (e: any) {
                setError(`❌ Erro ao buscar CEP: ${e.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const cpfMask = "000.000.000-00";
    const cnpjMask = "00.000.000/0000-00";

    return (
        <>
            <NavBar active="cadastrar" />

            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
                <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center flex items-center justify-center">
                        <MdPersonAddAlt1 className="inline-block mr-2 text-3xl" />
                        Cadastrar Cliente
                    </h2>

                    {error && (
                        <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 rounded border border-red-500" role="alert">
                            <span className="block sm:inline">{error}</span>
                            <button
                                type="button"
                                className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200"
                                onClick={() => setError(null)}
                                aria-label="Fechar"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

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

                                {/* Tipo de Documento */}
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

                                {/* Número do Documento */}
                                <div>
                                    <label htmlFor="numero_documento" className="block mb-1 flex items-center">
                                        <MdBadge className="mr-2" /> Número:
                                    </label>
                                    <IMaskInput
                                        id="numero_documento"
                                        mask={tipoDocumento === 'CPF' ? cpfMask : cnpjMask}
                                        unmask={false}
                                        value={numeroDocumento}
                                        onAccept={value => setNumeroDocumento(value)}
                                        required
                                        placeholder={tipoDocumento === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                    />
                                </div>

                                {/* Data de Nascimento */}
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

                                {/* Atividade Profissional */}
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
                                        onAccept={value => setCelular(value)}
                                        required
                                        placeholder="(99) 99999-9999"
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
                                        placeholder="exemplo@dominio.com"
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>

                                {/* Contato Principal */}
                                <div className="md:col-span-2">
                                    <label htmlFor="contato" className="block mb-1 flex items-center">
                                        <MdPerson className="mr-2" /> Contato Principal:
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
                                        placeholder="00000-000"
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
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500"
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

                        {/* Botão de Envio */}
                        <div className="flex justify-center mt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`px-6 py-3 font-semibold text-white bg-sky-600 rounded-md shadow hover:bg-sky-700 focus:ring-2 focus:ring-sky-500 transition ${
                                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                {isLoading ? (
                                    "Cadastrando..."
                                ) : (
                                    <span className="flex items-center">
                    <MdPersonAddAlt1 className="inline-block mr-2" />
                    Cadastrar Cliente
                  </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Estilos Globais */}
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: white !important; }
                input[type="date"]::-webkit-datetime-edit { color: white; }
            `}</style>
        </>
    );
}
