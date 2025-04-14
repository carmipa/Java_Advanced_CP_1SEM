package br.com.fiap.model.relacionamentos; // Ou subpacote

import br.com.fiap.model.Pecas;
import br.com.fiap.model.Veiculo;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "PV")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of = "id") @ToString
public class PecaVeiculo implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "pv_seq_gen")
    @SequenceGenerator(name = "pv_seq_gen", sequenceName = "PV_ID_PV_SEQ", allocationSize = 1)
    @Column(name = "ID_PV")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PECAS_ID_PEC", nullable = false)
    private Pecas peca;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "T_VEICULOS_ID_VEI", nullable = false)
    private Veiculo veiculo;
}