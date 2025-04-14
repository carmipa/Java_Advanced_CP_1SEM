package br.com.fiap.model;

import java.util.Objects;

public class Veiculo {

	private Long codigo;
	private String tipoVeiculo;
	private String renavam;
	private String placa;
	private String proprietario;
	private String modelo;
	private String cor;
	private String montadora;
	private String motor;
	private String anofabricacao;

	public Veiculo() {
	}

	public Veiculo(Long codigo, String tipoVeiculo, String renavam, String placa, String proprietario, String modelo, String cor, String montadora, String motor, String anofabricacao) {
		this.codigo = codigo;
		this.tipoVeiculo = tipoVeiculo;
		this.renavam = renavam;
		this.placa = placa;
		this.proprietario = proprietario;
		this.modelo = modelo;
		this.cor = cor;
		this.montadora = montadora;
		this.motor = motor;
		this.anofabricacao = anofabricacao;
	}

	public Long getCodigo() {
		return codigo;
	}

	public void setCodigo(Long codigo) {
		this.codigo = codigo;
	}

	public String getTipoVeiculo() {
		return tipoVeiculo;
	}

	public void setTipoVeiculo(String tipoVeiculo) {
		this.tipoVeiculo = tipoVeiculo;
	}

	public String getRenavam() {
		return renavam;
	}

	public void setRenavam(String renavam) {
		this.renavam = renavam;
	}

	public String getPlaca() {
		return placa;
	}

	public void setPlaca(String placa) {
		this.placa = placa;
	}

	public String getProprietario() {
		return proprietario;
	}

	public void setProprietario(String proprietario) {
		this.proprietario = proprietario;
	}

	public String getModelo() {
		return modelo;
	}

	public void setModelo(String modelo) {
		this.modelo = modelo;
	}

	public String getCor() {
		return cor;
	}

	public void setCor(String cor) {
		this.cor = cor;
	}

	public String getMontadora() {
		return montadora;
	}

	public void setMontadora(String montadora) {
		this.montadora = montadora;
	}

	public String getMotor() {
		return motor;
	}

	public void setMotor(String motor) {
		this.motor = motor;
	}

	public String getAnofabricacao() {
		return anofabricacao;
	}

	public void setAnofabricacao(String anofabricacao) {
		this.anofabricacao = anofabricacao;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (!(o instanceof Veiculo veiculo)) return false;
        return Objects.equals(codigo, veiculo.codigo) && Objects.equals(tipoVeiculo, veiculo.tipoVeiculo) && Objects.equals(renavam, veiculo.renavam) && Objects.equals(placa, veiculo.placa) && Objects.equals(proprietario, veiculo.proprietario) && Objects.equals(modelo, veiculo.modelo) && Objects.equals(cor, veiculo.cor) && Objects.equals(montadora, veiculo.montadora) && Objects.equals(motor, veiculo.motor) && Objects.equals(anofabricacao, veiculo.anofabricacao);
	}

	@Override
	public int hashCode() {
		return Objects.hash(codigo, tipoVeiculo, renavam, placa, proprietario, modelo, cor, montadora, motor, anofabricacao);
	}

	@Override
	public String toString() {
		return "Veiculo{" +
				"codigo=" + codigo +
				", tipoVeiculo='" + tipoVeiculo + '\'' +
				", renavam='" + renavam + '\'' +
				", placa='" + placa + '\'' +
				", proprietario='" + proprietario + '\'' +
				", modelo='" + modelo + '\'' +
				", cor='" + cor + '\'' +
				", montadora='" + montadora + '\'' +
				", motor='" + motor + '\'' +
				", anofabricacao='" + anofabricacao + '\'' +
				'}';
	}
}
