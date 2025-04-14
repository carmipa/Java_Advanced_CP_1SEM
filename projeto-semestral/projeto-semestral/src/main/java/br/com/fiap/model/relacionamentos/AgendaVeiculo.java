package br.com.fiap.model.relacionamentos; // Ou um subpacote como br.com.fiap.model.join

import br.com.fiap.model.Agenda;
import br.com.fiap.model.Veiculo;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "AV") // Nome exato da tabela de junção no DDL

// --- Lombok ---
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString
//---------------
public class AgendaVeiculo implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "av_seq_gen")
    @SequenceGenerator(name = "av_seq_gen", sequenceName = "AV_ID_AV_SEQ", allocationSize = 1)
    @Column(name = "ID_AV") // Mapeia para a PK da tabela AV
    private Long id;

    // Relacionamento ManyToOne com Agenda
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AGENDAR_ID_AGE", nullable = false) // Mapeia para a FK AGENDAR_ID_AGE
    private Agenda agenda;

    // Relacionamento ManyToOne com Veiculo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "T_VEICULOS_ID_VEI", nullable = false) // Mapeia para a FK T_VEICULOS_ID_VEI
    private Veiculo veiculo;

    // Getters, Setters, etc., gerados pelo Lombok
}