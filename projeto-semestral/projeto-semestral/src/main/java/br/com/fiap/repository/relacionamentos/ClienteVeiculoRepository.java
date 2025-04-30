// --- Arquivo: src/main/java/br/com/fiap/repository/relacionamentos/ClienteVeiculoRepository.java ---
package br.com.fiap.repository.relacionamentos;

import br.com.fiap.model.relacionamentos.ClienteId; // Importar ClienteId
import br.com.fiap.model.relacionamentos.ClienteVeiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; // Importar List

public interface ClienteVeiculoRepository extends JpaRepository<ClienteVeiculo, Long> {

    // <<< NOVO MÉTODO ADICIONADO >>>
    // Busca todas as associações ClienteVeiculo baseadas no ID composto do Cliente.
    // Spring Data JPA entende "cliente" (o nome do campo na entidade ClienteVeiculo)
    // e "id" (o nome do campo @EmbeddedId na entidade Clientes).
    List<ClienteVeiculo> findByCliente_Id(ClienteId clienteId);
}