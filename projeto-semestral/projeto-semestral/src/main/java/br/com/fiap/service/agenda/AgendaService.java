// --- src/main/java/br/com/fiap/service/agenda/AgendaService.java ---
package br.com.fiap.service.agenda;

import br.com.fiap.dto.agenda.AgendaRequestDto;
import br.com.fiap.dto.agenda.AgendaResponseDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
import org.springframework.data.domain.Page; // Importar Page
import org.springframework.data.domain.Pageable; // Importar Pageable
import java.time.LocalDate;
import java.util.List;

public interface AgendaService {

    // Novo método com paginação e filtro
    Page<AgendaResponseDto> findWithFilters(LocalDate dataInicio, LocalDate dataFim, String observacao, Pageable pageable);

    AgendaResponseDto findById(Long id);
    AgendaResponseDto create(AgendaRequestDto agendaDto);
    AgendaResponseDto update(Long id, AgendaRequestDto agendaDto);
    void deleteById(Long id);

    // Métodos para Gerenciar Relacionamento com Veiculo
    void associarVeiculo(Long agendaId, Long veiculoId);
    void desassociarVeiculo(Long agendaId, Long veiculoId);
    List<VeiculoResponseDto> findVeiculosByAgendaId(Long agendaId);
}