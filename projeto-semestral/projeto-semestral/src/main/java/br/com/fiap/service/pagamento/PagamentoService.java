package br.com.fiap.service.pagamento;

import br.com.fiap.dto.pagamento.PagamentoRequestDto;
import br.com.fiap.dto.pagamento.PagamentoResponseDto;
import java.util.List;

public interface PagamentoService {
    List<PagamentoResponseDto> findAll();
    PagamentoResponseDto findById(Long id);
    PagamentoResponseDto create(PagamentoRequestDto pagamentoDto);
    PagamentoResponseDto update(Long id, PagamentoRequestDto pagamentoDto);
    void deleteById(Long id);
}