// src/main/java/br/com/fiap/repository/specification/ClienteSpecification.java
package br.com.fiap.repository.specification;

import br.com.fiap.model.Clientes;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

public class ClienteSpecification {

    private ClienteSpecification() {} // Evita instanciação

    public static Specification<Clientes> nomeContains(String nome) {
        return (root, query, cb) -> {
            if (nome == null || nome.isBlank()) {
                return cb.conjunction();
            }
            Predicate nomeMatch = cb.like(cb.lower(root.get("nome")), "%" + nome.toLowerCase() + "%");
            Predicate sobrenomeMatch = cb.like(cb.lower(root.get("sobrenome")), "%" + nome.toLowerCase() + "%");
            return cb.or(nomeMatch, sobrenomeMatch);
        };
    }

    public static Specification<Clientes> numeroDocumentoEquals(String documento) {
        return (root, query, cb) -> {
            if (documento == null || documento.isBlank()) {
                return cb.conjunction();
            }
            return cb.equal(root.get("numeroDocumento"), documento);
        };
    }

    public static Specification<Clientes> idCliEquals(Long idCli) {
        return (root, query, cb) -> {
            if (idCli == null || idCli <= 0) {
                return cb.conjunction();
            }
            // Acessa o campo 'idCli' dentro do 'id' (EmbeddedId)
            return cb.equal(root.get("id").get("idCli"), idCli);
        };
    }
}