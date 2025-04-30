package br.com.fiap.service.clientes;

import br.com.fiap.dto.cliente.ClienteInfoDTO;    // <<< Importar
import br.com.fiap.dto.cliente.ClienteRequestDto;
import br.com.fiap.dto.cliente.ClienteResponseDto;
import br.com.fiap.model.relacionamentos.ClienteId;
import java.util.List;

public interface ClienteService {
    List<ClienteResponseDto> findAll();
    ClienteResponseDto findById(ClienteId id);
    ClienteResponseDto create(ClienteRequestDto clienteDto);
    ClienteResponseDto update(ClienteId id, ClienteRequestDto clienteDto);
    void deleteById(ClienteId id);

    // Assinatura do novo método de busca
    List<ClienteInfoDTO> buscarClientes(String nome, String documento, Long idCliente);
}