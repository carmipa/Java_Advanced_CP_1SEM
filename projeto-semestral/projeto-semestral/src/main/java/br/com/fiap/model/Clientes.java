package br.com.fiap.model;

import java.util.Objects;

public class Clientes {

	private Long codigo;
	private String tipoCliente;
	private String nome;
	private String sobrenome;
	private String sexo;
	private String tipoDocumento;
	private String numeroDocumento;
	private String dataNascimento;
	private String atividadeProfissional;
	private Endereco endereco;
	private Contato contato;

	// Construtor padrão
	public Clientes() {
	}

	// Construtor completo
	public Clientes(Long codigo, Contato contato, Endereco endereco, String atividadeProfissional, String dataNascimento, String numeroDocumento, String tipoDocumento, String sexo, String sobrenome, String nome, String tipoCliente) {
		this.codigo = codigo;
		this.contato = contato;
		this.endereco = endereco;
		this.atividadeProfissional = atividadeProfissional;
		this.dataNascimento = dataNascimento;
		this.numeroDocumento = numeroDocumento;
		this.tipoDocumento = tipoDocumento;
		this.sexo = sexo;
		this.sobrenome = sobrenome;
		this.nome = nome;
		this.tipoCliente = tipoCliente;
	}

	// Novo construtor que aceita apenas Long e String
	public Clientes(Long codigo, String nome) {
		this.codigo = codigo;
		this.nome = nome;
	}

	// Getters e setters
	public Long getCodigo() {
		return codigo;
	}

	public void setCodigo(Long codigo) {
		this.codigo = codigo;
	}

	public String getTipoCliente() {
		return tipoCliente;
	}

	public void setTipoCliente(String tipoCliente) {
		this.tipoCliente = tipoCliente;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getSobrenome() {
		return sobrenome;
	}

	public void setSobrenome(String sobrenome) {
		this.sobrenome = sobrenome;
	}

	public String getSexo() {
		return sexo;
	}

	public void setSexo(String sexo) {
		this.sexo = sexo;
	}

	public String getTipoDocumento() {
		return tipoDocumento;
	}

	public void setTipoDocumento(String tipoDocumento) {
		this.tipoDocumento = tipoDocumento;
	}

	public String getNumeroDocumento() {
		return numeroDocumento;
	}

	public void setNumeroDocumento(String numeroDocumento) {
		this.numeroDocumento = numeroDocumento;
	}

	public String getDataNascimento() {
		return dataNascimento;
	}

	public void setDataNascimento(String dataNascimento) {
		this.dataNascimento = dataNascimento;
	}

	public String getAtividadeProfissional() {
		return atividadeProfissional;
	}

	public void setAtividadeProfissional(String atividadeProfissional) {
		this.atividadeProfissional = atividadeProfissional;
	}

	public Endereco getEndereco() {
		return endereco;
	}

	public void setEndereco(Endereco endereco) {
		this.endereco = endereco;
	}

	public Contato getContato() {
		return contato;
	}

	public void setContato(Contato contato) {
		this.contato = contato;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (!(o instanceof Clientes)) return false;
		Clientes clientes = (Clientes) o;
		return Objects.equals(codigo, clientes.codigo) &&
				Objects.equals(tipoCliente, clientes.tipoCliente) &&
				Objects.equals(nome, clientes.nome) &&
				Objects.equals(sobrenome, clientes.sobrenome) &&
				Objects.equals(sexo, clientes.sexo) &&
				Objects.equals(tipoDocumento, clientes.tipoDocumento) &&
				Objects.equals(numeroDocumento, clientes.numeroDocumento) &&
				Objects.equals(dataNascimento, clientes.dataNascimento) &&
				Objects.equals(atividadeProfissional, clientes.atividadeProfissional) &&
				Objects.equals(endereco, clientes.endereco) &&
				Objects.equals(contato, clientes.contato);
	}

	@Override
	public int hashCode() {
		return Objects.hash(codigo, tipoCliente, nome, sobrenome, sexo, tipoDocumento, numeroDocumento, dataNascimento, atividadeProfissional, endereco, contato);
	}

	@Override
	public String toString() {
		return "Clientes{" +
				"codigo=" + codigo +
				", tipoCliente='" + tipoCliente + '\'' +
				", nome='" + nome + '\'' +
				", sobrenome='" + sobrenome + '\'' +
				", sexo='" + sexo + '\'' +
				", tipoDocumento='" + tipoDocumento + '\'' +
				", numeroDocumento='" + numeroDocumento + '\'' +
				", dataNascimento='" + dataNascimento + '\'' +
				", atividadeProfissional='" + atividadeProfissional + '\'' +
				", endereco=" + endereco +
				", contato=" + contato +
				'}';
	}
}