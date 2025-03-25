package br.com.fiap.DTO;

import com.google.gson.annotations.SerializedName;

public class EnderecoDto {

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
}
