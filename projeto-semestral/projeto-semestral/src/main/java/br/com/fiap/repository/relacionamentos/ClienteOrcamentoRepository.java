package br.com.fiap.repository.relacionamentos;

import br.com.fiap.model.relacionamentos.ClienteOrcamento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteOrcamentoRepository extends JpaRepository<ClienteOrcamento, Long> {
}