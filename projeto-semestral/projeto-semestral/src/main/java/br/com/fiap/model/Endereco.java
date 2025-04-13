package br.com.fiap.model;

import com.google.gson.annotations.SerializedName; // Mantida para ViaCEP/Gson
import jakarta.persistence.*;                      // Importações JPA
import lombok.*;                                   // Lombok

import java.io.Serializable; // Necessário se for parte de chave composta ou relacionamento complexo

@Entity // Marca como Entidade JPA
@Table(name = "ENDERECOS") // Mapeia para a tabela TB_ENDERECOS

// --- Lombok ---
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "codigo") // Baseia equals/hashCode no ID
@ToString
//---------------
public class Endereco implements Serializable { // Implementar Serializable é uma boa prática para entidades

	private static final long serialVersionUID = 1L;

	@Id // Chave Primária
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "endereco_seq_gen")
	@SequenceGenerator(name = "endereco_seq_gen", sequenceName = "ENDERECOS_ID_END_SEQ", allocationSize = 1) // Usa a sequence do DDL
	@Column(name = "ID_END") // Mapeia para a coluna ID_END
	private Long codigo; // Seu campo 'codigo' mapeia para ID_END

	@Column(name = "NUMERO", nullable = false) // Mapeia para a coluna NUMERO
	private int numero; // Mantido como int, pois no DDL é NUMBER not null

	@Column(name = "CEP", length = 10, nullable = false) // Mapeia para CEP
	private String cep;

	@Column(name = "LOGRADOURO", length = 100, nullable = false) // Mapeia para LOGRADOURO
	private String logradouro;

	@Column(name = "CIDADE", length = 100, nullable = false) // Mapeia para CIDADE
	@SerializedName("localidade") // <-- ANOTAÇÃO GSON MANTIDA!
	private String cidade;

	@Column(name = "BAIRRO", length = 100, nullable = false) // Mapeia para BAIRRO
	private String bairro;

	@Column(name = "ESTADO", length = 50, nullable = false) // Mapeia para ESTADO
	@SerializedName("uf") // <-- ANOTAÇÃO GSON MANTIDA!
	private String estado;

	@Column(name = "COMPLEMENTO", length = 100, nullable = true) // Mapeia para COMPLEMENTO (permite nulo)
	private String complemento;

	// Getters, Setters, Construtores, equals, hashCode, toString gerados pelo Lombok
	// Comentário original removido pois o ID agora é gerenciado pelo JPA/Banco
}