package br.com.fiap.dto.cliente;

import br.com.fiap.dto.contato.ContatoResponseDto; // Usa Response DTO aninhado
import br.com.fiap.dto.endereco.EnderecoResponseDto; // Usa Response DTO aninhado
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class ClienteResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long idCli; // Parte principal da chave composta
    // O ID do endereço está dentro do EnderecoResponseDto

    private String tipoCliente;
    private String nome;
    private String sobrenome;
    private String sexo;
    private String tipoDocumento;
    private String numeroDocumento;
    private LocalDate dataNascimento;
    private String atividadeProfissional;

    private EnderecoResponseDto endereco; // <-- Tipo Corrigido
    private ContatoResponseDto contato;   // <-- Tipo Corrigido

    // Poderia ter um DTO resumido de Autenticar se necessário
    // private AutenticarResumoDto autenticar;
}