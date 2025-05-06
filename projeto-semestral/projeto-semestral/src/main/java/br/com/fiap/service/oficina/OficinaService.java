// br/com/fiap/service/oficina/OficinaService.java
package br.com.fiap.service.oficina;

import br.com.fiap.dto.oficina.OficinaRequestDto;
import br.com.fiap.dto.oficina.OficinaResponseDto;
import br.com.fiap.dto.oficina.ItemPecaServicoDto; // Importar
import br.com.fiap.model.Oficina; // Importar entidade
import java.util.List;

public interface OficinaService {
    List<OficinaResponseDto> findAll();
    OficinaResponseDto findById(Long id);
    OficinaResponseDto create(OficinaRequestDto oficinaDto); // Para CRUD simples de Oficina
    OficinaResponseDto update(Long id, OficinaRequestDto oficinaDto); // Para CRUD simples de Oficina
    void deleteById(Long id);

    // Novo método para criar/atualizar Oficina com suas peças
    // Recebe os dados da oficina e a lista de peças do DTO complexo
    Oficina salvarOficinaComPecas(Oficina oficinaParcialmenteMapeada, List<ItemPecaServicoDto> pecasDto);
    Oficina atualizarOficinaComPecas(Long oficinaId, Oficina oficinaParcialmenteMapeada, List<ItemPecaServicoDto> pecasDto);
}