// --- Arquivo: src/main/java/br/com/fiap/repository/relacionamentos/ClienteOrcamentoRepository.java ---
package br.com.fiap.repository.relacionamentos;

import br.com.fiap.model.relacionamentos.ClienteId; // Importar ClienteId
import br.com.fiap.model.relacionamentos.ClienteOrcamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; // Importar List

public interface ClienteOrcamentoRepository extends JpaRepository<ClienteOrcamento, Long> {

    // <<< NOVO MÉTODO ADICIONADO >>>
    List<ClienteOrcamento> findByCliente_Id(ClienteId clienteId);
}