// src/main/java/br/com/fiap/model/Agenda.java
package br.com.fiap.model;

import br.com.fiap.model.relacionamentos.AgendaOficina; // Importar se usar
import br.com.fiap.model.relacionamentos.AgendaVeiculo; // <<< Importar AgendaVeiculo
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.io.Serializable;
import java.util.ArrayList; // <<< Importar ArrayList
import java.util.List;      // <<< Importar List

@Entity
@Table(name = "AGENDAR")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"agendaOficinas", "agendaVeiculos"}) // Excluir coleções do toString
public class Agenda implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "agenda_seq_gen")
	@SequenceGenerator(name = "agenda_seq_gen", sequenceName = "AGENDAR_ID_AGE_SEQ", allocationSize = 1)
	@Column(name = "ID_AGE")
	private Long id;

	@Column(name = "DATA_AGENDAMENTO", nullable = false)
	private LocalDate dataAgendamento;

	@Column(name = "OBS_AGENDAMENTO", length = 400, nullable = true)
	private String observacao;

	// === RELACIONAMENTOS DESCOMENTADOS ===
	// Relacionamento com Oficina (via tabela AO)
	@OneToMany(mappedBy = "agenda", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY) // <<< DESCOMENTAR ANOTAÇÃO
	private List<AgendaOficina> agendaOficinas = new ArrayList<>(); // <<< DESCOMENTAR ATRIBUTO

	// Relacionamento com Veiculo (via tabela AV) - PRECISA ESTAR DESCOMENTADO
	@OneToMany(mappedBy = "agenda", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<AgendaVeiculo> agendaVeiculos = new ArrayList<>();
	// ====================================
}