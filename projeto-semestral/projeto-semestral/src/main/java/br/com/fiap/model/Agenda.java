package br.com.fiap.model;

import jakarta.persistence.*;   // Importações JPA
import lombok.*;                // Importações Lombok
import java.time.LocalDate;     // Importa LocalDate para datas
import java.io.Serializable;    // Para implementar Serializable

@Entity // Marca como Entidade JPA
@Table(name = "AGENDAR") // Nome exato da tabela no DDL

// --- Lombok ---
@Getter
@Setter
@NoArgsConstructor // Construtor padrão obrigatório para JPA
@AllArgsConstructor // Construtor com todos os campos
@EqualsAndHashCode(of = "id") // equals e hashCode baseados apenas no campo 'id'
@ToString
//---------------
public class Agenda implements Serializable { // Boa prática implementar Serializable

	private static final long serialVersionUID = 1L;

	@Id // Marca como chave primária
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "agenda_seq_gen") // Geração via Sequence
	@SequenceGenerator(name = "agenda_seq_gen", sequenceName = "AGENDAR_ID_AGE_SEQ", allocationSize = 1) // Configura a sequence do DDL
	@Column(name = "ID_AGE") // Mapeia para a coluna ID_AGE do banco
	private Long id; // Renomeado de 'codigo' para 'id' por convenção

	@Column(name = "DATA_AGENDAMENTO", nullable = false) // Mapeia para DATA_AGENDAMENTO, não nulo
	private LocalDate dataAgendamento; // Tipo alterado para LocalDate (adequado para DATE do Oracle)

	@Column(name = "OBS_AGENDAMENTO", length = 400, nullable = true) // Mapeia para OBS_AGENDAMENTO, tamanho 400, permite nulo
	private String observacao; // Renomeado de 'obsAgenda' para 'observacao' para clareza (opcional)

	// === MÉTODOS MANUAIS REMOVIDOS ===
	// Os métodos manuais (getCodigo, setCodigo, getDataAgendamento, setDataAgendamento,
	// getObsAgenda, setObsAgenda, construtores, equals, hashCode, toString) foram removidos
	// pois são gerados pelo Lombok (@Getter, @Setter, @NoArgsConstructor, @AllArgsConstructor,
	// @EqualsAndHashCode, @ToString).
	// ==================================

	// Se houver relacionamentos com outras tabelas (ex: Cliente, Veiculo),
	// eles seriam adicionados aqui com @ManyToOne, @OneToOne, etc.
	// Exemplo (baseado na tabela de junção AO e AV do DDL):
    /*
    @OneToMany(mappedBy = "agenda") // Assumindo que existe uma entidade AgendaOficina com um campo 'agenda'
    private List<AgendaOficina> agendaOficinas;

    @OneToMany(mappedBy = "agenda") // Assumindo que existe uma entidade AgendaVeiculo com um campo 'agenda'
    private List<AgendaVeiculo> agendaVeiculos;
    */
}