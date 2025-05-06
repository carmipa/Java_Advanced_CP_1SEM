// br/com/fiap/repository/relacionamentos/OficinaOrcamentoRepository.java
package br.com.fiap.repository.relacionamentos;

import br.com.fiap.model.relacionamentos.OficinaOrcamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; // Adicionar este import

public interface OficinaOrcamentoRepository extends JpaRepository<OficinaOrcamento, Long> {

    // <<< NOVO MÉTODO ADICIONADO >>>
    List<OficinaOrcamento> findByOrcamentoId(Long orcamentoId);

    // Opcionalmente, você poderia adicionar um método para deletar diretamente,
    // mas buscar e depois deletar a lista é uma abordagem comum e segura.
    // @Modifying
    // @Query("DELETE FROM OficinaOrcamento oo WHERE oo.orcamento.id = :orcamentoId")
    // void deleteByOrcamentoId(@Param("orcamentoId") Long orcamentoId);
}