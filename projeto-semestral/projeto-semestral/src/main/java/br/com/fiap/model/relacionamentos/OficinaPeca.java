package br.com.fiap.model.relacionamentos;

import br.com.fiap.model.Oficina;
import br.com.fiap.model.Pecas;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "OFP") // Nome da tabela de junção

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString
public class OficinaPeca implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ofp_seq_gen")
    // !!! Atenção ao nome da sequence no DDL: OFP_ID_OPE_SEQ !!!
    @SequenceGenerator(name = "ofp_seq_gen", sequenceName = "OFP_ID_OPE_SEQ", allocationSize = 1)
    @Column(name = "ID_OPE") // PK da tabela OFP
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OFICINAS_ID_OFIC", nullable = false) // FK para OFICINAS
    private Oficina oficina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PECAS_ID_PEC", nullable = false) // FK para PECAS
    private Pecas peca;
}