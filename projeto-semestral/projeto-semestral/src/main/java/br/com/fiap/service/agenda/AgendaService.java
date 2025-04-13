package br.com.fiap.service.agenda;

import br.com.fiap.dto.agenda.AgendaRequestDto;
import br.com.fiap.dto.agenda.AgendaResponseDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto; // Importar DTO de Veiculo
import java.util.List;

public interface AgendaService {
    List<AgendaResponseDto> findAll();
    AgendaResponseDto findById(Long id);
    AgendaResponseDto create(AgendaRequestDto agendaDto);
    AgendaResponseDto update(Long id, AgendaRequestDto agendaDto);
    void deleteById(Long id);

    // --- Métodos para Gerenciar Relacionamento com Veiculo ---
    void associarVeiculo(Long agendaId, Long veiculoId);
    void desassociarVeiculo(Long agendaId, Long veiculoId);
    List<VeiculoResponseDto> findVeiculosByAgendaId(Long agendaId);
    // --------------------------------------------------------
}