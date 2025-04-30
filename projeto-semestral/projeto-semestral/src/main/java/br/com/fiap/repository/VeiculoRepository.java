// src/main/java/br/com/fiap/repository/VeiculoRepository.java
package br.com.fiap.repository;

import br.com.fiap.model.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // <<< ADICIONAR IMPORT

// Adicionar JpaSpecificationExecutor para permitir buscas dinâmicas
public interface VeiculoRepository extends JpaRepository<Veiculo, Long>, JpaSpecificationExecutor<Veiculo> {
    // Nenhum método novo precisa ser definido aqui para a busca com Specification
}