package br.com.fiap.service.oficina;

import br.com.fiap.dto.oficina.OficinaRequestDto;
import br.com.fiap.dto.oficina.OficinaResponseDto;
import java.util.List;

public interface OficinaService {
    List<OficinaResponseDto> findAll();
    OficinaResponseDto findById(Long id);
    OficinaResponseDto create(OficinaRequestDto oficinaDto);
    OficinaResponseDto update(Long id, OficinaRequestDto oficinaDto);
    void deleteById(Long id);
}