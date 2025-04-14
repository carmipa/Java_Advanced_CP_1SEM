// --- src/main/java/br/com/fiap/service/clientes/ClienteServiceImpl.java ---
package br.com.fiap.service.clientes; // Ajuste de pacote

import br.com.fiap.dto.cliente.ClienteRequestDto;
import br.com.fiap.dto.cliente.ClienteResponseDto;
// Remover DTOs de Contato/Endereco daqui, serão usados pelo Mapper
import br.com.fiap.exception.ClientesNotFoundException;
import br.com.fiap.mapper.ClienteMapper; // Importar Mapper
import br.com.fiap.mapper.ContatoMapper; // Necessário para atualizar Contato
import br.com.fiap.mapper.EnderecoMapper; // Necessário para criar/atualizar Endereco
import br.com.fiap.model.Clientes;
import br.com.fiap.model.Contato;
import br.com.fiap.model.Endereco;
import br.com.fiap.model.relacionamentos.ClienteId;
import br.com.fiap.repository.AutenticarRepository;
import br.com.fiap.repository.ClientesRepository;
import br.com.fiap.repository.ContatoRepository;
import br.com.fiap.repository.EnderecoRepository;
// Remover import duplicado ClienteService
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClienteServiceImpl implements ClienteService { // Implementa a interface correta

    private static final Logger log = LoggerFactory.getLogger(ClienteServiceImpl.class);
    private final ClientesRepository clienteRepository;
    private final EnderecoRepository enderecoRepository;
    private final ContatoRepository contatoRepository;
    private final AutenticarRepository autenticarRepository;
    private final ClienteMapper clienteMapper; // <-- Injetar Mapper Cliente
    private final EnderecoMapper enderecoMapper; // <-- Injetar Mapper Endereco
    private final ContatoMapper contatoMapper;   // <-- Injetar Mapper Contato


    @Autowired
    public ClienteServiceImpl(ClientesRepository clientesRepository,
                              EnderecoRepository enderecoRepository,
                              ContatoRepository contatoRepository,
                              AutenticarRepository autenticarRepository,
                              ClienteMapper clienteMapper,        // <-- Injetar
                              EnderecoMapper enderecoMapper,      // <-- Injetar
                              ContatoMapper contatoMapper) {      // <-- Injetar
        this.clienteRepository = clientesRepository;
        this.enderecoRepository = enderecoRepository;
        this.contatoRepository = contatoRepository;
        this.autenticarRepository = autenticarRepository;
        this.clienteMapper = clienteMapper;           // <-- Inicializar
        this.enderecoMapper = enderecoMapper;         // <-- Inicializar
        this.contatoMapper = contatoMapper;           // <-- Inicializar
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDto> findAll() {
        log.info("Buscando todos os clientes");
        return clienteRepository.findAll().stream()
                .map(clienteMapper::toResponseDto) // <-- Usar Mapper
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDto findById(ClienteId id) {
        log.info("Buscando cliente por ID: {}", id);
        Clientes cliente = findClienteById(id);
        return clienteMapper.toResponseDto(cliente); // <-- Usar Mapper
    }

    @Override
    @Transactional
    public ClienteResponseDto create(ClienteRequestDto clienteDto) {
        log.info("Criando novo cliente: {}", clienteDto.getNome());
        try {
            // 1. Mapear e Salvar Endereco
            Endereco enderecoEntity = enderecoMapper.toEntity(clienteDto.getEndereco()); // <-- Usar Mapper
            Endereco savedEndereco = enderecoRepository.save(enderecoEntity);
            log.info("Endereço criado/salvo com ID: {}", savedEndereco.getCodigo());

            // 2. Mapear e Salvar Contato
            Contato contatoEntity = contatoMapper.toEntity(clienteDto.getContato()); // <-- Usar Mapper
            Contato savedContato = contatoRepository.save(contatoEntity);
            log.info("Contato criado/salvo com ID: {}", savedContato.getCodigo());

            // 3. Mapear Cliente (sem ID, Endereco e Contato por enquanto)
            Clientes clienteEntity = clienteMapper.toEntity(clienteDto); // <-- Usar Mapper (mapeia campos simples)

            // 4. Associar Endereco e Contato salvos
            clienteEntity.setEndereco(savedEndereco);
            clienteEntity.setContato(savedContato);
            // Associar Autenticar se necessário

            // 5. Salvar Cliente (ID_CLI será gerado, ID_ENDERECO será pego do objeto Endereco associado)
            Clientes savedCliente = clienteRepository.save(clienteEntity);
            log.info("Cliente criado com ID_CLI: {}, ID_ENDERECO: {}", savedCliente.getId().getIdCli(), savedCliente.getId().getEnderecoId());

            // 6. Mapear para Response DTO
            return clienteMapper.toResponseDto(savedCliente); // <-- Usar Mapper

        } catch (Exception e) {
            log.error("Erro ao criar cliente: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar cliente", e);
        }
    }

    @Override
    @Transactional
    public ClienteResponseDto update(ClienteId id, ClienteRequestDto clienteDto) {
        log.info("Atualizando cliente com ID: {}", id);
        // 1. Busca Cliente existente
        Clientes existingCliente = findClienteById(id);

        // 2. Atualiza Endereco associado
        Endereco existingEndereco = existingCliente.getEndereco();
        if (existingEndereco != null && clienteDto.getEndereco() != null) {
            enderecoMapper.updateEntityFromDto(clienteDto.getEndereco(), existingEndereco); // <-- Usar Mapper
            enderecoRepository.save(existingEndereco); // Salva mudanças no endereço
        } else {
            log.warn("Endereço existente ou DTO de endereço nulo para cliente ID {}. Não foi possível atualizar o endereço.", id);
        }


        // 3. Atualiza Contato associado
        Contato existingContato = existingCliente.getContato();
        if (existingContato != null && clienteDto.getContato() != null) {
            contatoMapper.updateEntityFromDto(clienteDto.getContato(), existingContato); // <-- Usar Mapper
            contatoRepository.save(existingContato); // Salva mudanças no contato
        } else {
            log.warn("Contato existente ou DTO de contato nulo para cliente ID {}. Não foi possível atualizar o contato.", id);
        }


        // 4. Atualiza outros campos do Cliente usando o Mapper
        clienteMapper.updateEntityFromDto(clienteDto, existingCliente); // <-- Usar Mapper

        // 5. Salva o Cliente
        Clientes updatedCliente = clienteRepository.save(existingCliente);
        log.info("Cliente atualizado com ID: {}", updatedCliente.getId());
        return clienteMapper.toResponseDto(updatedCliente); // <-- Usar Mapper
    }

    @Override
    @Transactional
    public void deleteById(ClienteId id) {
        log.info("Deletando cliente com ID: {}", id);
        Clientes cliente = findClienteById(id); // Verifica existência
        try {
            // A ordem de deleção pode importar dependendo das constraints e cascade
            // Assumindo que deletar o cliente é suficiente (ou cascade remove dependentes)
            clienteRepository.delete(cliente);
            log.info("Cliente deletado com ID: {}", id);

            // Opcional: Deletar Endereco/Contato se não tiverem mais referências e não houver cascade
            // Cuidado para não deletar se forem compartilhados!
            // if (cliente.getEndereco() != null) {
            //    // Verificar se o endereço é usado por outros antes de deletar
            //    enderecoRepository.delete(cliente.getEndereco());
            // }
            // if (cliente.getContato() != null) {
            //    // Verificar se o contato é usado por outros
            //     contatoRepository.delete(cliente.getContato());
            // }

        } catch (Exception e) {
            log.error("Erro ao deletar cliente com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar cliente com ID: " + id, e);
        }
    }

    // --- Métodos auxiliares ---
    private Clientes findClienteById(ClienteId id) {
        // Validação de ID nulo
        if (id == null || id.getIdCli() == null || id.getEnderecoId() == null) {
            throw new IllegalArgumentException("ID do Cliente (composto) não pode ser nulo ou incompleto.");
        }
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ClientesNotFoundException("Cliente não encontrado com ID: " + id));
    }

    // REMOVER os métodos manuais de mapeamento:
    // mapEntityToResponseDto(Clientes entity)
    // updateClienteEntityFromDto(Clientes entity, ClienteRequestDto dto)
    // mapEnderecoRequestDtoToEntity(EnderecoRequestDto dto)
    // updateEnderecoEntityFromDto(Endereco entity, EnderecoRequestDto dto)
    // mapEnderecoEntityToResponseDto(Endereco entity)
    // mapContatoRequestDtoToEntity(ContatoRequestDto dto)
    // updateContatoEntityFromDto(Contato entity, ContatoRequestDto dto)
    // mapContatoEntityToResponseDto(Contato entity)
}