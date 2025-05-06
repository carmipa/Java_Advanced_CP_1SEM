// br/com/fiap/repository/relacionamentos/ClienteOrcamentoRepository.java
package br.com.fiap.repository.relacionamentos;

import br.com.fiap.model.relacionamentos.ClienteId;
import br.com.fiap.model.relacionamentos.ClienteOrcamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClienteOrcamentoRepository extends JpaRepository<ClienteOrcamento, Long> {

    List<ClienteOrcamento> findByCliente_Id(ClienteId clienteId);

    // <<< NOVO MÉTODO ADICIONADO >>>
    List<ClienteOrcamento> findByOrcamentoId(Long orcamentoId);

    // Opcional:
    // void deleteByOrcamentoId(Long orcamentoId);
}