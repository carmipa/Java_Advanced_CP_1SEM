package br.com.fiap.repository.relacionamentos;

import br.com.fiap.model.relacionamentos.ClienteVeiculo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteVeiculoRepository extends JpaRepository<ClienteVeiculo, Long> {
}