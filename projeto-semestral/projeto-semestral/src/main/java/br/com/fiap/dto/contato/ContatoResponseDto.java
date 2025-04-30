package br.com.fiap.dto.contato;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;

@Getter @Setter @NoArgsConstructor
public class ContatoResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long codigo; // ID incluído na resposta
    private String celular;
    private String email;
    private String contato;
}