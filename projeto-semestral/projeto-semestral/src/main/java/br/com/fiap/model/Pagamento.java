package br.com.fiap.model;

import java.util.Objects;

public class Pagamento {

	private Long codigo;
	private String dataPagamento;
	private String tipoPagamento;
	private double desconto;
	private int parcelamento;
	private double valorParcelas;
	private double totalComDesconto;
	private Orcamento orcamento;
	private Pecas pecas;

	public Pagamento() {
		super();
	}

	public Pagamento(Long codigo, String dataPagamento, String tipoPagamento, double desconto, int parcelamento, double valorParcelas, double totalComDesconto) {
		this.codigo = codigo;
		this.dataPagamento = dataPagamento;
		this.tipoPagamento = tipoPagamento;
		this.desconto = desconto;
		this.parcelamento = parcelamento;
		this.valorParcelas = valorParcelas;
		this.totalComDesconto = totalComDesconto;
	}

	public Pecas getPecas() {
		return pecas;
	}

	public void setPecas(Pecas pecas) {
		this.pecas = pecas;
	}

	public double getTotalComDesconto() {
		return totalComDesconto;
	}

	public void setTotalComDesconto(double totalComDesconto) {
		this.totalComDesconto = totalComDesconto;
	}

	public Orcamento getOrcamento() {
		return orcamento;
	}

	public void setOrcamento(Orcamento orcamento) {
		this.orcamento = orcamento;
	}

	public double getValorParcelas() {
		return valorParcelas;
	}

	public void setValorParcelas(double valorParcelas) {
		this.valorParcelas = valorParcelas;
	}

	public int getParcelamento() {
		return parcelamento;
	}

	public void setParcelamento(int parcelamento) {
		this.parcelamento = parcelamento;
	}

	public double getDesconto() {
		return desconto;
	}

	public void setDesconto(double desconto) {
		this.desconto = desconto;
	}

	public String getTipoPagamento() {
		return tipoPagamento;
	}

	public void setTipoPagamento(String tipoPagamento) {
		this.tipoPagamento = tipoPagamento;
	}

	public String getDataPagamento() {
		return dataPagamento;
	}

	public void setDataPagamento(String dataPagamento) {
		this.dataPagamento = dataPagamento;
	}

	public Long getCodigo() {
		return codigo;
	}

	public void setCodigo(Long codigo) {
		this.codigo = codigo;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (!(o instanceof Pagamento pagamento)) return false;
        return Double.compare(desconto, pagamento.desconto) == 0 && parcelamento == pagamento.parcelamento && Double.compare(valorParcelas, pagamento.valorParcelas) == 0 && Double.compare(totalComDesconto, pagamento.totalComDesconto) == 0 && Objects.equals(codigo, pagamento.codigo) && Objects.equals(dataPagamento, pagamento.dataPagamento) && Objects.equals(tipoPagamento, pagamento.tipoPagamento) && Objects.equals(orcamento, pagamento.orcamento) && Objects.equals(pecas, pagamento.pecas);
	}

	@Override
	public int hashCode() {
		return Objects.hash(codigo, dataPagamento, tipoPagamento, desconto, parcelamento, valorParcelas, totalComDesconto, orcamento, pecas);
	}

	@Override
	public String toString() {
		return "Pagamento{" +
				"codigo=" + codigo +
				", dataPagamento='" + dataPagamento + '\'' +
				", tipoPagamento='" + tipoPagamento + '\'' +
				", desconto=" + desconto +
				", parcelamento=" + parcelamento +
				", valorParcelas=" + valorParcelas +
				", totalComDesconto=" + totalComDesconto +
				'}';
	}
}
