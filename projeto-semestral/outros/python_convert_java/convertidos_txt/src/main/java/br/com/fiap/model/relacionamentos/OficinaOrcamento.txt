package br.com.fiap.model.relacionamentos; // Ou subpacote

import br.com.fiap.model.Oficina;
import br.com.fiap.model.Orcamento;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "OFO")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of = "id") @ToString
public class OficinaOrcamento implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ofo_seq_gen")
    @SequenceGenerator(name = "ofo_seq_gen", sequenceName = "OFO_ID_OFO_SEQ", allocationSize = 1)
    @Column(name = "ID_OFO")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OFICINAS_ID_OFIC", nullable = false)
    private Oficina oficina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORCAMENTOS_ID_ORC", nullable = false)
    private Orcamento orcamento;
}