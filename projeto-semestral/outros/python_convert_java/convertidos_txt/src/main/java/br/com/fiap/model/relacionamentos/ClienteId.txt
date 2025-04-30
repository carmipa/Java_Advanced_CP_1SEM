package br.com.fiap.model.relacionamentos;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable // Marca como classe de ID embutível
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode // Essencial para chaves compostas
public class ClienteId implements Serializable {

    private static final long serialVersionUID = 1L; // Boa prática

    @Column(name = "ID_CLI") // Mapeia EXATAMENTE para a coluna ID_CLI da tabela TB_CLIENTES
    private Long idCli; // Parte 1 da chave primária

    // A segunda parte da chave (ENDERECOS_ID_END) será mapeada via @MapsId na entidade Clientes
    // Não precisa de @Column aqui, pois seu valor virá do relacionamento com Endereco.
    private Long enderecoId; // Parte 2 da chave primária
}