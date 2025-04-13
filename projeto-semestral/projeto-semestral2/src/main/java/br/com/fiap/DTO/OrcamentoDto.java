package br.com.fiap.DTO;

public class OrcamentoDto {

    private Long codigo;
    private String dataOrcamento;
    private double maoDeObra;
    private double valorHora;
    private int quantidadeHoras;
    private double valorTotal;

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
}
