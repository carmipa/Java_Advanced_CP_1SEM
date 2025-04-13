package br.com.fiap.model;

import br.com.fiap.model.relacionamentos.ClienteOrcamento;
import br.com.fiap.model.relacionamentos.OficinaOrcamento;
import br.com.fiap.model.relacionamentos.PagamentoOrcamento;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.math.BigDecimal; // Usar BigDecimal para valores monetários/precisos
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ORCAMENTOS") // Nome exato da tabela no DDL

// --- Lombok ---
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
// Excluir coleções LAZY do toString
@ToString(exclude = {"clienteOrcamentos", "oficinaOrcamentos", "pagamentoOrcamentos"})
// --------------
public class Orcamento implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "orcamento_seq_gen")
	@SequenceGenerator(name = "orcamento_seq_gen", sequenceName = "ORCAMENTOS_ID_ORC_SEQ", allocationSize = 1)
	@Column(name = "ID_ORC")
	private Long id; // Renomeado de 'codigo'

	@Column(name = "DATA_ORCAMENTO", nullable = false)
	private LocalDate dataOrcamento; // Alterado para LocalDate

	// Usando BigDecimal para precisão monetária/decimal
	@Column(name = "VALOR_MAODEOBRA", nullable = false, precision = 10, scale = 2) // Definir precisão e escala conforme necessário
	private BigDecimal maoDeObra; // Alterado para BigDecimal

	@Column(name = "VALOR_HORA", nullable = false, precision = 10, scale = 2)
	private BigDecimal valorHora; // Alterado para BigDecimal

	@Column(name = "QUANTIDADE_HORAS", nullable = false)
	private Integer quantidadeHoras; // Alterado para Integer (compatível com NUMBER)

	@Column(name = "VALOR_TOTAL", nullable = false, precision = 10, scale = 2)
	private BigDecimal valorTotal; // Alterado para BigDecimal

	// === RELACIONAMENTOS INDIRETOS (Via Tabelas de Junção) ===
	// Removidos os campos diretos: private Oficina oficina; private Pecas pecas;
	// O campo 'pecas' foi removido pois não há FK ou tabela de junção direta Orcamento<->Pecas no DDL.
	// Adicionados relacionamentos @OneToMany para as ENTIDADES DE JUNÇÃO (que precisam ser criadas)

	// Relacionamento com Clientes (via Tabela CO -> Entidade ClienteOrcamento)
	@OneToMany(mappedBy = "orcamento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<ClienteOrcamento> clienteOrcamentos = new ArrayList<>(); // Assume entidade ClienteOrcamento

	// Relacionamento com Oficinas (via Tabela OFO -> Entidade OficinaOrcamento)
	@OneToMany(mappedBy = "orcamento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<OficinaOrcamento> oficinaOrcamentos = new ArrayList<>(); // Assume entidade OficinaOrcamento

	// Relacionamento com Pagamentos (via Tabela PAO -> Entidade PagamentoOrcamento)
	@OneToMany(mappedBy = "orcamento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<PagamentoOrcamento> pagamentoOrcamentos = new ArrayList<>(); // Assume entidade PagamentoOrcamento

	// ===========================================================

	// Getters, Setters, Construtores, equals, hashCode, toString gerados pelo Lombok
}