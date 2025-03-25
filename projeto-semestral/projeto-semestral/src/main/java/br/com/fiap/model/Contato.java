package br.com.fiap.model;

import java.util.Objects;

public class Contato {

	private Long codigo;
	private String celular;
	private String email;
	private String contato;

	public Contato() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Contato(Long codigo, String celular, String email, String contato) {
		this.codigo = codigo;
		this.celular = celular;
		this.email = email;
		this.contato = contato;
	}

	public Long getCodigo() {
		return codigo;
	}

	public void setCodigo(Long codigo) {
		this.codigo = codigo;
	}

	public String getCelular() {
		return celular;
	}

	public void setCelular(String celular) {
		this.celular = celular;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getContato() {
		return contato;
	}

	public void setContato(String contato) {
		this.contato = contato;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (!(o instanceof Contato contato1)) return false;
        return Objects.equals(codigo, contato1.codigo) && Objects.equals(celular, contato1.celular) && Objects.equals(email, contato1.email) && Objects.equals(contato, contato1.contato);
	}

	@Override
	public int hashCode() {
		return Objects.hash(codigo, celular, email, contato);
	}

	@Override
	public String toString() {
		return "Contato{" +
				"codigo=" + codigo +
				", celular='" + celular + '\'' +
				", email='" + email + '\'' +
				", contato='" + contato + '\'' +
				'}';
	}
}
