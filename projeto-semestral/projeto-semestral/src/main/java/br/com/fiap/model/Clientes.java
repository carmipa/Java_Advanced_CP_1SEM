package br.com.fiap.model;
import br.com.fiap.model.autenticar.Autenticar;
import br.com.fiap.model.relacionamentos.ClienteId;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate; // Importa LocalDate para datas

@Entity
@Table(name = "CLIENTES") // Nome exato da tabela no DDL

// --- Lombok ---
@Getter
@Setter
@NoArgsConstructor // Construtor padrão obrigatório para JPA
@AllArgsConstructor // Construtor com todos os campos (opcional, mas útil)
@ToString(exclude = {"endereco", "contato", "autenticar"}) // Excluir relacionamentos LAZY
// --------------
public class Clientes {

	@EmbeddedId
	private ClienteId id = new ClienteId(); // <<< ADICIONE = new ClienteId(); AQUI

	// --- Relacionamento com Endereco (Obrigatório e parte da PK) ---
	@ManyToOne(fetch = FetchType.LAZY, optional = false) // Relacionamento com Endereco. optional=false porque a FK não pode ser nula
	@MapsId("enderecoId") // Diz que o atributo 'enderecoId' DENTRO do 'id' (@EmbeddedId) deve usar o ID desta entidade Endereco
	@JoinColumn(name = "ENDERECOS_ID_END", nullable = false) // Nome exato da coluna FK no DDL. Não pode ser nulo.
	private Endereco endereco;
	// -----------------------------------------------------------

	// --- Demais Colunas Mapeadas Exatamente como no DDL ---
	@Column(name = "TIPO_CLIENTE", length = 2, nullable = false)
	private String tipoCliente;

	@Column(name = "NOME", length = 50, nullable = false)
	private String nome;

	@Column(name = "SOBRENOME", length = 50, nullable = false)
	private String sobrenome;

	@Column(name = "SEXO", length = 2, nullable = false)
	private String sexo;

	@Column(name = "TIPO_DOCUMENTO", length = 10, nullable = false)
	private String tipoDocumento;

	@Column(name = "NUMERO_DOCUMENTO", length = 20, nullable = false, unique = true) // Ajustado unique=true pois geralmente documentos são únicos
	private String numeroDocumento;

	@Column(name = "DATA_NASCIMENTO", nullable = false) // Nome exato da coluna no DDL
	private LocalDate dataNascimento; // Tipo LocalDate para coluna DATE

	@Column(name = "ATIVIDADE_PROFISSIONAL", length = 50, nullable = false)
	private String atividadeProfissional;

	// --- Relacionamentos Opcionais (FKs permitem NULO no DDL) ---
	@ManyToOne(fetch = FetchType.LAZY) // Pode ser ManyToOne ou OneToOne dependendo da regra de negócio
	@JoinColumn(name = "CONTATOS_ID_CONT", nullable = true) // Nome exato da FK, permite nulo
	private Contato contato;

	@OneToOne(fetch = FetchType.LAZY) // Geralmente autenticação é 1-para-1
	@JoinColumn(name = "AUTENTICAR_ID_AUT", nullable = true) // Nome exato da FK, permite nulo
	private Autenticar autenticar; // Assume que existe uma entidade Autenticar mapeada para TB_AUTENTICAR
	// ---------------------------------------------------------

	// --- equals() e hashCode() baseados no ID composto ---
	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		Clientes clientes = (Clientes) o;
		// Só são iguais se o ID composto não for nulo e for igual ao do outro objeto.
		return id != null && id.equals(clientes.id);
	}

	@Override
	public int hashCode() {
		// Se o ID não for nulo, usa o hashCode dele, senão usa um valor baseado na classe.
		return id != null ? id.hashCode() : getClass().hashCode();
	}
	// ------------------------------------------------------

	// NOTA: Não usamos @GeneratedValue aqui porque a trigger CLIENTES_ID_CLI_TRG
	// no banco de dados já cuida de gerar o ID_CLI usando a sequence CLIENTES_ID_CLI_SEQ.
	// O JPA pegará o valor gerado pelo banco após a inserção.
}