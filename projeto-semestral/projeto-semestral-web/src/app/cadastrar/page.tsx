import NavBar from "@/components/nav-bar";
import Link from "next/link";

export default function CadastrarPage() {
    return (
        <>
            <NavBar active="cadastrar" />

            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4">
                <div className="bg-slate-900 p-6 m-10 rounded min-w-[300px] max-w-4xl gap-50">
                    <h2 className="text-2xl font-bold mb-4">Cadastrar</h2>
                    <form>
                        {/* Dados Pessoais */}
                        <fieldset className="mb-6">
                            <legend className="text-xl font-semibold mb-2">Dados Pessoais</legend>

                            <div className="mb-4">
                                <label htmlFor="tipo_cliente" className="block mb-1">
                                    Tipo de Cliente:
                                </label>
                                <select
                                    id="tipo_cliente"
                                    name="tipo_cliente"
                                    required
                                    className="w-full p-2 rounded bg-white text-black"
                                >
                                    <option value="PF">Pessoa Física</option>
                                    <option value="PJ">Pessoa Jurídica</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="nome" className="block mb-1">
                                    Nome:
                                </label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    required
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="sobrenome" className="block mb-1">
                                    Sobrenome:
                                </label>
                                <input
                                    type="text"
                                    id="sobrenome"
                                    name="sobrenome"
                                    required
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="sexo" className="block mb-1">
                                    Sexo:
                                </label>
                                <select
                                    id="sexo"
                                    name="sexo"
                                    required
                                    className="w-full p-2 rounded bg-white text-black"
                                >
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="tipo_documento" className="block mb-1">
                                    Tipo de Documento:
                                </label>
                                <select
                                    id="tipo_documento"
                                    name="tipo_documento"
                                    required
                                    className="w-full p-2 rounded bg-white text-black"
                                >
                                    <option value="CPF">CPF</option>
                                    <option value="CNPJ">CNPJ</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="numero_documento" className="block mb-1">
                                    Número do Documento:
                                </label>
                                <input
                                    type="text"
                                    id="numero_documento"
                                    name="numero_documento"
                                    placeholder="Digite CPF ou CNPJ"
                                    maxLength="18"
                                    required
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="data_nascimento" className="block mb-1">
                                    Data de Nascimento:
                                </label>
                                <input
                                    type="date"
                                    id="data_nascimento"
                                    name="data_nascimento"
                                    required
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="atividade_profissional" className="block mb-1">
                                    Atividade Profissional:
                                </label>
                                <input
                                    type="text"
                                    id="atividade_profissional"
                                    name="atividade_profissional"
                                    required
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>
                        </fieldset>

                        {/* Contatos */}
                        <fieldset className="mb-6">
                            <legend className="text-xl font-semibold mb-2">Contatos</legend>

                            <div className="mb-4">
                                <label htmlFor="celular" className="block mb-1">
                                    Celular:
                                </label>
                                <input
                                    type="text"
                                    id="celular"
                                    name="celular"
                                    maxLength="15"
                                    placeholder="(99) 99999-9999"
                                    pattern="\([0-9]{2}\) [0-9]{5}-[0-9]{4}"
                                    required
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="block mb-1">
                                    E-mail:
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="exemplo@dominio.com"
                                    required
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="contato" className="block mb-1">
                                    Contato:
                                </label>
                                <input
                                    type="text"
                                    id="contato"
                                    name="contato"
                                    required
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>
                        </fieldset>

                        {/* Endereço */}
                        <fieldset className="mb-6">
                            <legend className="text-xl font-semibold mb-2">Endereço</legend>

                            <div className="mb-4">
                                <label htmlFor="numeroCasa" className="block mb-1">
                                    Número:
                                </label>
                                <input
                                    type="text"
                                    id="numeroCasa"
                                    name="numeroCasa"
                                    maxLength="8"
                                    required
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="cep" className="block mb-1">
                                    CEP:
                                </label>
                                <input
                                    type="text"
                                    id="cep"
                                    name="cep"
                                    maxLength="9"
                                    placeholder="99999-999"
                                    required
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="logradouro" className="block mb-1">
                                    Logradouro:
                                </label>
                                <input
                                    type="text"
                                    id="logradouro"
                                    name="logradouro"
                                    maxLength="100"
                                    required
                                    readOnly
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="bairro" className="block mb-1">
                                    Bairro:
                                </label>
                                <input
                                    type="text"
                                    id="bairro"
                                    name="bairro"
                                    maxLength="100"
                                    required
                                    readOnly
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="cidade" className="block mb-1">
                                    Cidade:
                                </label>
                                <input
                                    type="text"
                                    id="cidade"
                                    name="cidade"
                                    maxLength="100"
                                    required
                                    readOnly
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="estado" className="block mb-1">
                                    Estado:
                                </label>
                                <input
                                    type="text"
                                    id="estado"
                                    name="estado"
                                    maxLength="50"
                                    required
                                    readOnly
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="complemento" className="block mb-1">
                                    Complemento:
                                </label>
                                <input
                                    type="text"
                                    id="complemento"
                                    name="complemento"
                                    maxLength="100"
                                    required
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>
                        </fieldset>

                        <div className="flex items-center justify-center gap-50">
                            <button
                                type="submit"
                                className="px-6 py-3 font-semibold text-white bg-[#075985] rounded-md shadow hover:bg-[#075985]/90"
                            >
                                Cadastrar Cliente
                            </button>
                            <Link
                                href="/menu_clientes"
                                className="px-6 py-3 font-semibold text-white bg-[#075985] rounded-md shadow hover:bg-[#075985]/90 text-center"
                            >
                                Voltar
                            </Link>
                        </div>

                    </form>
                </div>
            </main>
        </>
    );
}
