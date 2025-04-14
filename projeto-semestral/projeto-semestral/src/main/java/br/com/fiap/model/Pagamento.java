package br.com.fiap.model;

import br.com.fiap.model.relacionamentos.ClientePagamento;
import br.com.fiap.model.relacionamentos.PagamentoOrcamento;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.math.BigDecimal; // Usar BigDecimal para valores monetários/precisos
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "PAGAMENTOS") // Nome exato da tabela no DDL

// --- Lombok ---
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
// Excluir coleções LAZY do toString
@ToString(exclude = {"clientePagamentos", "pagamentoOrcamentos"})
// --------------
public class Pagamento implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "pagamento_seq_gen")
	@SequenceGenerator(name = "pagamento_seq_gen", sequenceName = "PAGAMENTOS_ID_PAG_SEQ", allocationSize = 1)
	@Column(name = "ID_PAG")
	private Long id; // Renomeado de 'codigo'

	@Column(name = "DATA_PAGAMENTO", nullable = false)
	private LocalDate dataPagamento; // Alterado para LocalDate

	@Column(name = "TIPO_PAGAMENTO", length = 20, nullable = false)
	private String tipoPagamento;

	// Usando BigDecimal para precisão monetária/decimal
	@Column(name = "DESCONTO", nullable = false, precision = 10, scale = 2) // Definir precisão/escala
	private BigDecimal desconto; // Alterado para BigDecimal

	// --- ATENÇÃO: TOTAL_PARCELAS é VARCHAR2 no DDL ---
	@Column(name = "TOTAL_PARCELAS", length = 5, nullable = false)
	private String totalParcelas; // Mapeado como String para corresponder ao DDL.
	// O campo original era 'parcelamento' (int). Renomeado e tipo alterado.
	// Idealmente, esta coluna deveria ser NUMBER no banco.
	// Você precisará converter para número na sua lógica de negócio.
	// ----------------------------------------------------

	@Column(name = "VALOR_PARCELAS", nullable = false, precision = 10, scale = 2)
	private BigDecimal valorParcelas; // Alterado para BigDecimal

	@Column(name = "TOTAL_PAGAMENTO_DESCONTO", nullable = false, precision = 10, scale = 2)
	private BigDecimal totalComDesconto; // Alterado para BigDecimal e nome do campo ajustado

	// === RELACIONAMENTOS INDIRETOS (Via Tabelas de Junção) ===
	// Removidos os campos diretos: private Orcamento orcamento; private Pecas pecas;
	// O campo 'pecas' foi removido pois não há FK ou tabela de junção Pagamento<->Pecas no DDL.
	// Adicionados relacionamentos @OneToMany para as ENTIDADES DE JUNÇÃO (que precisam ser criadas)

	// Relacionamento com Clientes (via Tabela CP -> Entidade ClientePagamento)
	@OneToMany(mappedBy = "pagamento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<ClientePagamento> clientePagamentos = new ArrayList<>(); // Assume entidade ClientePagamento

	// Relacionamento com Orcamentos (via Tabela PAO -> Entidade PagamentoOrcamento)
	@OneToMany(mappedBy = "pagamento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<PagamentoOrcamento> pagamentoOrcamentos = new ArrayList<>(); // Assume entidade PagamentoOrcamento

	// ===========================================================

	// Getters, Setters, Construtores, equals, hashCode, toString gerados pelo Lombok
}