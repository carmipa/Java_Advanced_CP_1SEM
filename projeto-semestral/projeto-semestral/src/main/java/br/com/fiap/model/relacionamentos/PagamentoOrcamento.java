package br.com.fiap.model.relacionamentos; // Ou subpacote

import br.com.fiap.model.Orcamento;
import br.com.fiap.model.Pagamento;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "PAO")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of = "id") @ToString
public class PagamentoOrcamento implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "pao_seq_gen")
    @SequenceGenerator(name = "pao_seq_gen", sequenceName = "PAO_ID_PAO_SEQ", allocationSize = 1)
    @Column(name = "ID_PAO")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PAGAMENTOS_ID_PAG", nullable = false)
    private Pagamento pagamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORCAMENTOS_ID_ORC", nullable = false)
    private Orcamento orcamento;
}