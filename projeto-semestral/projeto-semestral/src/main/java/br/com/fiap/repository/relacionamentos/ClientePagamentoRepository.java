// --- Arquivo: src/main/java/br/com/fiap/repository/relacionamentos/ClientePagamentoRepository.java ---
package br.com.fiap.repository.relacionamentos;

import br.com.fiap.model.relacionamentos.ClienteId; // Importar ClienteId
import br.com.fiap.model.relacionamentos.ClientePagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; // Importar List

public interface ClientePagamentoRepository extends JpaRepository<ClientePagamento, Long> {

    // <<< NOVO MÉTODO ADICIONADO >>>
    List<ClientePagamento> findByCliente_Id(ClienteId clienteId);
}