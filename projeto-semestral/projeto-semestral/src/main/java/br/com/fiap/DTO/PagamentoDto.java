package br.com.fiap.DTO;

public class PagamentoDto {

    private Long codigo;
    private String dataPagamento;
    private String tipoPagamento;
    private double desconto;
    private int parcelamento;
    private double valorParcelas;
    private double totalComDesconto;

    public Long getCodigo() {
        return codigo;
    }

    public void setCodigo(Long codigo) {
        this.codigo = codigo;
    }

    public String getDataPagamento() {
        return dataPagamento;
    }

    public void setDataPagamento(String dataPagamento) {
        this.dataPagamento = dataPagamento;
    }

    public String getTipoPagamento() {
        return tipoPagamento;
    }

    public void setTipoPagamento(String tipoPagamento) {
        this.tipoPagamento = tipoPagamento;
    }

    public double getDesconto() {
        return desconto;
    }

    public void setDesconto(double desconto) {
        this.desconto = desconto;
    }

    public int getParcelamento() {
        return parcelamento;
    }

    public void setParcelamento(int parcelamento) {
        this.parcelamento = parcelamento;
    }

    public double getValorParcelas() {
        return valorParcelas;
    }

    public void setValorParcelas(double valorParcelas) {
        this.valorParcelas = valorParcelas;
    }

    public double getTotalComDesconto() {
        return totalComDesconto;
    }

    public void setTotalComDesconto(double totalComDesconto) {
        this.totalComDesconto = totalComDesconto;
    }
}
