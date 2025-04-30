// src/main/java/br/com/fiap/dto/cliente/ClienteInfoDTO.java
package br.com.fiap.dto.cliente;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ClienteInfoDTO {
    private Long idCli;
    private Long idEndereco; // Essencial para identificar unicamente o cliente
    private String nome;
    private String sobrenome;
    private String numeroDocumento;

    public ClienteInfoDTO(Long idCli, Long idEndereco, String nome, String sobrenome, String numeroDocumento) {
        this.idCli = idCli;
        this.idEndereco = idEndereco;
        this.nome = nome;
        this.sobrenome = sobrenome;
        this.numeroDocumento = numeroDocumento;
    }

    public String getNomeCompleto() {
        return (nome != null ? nome : "") + " " + (sobrenome != null ? sobrenome : "");
    }
}