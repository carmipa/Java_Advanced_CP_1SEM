// br/com/fiap/service/orcamento/OrcamentoService.java
package br.com.fiap.service.orcamento;

import br.com.fiap.dto.orcamento.OrcamentoRequestDto;
import br.com.fiap.dto.orcamento.OrcamentoResponseDto;
import br.com.fiap.dto.orcamento.OrcamentoComServicoRequestDto;
import java.util.List;

public interface OrcamentoService {
    List<OrcamentoResponseDto> findAll();
    OrcamentoResponseDto findById(Long id);

    // Método CRUD simples para criar um orçamento (se necessário)
    OrcamentoResponseDto create(OrcamentoRequestDto orcamentoDto);

    // Método CRUD simples para atualizar um orçamento (se necessário)
    OrcamentoResponseDto update(Long id, OrcamentoRequestDto orcamentoDto);

    void deleteById(Long id);

    // Novo método para criar o orçamento completo com serviço e peças
    OrcamentoResponseDto registrarServicoComOrcamento(OrcamentoComServicoRequestDto dto);
}