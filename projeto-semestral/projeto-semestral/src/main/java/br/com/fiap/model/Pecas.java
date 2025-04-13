package br.com.fiap.model;

import br.com.fiap.model.relacionamentos.OficinaPeca;
import br.com.fiap.model.relacionamentos.PecaVeiculo;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.math.BigDecimal; // Para valores monetários/precisos
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "PECAS") // Nome exato da tabela no DDL

// --- Lombok ---
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
// Excluir coleções LAZY do toString
@ToString(exclude = {"oficinaPecas", "pecaVeiculos"})
// --------------
public class Pecas implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "pecas_seq_gen")
	@SequenceGenerator(name = "pecas_seq_gen", sequenceName = "PECAS_ID_PEC_SEQ", allocationSize = 1)
	@Column(name = "ID_PEC")
	private Long id; // Renomeado de 'codigo'

	@Column(name = "TIPO_VEICULO", length = 10, nullable = false)
	private String tipoVeiculo;

	@Column(name = "FABRICANTE", length = 50, nullable = false)
	private String fabricante;

	// Atenção: Nome da coluna no DDL parece ser "DESCRICA_PECA"
	@Column(name = "DESCRICA_PECA", length = 50, nullable = false)
	private String descricao; // Campo Java 'descricao' mapeado para 'DESCRICA_PECA'

	@Column(name = "DATA_COMPRA", nullable = false)
	private LocalDate dataCompra; // Alterado para LocalDate

	// Usando BigDecimal para precisão
	@Column(name = "PRECO", nullable = false, precision = 10, scale = 2)
	private BigDecimal preco; // Alterado para BigDecimal

	@Column(name = "DESCONTO", nullable = false, precision = 10, scale = 2)
	private BigDecimal desconto; // Alterado para BigDecimal

	@Column(name = "TOTAL_DESCONTO", nullable = false, precision = 10, scale = 2)
	private BigDecimal totalDesconto; // Alterado para BigDecimal

	// === RELACIONAMENTOS INDIRETOS (Via Tabelas de Junção) ===
	// Adicionados relacionamentos @OneToMany para as ENTIDADES DE JUNÇÃO (que precisam ser criadas)

	// Relacionamento com Oficinas (via Tabela OFP -> Entidade OficinaPeca)
	@OneToMany(mappedBy = "peca", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<OficinaPeca> oficinaPecas = new ArrayList<>(); // Assume entidade OficinaPeca com campo 'peca'

	// Relacionamento com Veículos (via Tabela PV -> Entidade PecaVeiculo)
	@OneToMany(mappedBy = "peca", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<PecaVeiculo> pecaVeiculos = new ArrayList<>(); // Assume entidade PecaVeiculo com campo 'peca'

	// ===========================================================

	// Getters, Setters, Construtores, equals, hashCode, toString gerados pelo Lombok
}