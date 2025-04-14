package br.com.fiap.model;

import java.util.Objects;

public class Pecas {

	private Long codigo;
	private String tipoVeiculo;
	private String fabricante;
	private String descricao;
	private String dataCompra;
	private double preco;
	private double desconto;
	private double totalDesconto;

	public Pecas() {
		super();
	}

	public Pecas(Long codigo, String tipoVeiculo, String fabricante, String descricao, String dataCompra, double preco, double desconto, double totalDesconto) {
		this.codigo = codigo;
		this.tipoVeiculo = tipoVeiculo;
		this.fabricante = fabricante;
		this.descricao = descricao;
		this.dataCompra = dataCompra;
		this.preco = preco;
		this.desconto = desconto;
		this.totalDesconto = totalDesconto;
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

	public String getFabricante() {
		return fabricante;
	}

	public void setFabricante(String fabricante) {
		this.fabricante = fabricante;
	}

	public String getDescricao() {
		return descricao;
	}

	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}

	public String getDataCompra() {
		return dataCompra;
	}

	public void setDataCompra(String dataCompra) {
		this.dataCompra = dataCompra;
	}

	public double getPreco() {
		return preco;
	}

	public void setPreco(double preco) {
		this.preco = preco;
	}

	public double getDesconto() {
		return desconto;
	}

	public void setDesconto(double desconto) {
		this.desconto = desconto;
	}

	public double getTotalDesconto() {
		return totalDesconto;
	}

	public void setTotalDesconto(double totalDesconto) {
		this.totalDesconto = totalDesconto;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (!(o instanceof Pecas pecas)) return false;
        return Double.compare(preco, pecas.preco) == 0 && Double.compare(desconto, pecas.desconto) == 0 && Double.compare(totalDesconto, pecas.totalDesconto) == 0 && Objects.equals(codigo, pecas.codigo) && Objects.equals(tipoVeiculo, pecas.tipoVeiculo) && Objects.equals(fabricante, pecas.fabricante) && Objects.equals(descricao, pecas.descricao) && Objects.equals(dataCompra, pecas.dataCompra);
	}

	@Override
	public int hashCode() {
		return Objects.hash(codigo, tipoVeiculo, fabricante, descricao, dataCompra, preco, desconto, totalDesconto);
	}

	@Override
	public String toString() {
		return "Pecas{" +
				"codigo=" + codigo +
				", tipoVeiculo='" + tipoVeiculo + '\'' +
				", fabricante='" + fabricante + '\'' +
				", descricao='" + descricao + '\'' +
				", dataCompra='" + dataCompra + '\'' +
				", preco=" + preco +
				", desconto=" + desconto +
				", totalDesconto=" + totalDesconto +
				'}';
	}
}
