package br.com.fiap.service.clientes;

// ... outros imports ...
import br.com.fiap.dto.cliente.ClienteRequestDto;
import br.com.fiap.dto.cliente.ClienteResponseDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto; // <<< IMPORTAR DTO DO VEÍCULO
import br.com.fiap.model.relacionamentos.ClienteId;
import br.com.fiap.dto.cliente.ClienteInfoDTO;
import java.util.List;

public interface ClienteService {
    List<ClienteResponseDto> findAll();
    ClienteResponseDto findById(ClienteId id);

    // <<< NOVA ASSINATURA ADICIONADA/MODIFICADA >>>
    ClienteResponseDto create(ClienteRequestDto clienteDto, Long autenticarId); // Adicionado o parâmetro autenticarId

    ClienteResponseDto update(ClienteId id, ClienteRequestDto clienteDto);
    void deleteById(ClienteId id);
    List<ClienteInfoDTO> buscarClientes(String nome, String documento, Long idCliente);
    List<VeiculoResponseDto> findVeiculosByClienteId(ClienteId clienteId);
}