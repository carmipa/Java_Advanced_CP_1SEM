package br.com.fiap.model;

import java.util.Objects;

public class Autenticar {

    private Long codigoAutenticacao;
    private String usuario;
    private String senha;

    public Autenticar() {
    }

    public Autenticar(Long codigoAutenticacao, String usuario, String senha) {
        this.codigoAutenticacao = codigoAutenticacao;
        this.usuario = usuario;
        this.senha = senha;
    }

    public Long getCodigoAutenticacao() {
        return codigoAutenticacao;
    }

    public void setCodigoAutenticacao(Long codigoAutenticacao) {
        this.codigoAutenticacao = codigoAutenticacao;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Autenticar that)) return false;
        return Objects.equals(codigoAutenticacao, that.codigoAutenticacao) && Objects.equals(usuario, that.usuario) && Objects.equals(senha, that.senha);
    }

    @Override
    public int hashCode() {
        return Objects.hash(codigoAutenticacao, usuario, senha);
    }

    @Override
    public String toString() {
        return "Autenticar{" +
                "codigoAutenticacao=" + codigoAutenticacao +
                ", usuario='" + usuario + '\'' +
                ", senha='" + senha + '\'' +
                '}';
    }
}
