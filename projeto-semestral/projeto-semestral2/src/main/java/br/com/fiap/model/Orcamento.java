package br.com.fiap.model;

import java.util.Objects;

public class Orcamento {

	private Long codigo;
	private String dataOrcamento;
	private double maoDeObra;
	private double valorHora;
	private int quantidadeHoras;
	private double valorTotal;
	private Oficina oficina;
	private Pecas pecas;

	public Orcamento() {
		super();
	}

	public Orcamento(Long codigo, double valorTotal, int quantidadeHoras, double valorHora, double maoDeObra, String dataOrcamento) {
		this.codigo = codigo;
		this.valorTotal = valorTotal;
		this.quantidadeHoras = quantidadeHoras;
		this.valorHora = valorHora;
		this.maoDeObra = maoDeObra;
		this.dataOrcamento = dataOrcamento;
	}

	public Long getCodigo() {
		return codigo;
	}

	public void setCodigo(Long codigo) {
		this.codigo = codigo;
	}

	public String getDataOrcamento() {
		return dataOrcamento;
	}

	public void setDataOrcamento(String dataOrcamento) {
		this.dataOrcamento = dataOrcamento;
	}

	public double getMaoDeObra() {
		return maoDeObra;
	}

	public void setMaoDeObra(double maoDeObra) {
		this.maoDeObra = maoDeObra;
	}

	public double getValorHora() {
		return valorHora;
	}

	public void setValorHora(double valorHora) {
		this.valorHora = valorHora;
	}

	public int getQuantidadeHoras() {
		return quantidadeHoras;
	}

	public void setQuantidadeHoras(int quantidadeHoras) {
		this.quantidadeHoras = quantidadeHoras;
	}

	public double getValorTotal() {
		return valorTotal;
	}

	public void setValorTotal(double valorTotal) {
		this.valorTotal = valorTotal;
	}

	public Oficina getOficina() {
		return oficina;
	}

	public void setOficina(Oficina oficina) {
		this.oficina = oficina;
	}

	public Pecas getPecas() {
		return pecas;
	}

	public void setPecas(Pecas pecas) {
		this.pecas = pecas;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (!(o instanceof Orcamento orcamento)) return false;
        return Double.compare(maoDeObra, orcamento.maoDeObra) == 0 && Double.compare(valorHora, orcamento.valorHora) == 0 && quantidadeHoras == orcamento.quantidadeHoras && Double.compare(valorTotal, orcamento.valorTotal) == 0 && Objects.equals(codigo, orcamento.codigo) && Objects.equals(dataOrcamento, orcamento.dataOrcamento) && Objects.equals(oficina, orcamento.oficina) && Objects.equals(pecas, orcamento.pecas);
	}

	@Override
	public int hashCode() {
		return Objects.hash(codigo, dataOrcamento, maoDeObra, valorHora, quantidadeHoras, valorTotal, oficina, pecas);
	}

	@Override
	public String toString() {
		return "Orcamento{" +
				"codigo=" + codigo +
				", dataOrcamento='" + dataOrcamento + '\'' +
				", maoDeObra=" + maoDeObra +
				", valorHora=" + valorHora +
				", quantidadeHoras=" + quantidadeHoras +
				", valorTotal=" + valorTotal +
				'}';
	}
}
