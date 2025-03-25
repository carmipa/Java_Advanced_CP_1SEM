package br.com.fiap.cp1_bank.model;

public class Conta {

    private long numero;
    private long agencia;
    private String nomeTitular;
    private String cpfTitular;
    private String dataAbertura;
    private double saldoInicial;
    private boolean ativa;
    private String tipoConta;

    public Conta() {
    }

    public Conta(long numero, long agencia, String nomeTitular, String cpfTitular, String dataAbertura, double saldoInicial, boolean ativa, String tipoConta) {
        this.numero = numero;
        this.agencia = agencia;
        this.nomeTitular = nomeTitular;
        this.cpfTitular = cpfTitular;
        this.dataAbertura = dataAbertura;
        this.saldoInicial = saldoInicial;
        this.ativa = ativa;
        this.tipoConta = tipoConta;
    }

    public long getNumero() {
        return numero;
    }

    public long getAgencia() {
        return agencia;
    }

    public String getNomeTitular() {
        return nomeTitular;
    }

    public String getCpfTitular() {
        return cpfTitular;
    }

    public String getDataAbertura() {
        return dataAbertura;
    }

    public double getSaldoInicial() {
        return saldoInicial;
    }

    public boolean isAtiva() {
        return ativa;
    }

    public String getTipoConta() {
        return tipoConta;
    }

    public void setNumero(long numero) {
        this.numero = numero;
    }

    public void setAgencia(long agencia) {
        this.agencia = agencia;
    }

    public void setNomeTitular(String nomeTitular) {
        this.nomeTitular = nomeTitular;
    }

    public void setCpfTitular(String cpfTitular) {
        this.cpfTitular = cpfTitular;
    }

    public void setDataAbertura(String dataAbertura) {
        this.dataAbertura = dataAbertura;
    }

    public void setSaldoInicial(double saldoInicial) {
        this.saldoInicial = saldoInicial;
    }

    public void setAtiva(boolean ativa) {
        this.ativa = ativa;
    }

    public void setTipoConta(String tipoConta) {
        this.tipoConta = tipoConta;
    }

    @Override
    public String toString() {
        return "Conta{" +
                "numero=" + numero +
                ", agencia=" + agencia +
                ", nomeTitular='" + nomeTitular + '\'' +
                ", cpfTitular='" + cpfTitular + '\'' +
                ", dataAbertura='" + dataAbertura + '\'' +
                ", saldoInicial=" + saldoInicial +
                ", ativa=" + ativa +
                ", tipoConta='" + tipoConta + '\'' +
                '}';
    }
}

