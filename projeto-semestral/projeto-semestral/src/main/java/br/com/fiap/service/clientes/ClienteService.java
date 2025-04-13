package br.com.fiap.service.clientes;

import br.com.fiap.dto.cliente.ClienteRequestDto;
import br.com.fiap.dto.cliente.ClienteResponseDto;
import br.com.fiap.model.relacionamentos.ClienteId; // Importar ID Composto
import java.util.List;

public interface ClienteService {
    List<ClienteResponseDto> findAll();
    ClienteResponseDto findById(ClienteId id); // Usa ClienteId
    ClienteResponseDto create(ClienteRequestDto clienteDto);
    ClienteResponseDto update(ClienteId id, ClienteRequestDto clienteDto); // Usa ClienteId
    void deleteById(ClienteId id); // Usa ClienteId
}