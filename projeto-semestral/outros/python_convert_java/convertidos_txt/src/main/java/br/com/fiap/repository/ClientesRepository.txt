package br.com.fiap.repository;

import br.com.fiap.model.Clientes;
import br.com.fiap.model.relacionamentos.ClienteId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientesRepository extends JpaRepository<Clientes, ClienteId> {
}