package br.com.fiap.repository.relacionamentos;

import br.com.fiap.model.relacionamentos.ClientePagamento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientePagamentoRepository extends JpaRepository<ClientePagamento, Long> {
}