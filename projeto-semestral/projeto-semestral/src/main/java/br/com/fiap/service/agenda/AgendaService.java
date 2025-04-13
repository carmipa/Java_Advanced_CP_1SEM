package br.com.fiap.service.agenda; // Ou br.com.fiap.service.agendaService

import br.com.fiap.dto.agenda.AgendaRequestDto;
import br.com.fiap.dto.agenda.AgendaResponseDto;
// Importe suas exceções customizadas se for declará-las aqui (opcional com RuntimeException)
// import br.com.fiap.exception.AgendaNotFoundException;

import java.util.List;

public interface AgendaService {

    List<AgendaResponseDto> findAll();

    AgendaResponseDto findById(Long id); // Adicionando busca por ID

    AgendaResponseDto create(AgendaRequestDto agendaDto);

    AgendaResponseDto update(Long id, AgendaRequestDto agendaDto);

    void deleteById(Long id);

}