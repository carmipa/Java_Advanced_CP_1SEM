// Adicione esta diretiva no topo para usar Hooks React
"use client";

import NavBar from "@/components/nav-bar"; // Garanta que este componente exista no seu projeto
// import Link from "next/link"; // Removido pois o botão Voltar será removido
import { useState, FormEvent } from "react"; // Importa useState e FormEvent
import { IMaskInput } from 'react-imask'; // Importa da biblioteca 'react-imask'

// Função auxiliar para limpar máscaras (remover não-dígitos)
const cleanMaskedValue = (value: string): string => {
    return value.replace(/\D/g, '');
};

export default function CadastrarPage() {
    // --- Estados Iniciais ---
    const initialState = {
        tipoCliente: "PF", nome: "", sobrenome: "", sexo: "M", tipoDocumento: "CPF",
        numeroDocumento: "", dataNascimento: "", atividadeProfissional: "",
        celular: "", email: "", contato: "", numeroCasa: "", cep: "",
        logradouro: "", bairro: "", cidade: "", estado: "", complemento: ""
    };

    // --- Variáveis de Estado para os Inputs do Formulário ---
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

    // --- Estado para Feedback da API ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null); // Mantido para a mensagem de texto

    // --- Função para Limpar o Formulário ---
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
        setError(null); // Limpa erros também
        // setSuccess(null); // <<< REMOVIDO daqui para a msg não sumir imediatamente
    };


    // --- Manipulador de Submissão do Formulário ---
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null); // Limpa msg de sucesso anterior ao tentar novo envio

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

        console.log('Enviando dados (limpos) para API:', JSON.stringify(clienteData, null, 2));
        const apiUrl = "http://localhost:8080/rest/clientes";

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clienteData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}. Resposta não contém JSON.` }));
                throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("Success:", result);
            setSuccess("Cliente cadastrado com sucesso!"); // Define a mensagem
            resetForm(); // Limpa o formulário

            // Limpa a mensagem de sucesso após alguns segundos
            setTimeout(() => {
                setSuccess(null);
            }, 5000); // 5000 milissegundos = 5 segundos

        } catch (err: any) {
            console.error("API Error:", err);
            setError(err.message || "Falha ao conectar com a API ou processar a resposta.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Lógica de busca de CEP ---
    const handleCepChange = async (value: string) => {
        const maskedCep = value;
        const newCep = cleanMaskedValue(maskedCep);
        setCep(maskedCep);

        setLogradouro(''); setBairro(''); setCidade(''); setEstado('');

        if (newCep.length === 8) {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${newCep}/json/`);
                if (!response.ok) throw new Error('CEP não encontrado ou falha na rede');
                const data = await response.json();
                if (data.erro) { throw new Error('CEP inválido retornado pela API'); }
                setLogradouro(data.logradouro || '');
                setBairro(data.bairro || '');
                setCidade(data.localidade || '');
                setEstado(data.uf || '');
            } catch (cepError: any) {
                console.error("CEP Error:", cepError);
                setError(`Erro ao buscar CEP: ${cepError.message}`);
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
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Cadastrar Cliente</h2>

                    <form onSubmit={handleSubmit}>

                        {/* Caixa de Mensagem de Erro (mantida) */}
                        {error && (
                            <div className="relative mb-4 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                                <span className="block sm:inline">{error}</span>
                                <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar">
                                    <span className="text-2xl" aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        )}

                        {/* Formulário ... */}
                        {/* Dados Pessoais */}
                        <fieldset className="mb-6 border border-slate-700 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2">Dados Pessoais</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* ... Inputs com IMaskInput onde aplicável ... */}
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

                        {/* <<< Mensagem de Sucesso Simples (acima do botão) >>> */}
                        {success && (
                            <p className="text-center text-green-400 mb-4">{success}</p>
                        )}

                        {/* Botões de Ação (Botão Voltar Removido) */}
                        <div className="flex items-center justify-center gap-4 mt-6"> {/* Ajustado para centralizar único botão */}
                            <button
                                type="submit"
                                className={`px-6 py-3 font-semibold text-white bg-sky-600 rounded-md shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Cadastrando...' : 'Cadastrar Cliente'}
                            </button>
                            {/* Link Voltar Removido */}
                        </div>
                    </form>
                </div>
            </main>

            {/* Estilos CSS Globais (mantidos) */}
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: white !important; }
                input[type="date"]::-webkit-datetime-edit { color: white; }
            `}</style>
        </>
    );
}
