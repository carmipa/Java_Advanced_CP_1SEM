package br.com.fiap.service.veiculo;

import br.com.fiap.dto.veiculo.VeiculoRequestDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
import java.util.List;

public interface VeiculoService {
    List<VeiculoResponseDto> findAll();
    VeiculoResponseDto findById(Long id);
    VeiculoResponseDto create(VeiculoRequestDto veiculoDto);
    VeiculoResponseDto update(Long id, VeiculoRequestDto veiculoDto);
    void deleteById(Long id);
}