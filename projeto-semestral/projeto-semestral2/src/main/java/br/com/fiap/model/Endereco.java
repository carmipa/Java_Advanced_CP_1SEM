package br.com.fiap.model;

import com.google.gson.annotations.SerializedName;

import java.util.Objects;

public class Endereco {

	// a variável código não sera gerado o metodo get e set, neste caso, poís
	// futuramente será autogerada pelo banco de dados.

	private Long codigo;
	private int numero;
	private String cep;
	private String logradouro;
	@SerializedName("localidade")  // Mapeia o campo "localidade" da resposta JSON para "cidade"
	private String cidade;
	private String bairro;
	@SerializedName("uf")  // Mapeia o campo "uf" da resposta JSON para "estado"
	private String estado;
	private String complemento;


	public Endereco() {
		super();

	}

	public Endereco(Long codigo, int numero, String cep, String logradouro, String cidade, String estado, String bairro, String complemento) {
		this.codigo = codigo;
		this.numero = numero;
		this.cep = cep;
		this.logradouro = logradouro;
		this.cidade = cidade;
		this.estado = estado;
		this.bairro = bairro;
		this.complemento = complemento;
	}

	public Long getCodigo() {
		return codigo;
	}

	public void setCodigo(Long codigo) {
		this.codigo = codigo;
	}

	public int getNumero() {
		return numero;
	}

	public void setNumero(int numero) {
		this.numero = numero;
	}

	public String getCep() {
		return cep;
	}

	public void setCep(String cep) {
		this.cep = cep;
	}

	public String getLogradouro() {
		return logradouro;
	}

	public void setLogradouro(String logradouro) {
		this.logradouro = logradouro;
	}

	public String getCidade() {
		return cidade;
	}

	public void setCidade(String cidade) {
		this.cidade = cidade;
	}

	public String getBairro() {
		return bairro;
	}

	public void setBairro(String bairro) {
		this.bairro = bairro;
	}

	public String getEstado() {
		return estado;
	}

	public void setEstado(String estado) {
		this.estado = estado;
	}

	public String getComplemento() {
		return complemento;
	}

	public void setComplemento(String complemento) {
		this.complemento = complemento;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (!(o instanceof Endereco endereco)) return false;
        return numero == endereco.numero && Objects.equals(codigo, endereco.codigo) && Objects.equals(cep, endereco.cep) && Objects.equals(logradouro, endereco.logradouro) && Objects.equals(cidade, endereco.cidade) && Objects.equals(bairro, endereco.bairro) && Objects.equals(estado, endereco.estado) && Objects.equals(complemento, endereco.complemento);
	}

	@Override
	public int hashCode() {
		return Objects.hash(codigo, numero, cep, logradouro, cidade, bairro, estado, complemento);
	}

	@Override
	public String toString() {
		return "Endereco{" +
				"codigo=" + codigo +
				", numero=" + numero +
				", cep='" + cep + '\'' +
				", logradouro='" + logradouro + '\'' +
				", cidade='" + cidade + '\'' +
				", bairro='" + bairro + '\'' +
				", estado='" + estado + '\'' +
				", complemento='" + complemento + '\'' +
				'}';
	}
}
