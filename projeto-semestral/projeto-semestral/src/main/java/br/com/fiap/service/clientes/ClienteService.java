// Pacote: br.com.fiap.service.clientes
package br.com.fiap.service.clientes;

import br.com.fiap.dto.cliente.ClienteInfoDTO;
import br.com.fiap.dto.cliente.ClienteRequestDto;
import br.com.fiap.dto.cliente.ClienteResponseDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto; // <<< IMPORTAR DTO DO VEÍCULO
import br.com.fiap.model.relacionamentos.ClienteId;
import java.util.List;

public interface ClienteService {
    List<ClienteResponseDto> findAll();
    ClienteResponseDto findById(ClienteId id);
    ClienteResponseDto create(ClienteRequestDto clienteDto);
    ClienteResponseDto update(ClienteId id, ClienteRequestDto clienteDto);
    void deleteById(ClienteId id);
    List<ClienteInfoDTO> buscarClientes(String nome, String documento, Long idCliente);

    // <<< NOVA ASSINATURA ADICIONADA >>>
    List<VeiculoResponseDto> findVeiculosByClienteId(ClienteId clienteId);
}