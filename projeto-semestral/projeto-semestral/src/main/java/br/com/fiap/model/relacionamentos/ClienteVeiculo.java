package br.com.fiap.model.relacionamentos;

import br.com.fiap.model.Clientes;
import br.com.fiap.model.Veiculo;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "CV") // Nome da tabela de junção

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString
public class ClienteVeiculo implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cv_seq_gen")
    @SequenceGenerator(name = "cv_seq_gen", sequenceName = "CV_ID_CV_SEQ", allocationSize = 1)
    @Column(name = "ID_CV") // PK da tabela CV
    private Long id;

    // Relacionamento ManyToOne com Cliente (usando Chave Composta)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({ // Usa @JoinColumns (plural) para FK composta
            @JoinColumn(name = "CLIENTES_ID_CLI", referencedColumnName = "ID_CLI", nullable = false), // Parte 1 da FK/PK
            @JoinColumn(name = "CLIENTES_ENDERECOS_ID_END", referencedColumnName = "ENDERECOS_ID_END", nullable = false) // Parte 2 da FK/PK
    })
    private Clientes cliente;

    // Relacionamento ManyToOne com Veiculo (chave simples)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "T_VEICULOS_ID_VEI", nullable = false) // FK para VEICULOS
    private Veiculo veiculo;
}