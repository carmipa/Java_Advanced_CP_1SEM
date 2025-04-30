// src/main/java/br/com/fiap/repository/ClientesRepository.java
package br.com.fiap.repository;

import br.com.fiap.model.Clientes;
import br.com.fiap.model.relacionamentos.ClienteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // <<< ADICIONAR IMPORT

// Adicionar JpaSpecificationExecutor para permitir buscas com Specification
public interface ClientesRepository extends JpaRepository<Clientes, ClienteId>, JpaSpecificationExecutor<Clientes> {
}