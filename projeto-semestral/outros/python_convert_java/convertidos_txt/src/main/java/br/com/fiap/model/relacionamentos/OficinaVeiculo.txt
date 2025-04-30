package br.com.fiap.model.relacionamentos; // Ou subpacote

import br.com.fiap.model.Oficina;
import br.com.fiap.model.Veiculo;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "OV")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of = "id") @ToString
public class OficinaVeiculo implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ov_seq_gen")
    @SequenceGenerator(name = "ov_seq_gen", sequenceName = "OV_ID_OV_SEQ", allocationSize = 1)
    @Column(name = "ID_OV")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OFICINAS_ID_OFIC", nullable = false)
    private Oficina oficina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "T_VEICULOS_ID_VEI", nullable = false)
    private Veiculo veiculo;
}