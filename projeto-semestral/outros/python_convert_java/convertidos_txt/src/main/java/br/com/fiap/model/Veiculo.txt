package br.com.fiap.model;

import br.com.fiap.model.relacionamentos.AgendaVeiculo;
import br.com.fiap.model.relacionamentos.ClienteVeiculo;
import br.com.fiap.model.relacionamentos.OficinaVeiculo;
import br.com.fiap.model.relacionamentos.PecaVeiculo;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.time.LocalDate; // Usar LocalDate para mapear DATE
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "VEICULOS") // Nome exato da tabela no DDL

// --- Lombok ---
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
// Excluir coleções LAZY do toString
@ToString(exclude = {"agendaVeiculos", "clienteVeiculos", "oficinaVeiculos", "pecaVeiculos"})
// --------------
public class Veiculo implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "veiculo_seq_gen")
	@SequenceGenerator(name = "veiculo_seq_gen", sequenceName = "VEICULOS_ID_VEI_SEQ", allocationSize = 1)
	@Column(name = "ID_VEI") // Mapeia para ID_VEI (conforme DDL)
	private Long id; // Renomeado de 'codigo'

	@Column(name = "TIPO_VEICULO", length = 15, nullable = false)
	private String tipoVeiculo;

	@Column(name = "RENAVAM", length = 13, nullable = false, unique = true) // Renavam geralmente é único
	private String renavam;

	@Column(name = "PLACA", length = 7, nullable = false, unique = true) // Placa geralmente é única
	private String placa;

	@Column(name = "MODELO", length = 100, nullable = false)
	private String modelo;

	@Column(name = "PROPRIETARIO", length = 50, nullable = false) // Mapeado conforme DDL
	private String proprietario;

	@Column(name = "MONTADORA", length = 100, nullable = false)
	private String montadora;

	@Column(name = "COR", length = 50, nullable = false)
	private String cor;

	@Column(name = "MOTOR", length = 50, nullable = false)
	private String motor;

	// --- ATENÇÃO: ANO_FABRICACAO é DATE no DDL ---
	@Column(name = "ANO_FABRICACAO", nullable = false)
	private LocalDate anoFabricacao; // Mapeado como LocalDate para corresponder ao tipo DATE do DDL.
	// Se você realmente só precisa do ano, talvez fosse melhor a coluna ser NUMBER no banco
	// e o tipo aqui ser Integer. Usar DATE para armazenar só o ano é incomum.
	// -------------------------------------------

	// === RELACIONAMENTOS INDIRETOS (Via Tabelas de Junção) ===
	// Adicionados relacionamentos @OneToMany para as ENTIDADES DE JUNÇÃO (que precisam ser criadas)

	// Relacionamento com Agendamentos (via Tabela AV -> Entidade AgendaVeiculo)
	@OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<AgendaVeiculo> agendaVeiculos = new ArrayList<>(); // Assume entidade AgendaVeiculo

	// Relacionamento com Clientes (via Tabela CV -> Entidade ClienteVeiculo)
	@OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<ClienteVeiculo> clienteVeiculos = new ArrayList<>(); // Assume entidade ClienteVeiculo

	// Relacionamento com Oficinas (via Tabela OV -> Entidade OficinaVeiculo)
	@OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<OficinaVeiculo> oficinaVeiculos = new ArrayList<>(); // Assume entidade OficinaVeiculo

	// Relacionamento com Peças (via Tabela PV -> Entidade PecaVeiculo)
	@OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<PecaVeiculo> pecaVeiculos = new ArrayList<>(); // Assume entidade PecaVeiculo

	// ===========================================================

	// Getters, Setters, Construtores, equals, hashCode, toString gerados pelo Lombok
}