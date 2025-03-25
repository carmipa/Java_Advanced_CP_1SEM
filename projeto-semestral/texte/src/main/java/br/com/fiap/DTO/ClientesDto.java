package br.com.fiap.DTO;

import br.com.fiap.model.Contato;

public class ClientesDto {

    private Long codigo;
    private String tipoCliente;
    private String nome;
    private String sobrenome;
    private String sexo;
    private String tipoDocumento;
    private String numeroDocumento;
    private String dataNascimento;
    private String atividadeProfissional;
    private EnderecoDto endereco;
    private ContatoDto contato;


    public Long getCodigo() {
        return codigo;
    }

    public void setCodigo(Long codigo) {
        this.codigo = codigo;
    }

    public String getTipoCliente() {
        return tipoCliente;
    }

    public void setTipoCliente(String tipoCliente) {
        this.tipoCliente = tipoCliente;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        this.sexo = sexo;
    }

    public String getSobrenome() {
        return sobrenome;
    }

    public void setSobrenome(String sobrenome) {
        this.sobrenome = sobrenome;
    }

    public String getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(String tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public String getNumeroDocumento() {
        return numeroDocumento;
    }

    public void setNumeroDocumento(String numeroDocumento) {
        this.numeroDocumento = numeroDocumento;
    }

    public String getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(String dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getAtividadeProfissional() {
        return atividadeProfissional;
    }

    public void setAtividadeProfissional(String atividadeProfissional) {
        this.atividadeProfissional = atividadeProfissional;
    }

    public EnderecoDto getEndereco() {
        return endereco;
    }

    public void setEndereco(EnderecoDto endereco) {
        this.endereco = endereco;
    }

    public ContatoDto getContato() {
        return contato;
    }

    public void setContato(ContatoDto contato) {
        this.contato = contato;
    }
}
