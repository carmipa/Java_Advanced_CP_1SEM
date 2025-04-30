package br.com.fiap.repository;

import br.com.fiap.model.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {
}