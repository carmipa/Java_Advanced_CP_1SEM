package br.com.fiap.model;

import jakarta.persistence.*;   // Importações JPA
import lombok.*;                // Importações Lombok
import java.io.Serializable;    // Para implementar Serializable

@Entity // Marca como Entidade JPA
@Table(name = "AUTENTICAR") // Nome exato da tabela no DDL

// --- Lombok ---
@Getter
@Setter
@NoArgsConstructor // Construtor padrão (obrigatório para JPA)
@AllArgsConstructor // Construtor com todos os campos (útil)
@EqualsAndHashCode(of = "id") // equals e hashCode baseados apenas no campo 'id'
@ToString(exclude = "senha") // Exclui o campo senha do toString padrão por segurança
// --------------
public class Autenticar implements Serializable { // Boa prática implementar Serializable

    private static final long serialVersionUID = 1L; // Boa prática para Serializable

    @Id // Marca como chave primária
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "autenticar_seq_gen") // Geração via Sequence
    @SequenceGenerator(name = "autenticar_seq_gen", sequenceName = "AUTENTICAR_ID_AUT_SEQ", allocationSize = 1) // Configura a sequence do DDL
    @Column(name = "ID_AUT") // Mapeia para a coluna ID_AUT do banco
    private Long id; // Renomeado de 'codigoAutenticacao' para 'id' para simplicidade (ou poderia ser 'idAut')

    @Column(name = "USUARIO", length = 100, nullable = false, unique = true) // Mapeia para USUARIO, com constraints do DDL
    private String usuario;

    @Column(name = "SENHA", length = 100, nullable = false) // Mapeia para SENHA
    private String senha; // <-- Novamente, ATENÇÃO À SEGURANÇA!

    // === MÉTODOS MANUAIS REMOVIDOS ===
    // Os métodos getCodigoAutenticacao(), setCodigoAutenticacao(), getUsuario(), setUsuario(),
    // getSenha(), setSenha(), construtores padrão e completo, equals(), hashCode() e toString()
    // foram removidos pois agora são gerados automaticamente pelas anotações do Lombok
    // (@Getter, @Setter, @NoArgsConstructor, @AllArgsConstructor, @EqualsAndHashCode, @ToString).

    // ==================================
    // !!! ALERTA DE SEGURANÇA !!!
    // ==================================
    // Reitero: Armazenar senhas diretamente como texto no banco é INSEGURO.
    // Em aplicações reais, use Spring Security (ou similar) para aplicar HASHING (ex: BCrypt)
    // na senha ANTES de salvá-la. O campo 'senha' armazenaria o HASH.
    // ==================================
}