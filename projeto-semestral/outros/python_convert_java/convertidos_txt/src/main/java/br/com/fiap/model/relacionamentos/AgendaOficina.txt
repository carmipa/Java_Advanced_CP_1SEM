package br.com.fiap.model.relacionamentos; // Ou subpacote

import br.com.fiap.model.Agenda;
import br.com.fiap.model.Oficina;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "AO")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of = "id") @ToString
public class AgendaOficina implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ao_seq_gen")
    @SequenceGenerator(name = "ao_seq_gen", sequenceName = "AO_ID_AO_SEQ", allocationSize = 1)
    @Column(name = "ID_AO")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AGENDAR_ID_AGE", nullable = false)
    private Agenda agenda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OFICINAS_ID_OFIC", nullable = false)
    private Oficina oficina;
}