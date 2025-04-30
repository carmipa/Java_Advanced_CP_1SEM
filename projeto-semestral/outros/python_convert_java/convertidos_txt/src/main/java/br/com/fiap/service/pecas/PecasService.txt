package br.com.fiap.service.pecas;

import br.com.fiap.dto.pecas.PecasRequestDto;
import br.com.fiap.dto.pecas.PecasResponseDto;
import java.util.List;

public interface PecasService {
    List<PecasResponseDto> findAll();
    PecasResponseDto findById(Long id);
    PecasResponseDto create(PecasRequestDto pecasDto);
    PecasResponseDto update(Long id, PecasRequestDto pecasDto);
    void deleteById(Long id);
}