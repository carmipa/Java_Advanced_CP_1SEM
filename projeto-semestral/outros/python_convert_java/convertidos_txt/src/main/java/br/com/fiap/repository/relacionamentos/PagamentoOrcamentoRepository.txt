package br.com.fiap.repository.relacionamentos;

import br.com.fiap.model.relacionamentos.PagamentoOrcamento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagamentoOrcamentoRepository extends JpaRepository<PagamentoOrcamento, Long> {
}