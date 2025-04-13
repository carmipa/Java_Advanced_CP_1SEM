package br.com.fiap.model.relacionamentos; // Ou subpacote

import br.com.fiap.model.Clientes;
import br.com.fiap.model.Orcamento;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "CO")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of = "id") @ToString
public class ClienteOrcamento implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "co_seq_gen")
    @SequenceGenerator(name = "co_seq_gen", sequenceName = "CO_ID_CO_SEQ", allocationSize = 1)
    @Column(name = "ID_CO")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({ // Usa @JoinColumns (plural) para FK composta de Cliente
            @JoinColumn(name = "CLIENTES_ID_CLI", referencedColumnName = "ID_CLI", nullable = false),
            @JoinColumn(name = "CLIENTES_ENDERECOS_ID_END", referencedColumnName = "ENDERECOS_ID_END", nullable = false)
    })
    private Clientes cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORCAMENTOS_ID_ORC", nullable = false)
    private Orcamento orcamento;
}