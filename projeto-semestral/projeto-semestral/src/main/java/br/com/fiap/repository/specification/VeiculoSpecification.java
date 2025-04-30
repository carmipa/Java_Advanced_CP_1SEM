// src/main/java/br/com/fiap/repository/specification/VeiculoSpecification.java
package br.com.fiap.repository.specification;

import br.com.fiap.model.Veiculo;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

public class VeiculoSpecification {

    private VeiculoSpecification() {} // Construtor privado para evitar instanciação

    // Busca case-insensitive por parte da placa
    public static Specification<Veiculo> placaContains(String placa) {
        return (root, query, cb) -> {
            if (placa == null || placa.isBlank()) return cb.conjunction(); // Ignora se vazio
            return cb.like(cb.lower(root.get("placa")), "%" + placa.toLowerCase() + "%");
        };
    }

    // Busca case-insensitive por parte do modelo
    public static Specification<Veiculo> modeloContains(String modelo) {
        return (root, query, cb) -> {
            if (modelo == null || modelo.isBlank()) return cb.conjunction();
            return cb.like(cb.lower(root.get("modelo")), "%" + modelo.toLowerCase() + "%");
        };
    }

    // Busca case-insensitive por parte do proprietário
    public static Specification<Veiculo> proprietarioContains(String proprietario) {
        return (root, query, cb) -> {
            if (proprietario == null || proprietario.isBlank()) return cb.conjunction();
            return cb.like(cb.lower(root.get("proprietario")), "%" + proprietario.toLowerCase() + "%");
        };
    }
}