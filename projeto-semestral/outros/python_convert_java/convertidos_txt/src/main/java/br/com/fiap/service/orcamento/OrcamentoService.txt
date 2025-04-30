package br.com.fiap.service.orcamento;

import br.com.fiap.dto.orcamento.OrcamentoRequestDto;
import br.com.fiap.dto.orcamento.OrcamentoResponseDto;
import java.util.List;

public interface OrcamentoService {
    List<OrcamentoResponseDto> findAll();
    OrcamentoResponseDto findById(Long id);
    OrcamentoResponseDto create(OrcamentoRequestDto orcamentoDto);
    OrcamentoResponseDto update(Long id, OrcamentoRequestDto orcamentoDto);
    void deleteById(Long id);
}