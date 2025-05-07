// Pacote: br.com.fiap.service.oficina
package br.com.fiap.service.oficina;

import br.com.fiap.dto.oficina.OficinaRequestDto;
import br.com.fiap.dto.oficina.OficinaResponseDto;
import br.com.fiap.dto.oficina.ItemPecaServicoDto;
import br.com.fiap.dto.oficina.ServicoHistoricoResponseDto; // <<< IMPORTAR NOVO DTO
import br.com.fiap.model.Oficina;
import java.util.List;

public interface OficinaService {
    List<OficinaResponseDto> findAll();
    OficinaResponseDto findById(Long id);
    OficinaResponseDto create(OficinaRequestDto oficinaDto);
    OficinaResponseDto update(Long id, OficinaRequestDto oficinaDto);
    void deleteById(Long id);
    Oficina salvarOficinaComPecas(Oficina oficinaParcialmenteMapeada, List<ItemPecaServicoDto> pecasDto);
    Oficina atualizarOficinaComPecas(Long oficinaId, Oficina oficinaParcialmenteMapeada, List<ItemPecaServicoDto> pecasDto);

    // <<< NOVA ASSINATURA ADICIONADA >>>
    List<ServicoHistoricoResponseDto> findServicosByVeiculoId(Long veiculoId);
}