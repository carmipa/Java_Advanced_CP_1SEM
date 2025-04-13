package br.com.fiap.model;

import br.com.fiap.model.relacionamentos.AgendaOficina;
import br.com.fiap.model.relacionamentos.OficinaOrcamento;
import br.com.fiap.model.relacionamentos.OficinaPeca;
import br.com.fiap.model.relacionamentos.OficinaVeiculo;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList; // Para inicializar listas
import java.util.List;       // Para coleções de relacionamentos

@Entity
@Table(name = "OFICINAS") // Nome exato da tabela no DDL

// --- Lombok ---
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
// Excluir coleções LAZY do toString para evitar erros
@ToString(exclude = {"agendaOficinas", "oficinaVeiculos", "oficinaPecas", "oficinaOrcamentos"})
// --------------
public class Oficina implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "oficina_seq_gen")
	@SequenceGenerator(name = "oficina_seq_gen", sequenceName = "OFICINAS_ID_OFIC_SEQ", allocationSize = 1)
	@Column(name = "ID_OFIC")
	private Long id; // Renomeado de 'codigo'

	@Column(name = "DATA_OFICINA", nullable = false)
	private LocalDate dataOficina; // Alterado para LocalDate, nome para camelCase

	@Column(name = "DESCRICAO_PROBLEMA", length = 500, nullable = false)
	private String descricaoProblema;

	@Column(name = "DIAGNOSTICO", length = 4000, nullable = false)
	private String diagnostico;

	@Column(name = "PARTES_AFETADAS", length = 500, nullable = false)
	private String partesAfetadas;

	// --- ATENÇÃO: HORAS_TRABALHADAS é VARCHAR2 no DDL ---
	@Column(name = "HORAS_TRABALHADAS", length = 5, nullable = false)
	private String horasTrabalhadas; // Mapeado como String para corresponder ao DDL.
	// Idealmente, esta coluna deveria ser NUMBER no banco.
	// Você precisará converter para número na sua lógica de negócio.
	// ----------------------------------------------------

	// === RELACIONAMENTOS INDIRETOS (Via Tabelas de Junção) ===
	// Removidos os campos diretos: private Agenda agenda; private Veiculo veiculo; private Pecas peca;
	// Adicionados relacionamentos @OneToMany para as ENTIDADES DE JUNÇÃO (que precisam ser criadas)

	// Relacionamento com Agendamentos (via Tabela AO -> Entidade AgendaOficina)
	@OneToMany(mappedBy = "oficina", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<AgendaOficina> agendaOficinas = new ArrayList<>(); // Assume entidade AgendaOficina

	// Relacionamento com Veículos (via Tabela OV -> Entidade OficinaVeiculo)
	@OneToMany(mappedBy = "oficina", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<OficinaVeiculo> oficinaVeiculos = new ArrayList<>(); // Assume entidade OficinaVeiculo

	// Relacionamento com Peças (via Tabela OFP -> Entidade OficinaPeca)
	@OneToMany(mappedBy = "oficina", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<OficinaPeca> oficinaPecas = new ArrayList<>(); // Assume entidade OficinaPeca

	// Relacionamento com Orçamentos (via Tabela OFO -> Entidade OficinaOrcamento)
	@OneToMany(mappedBy = "oficina", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<OficinaOrcamento> oficinaOrcamentos = new ArrayList<>(); // Assume entidade OficinaOrcamento

	// ===========================================================

	// Getters, Setters, Construtores, equals, hashCode, toString gerados pelo Lombok
}