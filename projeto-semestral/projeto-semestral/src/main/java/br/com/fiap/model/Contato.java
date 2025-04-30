package br.com.fiap.model;

import jakarta.persistence.*;   // Importações JPA
import lombok.*;                // Lombok
import java.io.Serializable;

@Entity // Marca como Entidade JPA
@Table(name = "CONTATOS") // Mapeia para a tabela TB_CONTATOS

// --- Lombok ---
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "codigo")
@ToString
//---------------
public class Contato implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id // Chave Primária
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "contato_seq_gen")
	@SequenceGenerator(name = "contato_seq_gen", sequenceName = "CONTATOS_ID_CONT_SEQ", allocationSize = 1) // Usa a sequence do DDL
	@Column(name = "ID_CONT") // Mapeia para a coluna ID_CONT
	private Long codigo;

	@Column(name = "CELULAR", length = 20, nullable = false) // Mapeia para CELULAR
	private String celular;

	@Column(name = "EMAIL", length = 50, nullable = false) // Mapeia para EMAIL
	private String email;

	@Column(name = "CONTATO", length = 100, nullable = false) // Mapeia para CONTATO (Nome do campo Java e da coluna são diferentes aqui, mas ok)
	private String contato; // O nome do campo Java é 'contato', a coluna é 'CONTATO'

	// Getters, Setters, Construtores, equals, hashCode, toString gerados pelo Lombok
}