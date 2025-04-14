package br.com.fiap.model.relacionamentos; // Ou subpacote

import br.com.fiap.model.Clientes;
import br.com.fiap.model.Pagamento;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "CP")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of = "id") @ToString
public class ClientePagamento implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cp_seq_gen")
    @SequenceGenerator(name = "cp_seq_gen", sequenceName = "CP_ID_CP_SEQ", allocationSize = 1)
    @Column(name = "ID_CP")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({ // Usa @JoinColumns (plural) para FK composta de Cliente
            @JoinColumn(name = "CLIENTES_ID_CLI", referencedColumnName = "ID_CLI", nullable = false),
            @JoinColumn(name = "CLIENTES_ENDERECOS_ID_END", referencedColumnName = "ENDERECOS_ID_END", nullable = false)
    })
    private Clientes cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PAGAMENTOS_ID_PAG", nullable = false)
    private Pagamento pagamento;
}