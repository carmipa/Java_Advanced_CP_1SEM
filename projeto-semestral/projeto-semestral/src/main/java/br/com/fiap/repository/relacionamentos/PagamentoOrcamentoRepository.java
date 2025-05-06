// br/com/fiap/repository/relacionamentos/PagamentoOrcamentoRepository.java
package br.com.fiap.repository.relacionamentos;

import br.com.fiap.model.relacionamentos.PagamentoOrcamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; // Adicionar este import

public interface PagamentoOrcamentoRepository extends JpaRepository<PagamentoOrcamento, Long> {

    // <<< NOVO MÉTODO ADICIONADO >>>
    List<PagamentoOrcamento> findByOrcamentoId(Long orcamentoId);

    // Opcional:
    // void deleteByOrcamentoId(Long orcamentoId);
}