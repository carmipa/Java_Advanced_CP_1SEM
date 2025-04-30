package br.com.fiap.dto.endereco;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;

@Getter @Setter @NoArgsConstructor
public class EnderecoResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long codigo; // ID incluído na resposta
    private Integer numero; // Usar Integer para consistência, ou int se preferir
    private String cep;
    private String logradouro;
    @JsonProperty("localidade")
    private String cidade;
    private String bairro;
    @JsonProperty("uf")
    private String estado;
    private String complemento;
}