// --- src/main/java/br/com/fiap/repository/relacionamentos/AgendaVeiculoRepository.java ---
package br.com.fiap.repository.relacionamentos;

import br.com.fiap.model.relacionamentos.AgendaVeiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; // Importar List
import java.util.Optional; // Importar Optional

// Repositório para a entidade de junção AV
public interface AgendaVeiculoRepository extends JpaRepository<AgendaVeiculo, Long> {

    /**
     * Verifica se uma associação específica já existe pelos IDs das entidades relacionadas.
     * @param agendaId ID da Agenda
     * @param veiculoId ID do Veiculo
     * @return true se a associação existe, false caso contrário.
     */
    boolean existsByAgendaIdAndVeiculoId(Long agendaId, Long veiculoId);

    /**
     * Busca uma associação específica (Optional) pelos IDs das entidades relacionadas.
     * @param agendaId ID da Agenda
     * @param veiculoId ID do Veiculo
     * @return Optional contendo a associação se encontrada, Optional vazio caso contrário.
     */
    Optional<AgendaVeiculo> findByAgendaIdAndVeiculoId(Long agendaId, Long veiculoId);

    /**
     * Busca todas as associações (AgendaVeiculo) para um determinado ID de agenda.
     * Necessário para os métodos deleteById e findVeiculosByAgendaId em AgendaServiceImpl.
     * @param agendaId O ID da Agenda cujas associações devem ser buscadas.
     * @return Uma lista de entidades AgendaVeiculo.
     */
    List<AgendaVeiculo> findByAgendaId(Long agendaId); // <<< MÉTODO QUE ESTAVA FALTANDO

    List<AgendaVeiculo> findByVeiculoIdIn(List<Long> veiculoIds);

}