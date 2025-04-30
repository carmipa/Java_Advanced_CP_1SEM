// src/main/java/br/com/fiap/service/clientes/ClienteServiceImpl.java
package br.com.fiap.service.clientes;

import br.com.fiap.dto.cliente.ClienteInfoDTO; // <<< Importar
import br.com.fiap.dto.cliente.ClienteRequestDto;
import br.com.fiap.dto.cliente.ClienteResponseDto;
import br.com.fiap.exception.ClientesNotFoundException;
import br.com.fiap.mapper.ClienteMapper;
import br.com.fiap.mapper.ContatoMapper;
import br.com.fiap.mapper.EnderecoMapper;
import br.com.fiap.model.Clientes;
import br.com.fiap.model.Contato;
import br.com.fiap.model.Endereco;
import br.com.fiap.model.relacionamentos.ClienteId;
import br.com.fiap.repository.AutenticarRepository; // Se usar
import br.com.fiap.repository.ClientesRepository;
import br.com.fiap.repository.ContatoRepository;
import br.com.fiap.repository.EnderecoRepository;
import br.com.fiap.repository.specification.ClienteSpecification; // <<< Importar Specification
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification; // <<< Importar Specification
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClienteServiceImpl implements ClienteService {

    private static final Logger log = LoggerFactory.getLogger(ClienteServiceImpl.class);
    private final ClientesRepository clienteRepository;
    private final EnderecoRepository enderecoRepository;
    private final ContatoRepository contatoRepository;
    private final AutenticarRepository autenticarRepository; // Mantenha se usar
    private final ClienteMapper clienteMapper;
    private final EnderecoMapper enderecoMapper;
    private final ContatoMapper contatoMapper;

    @Autowired
    public ClienteServiceImpl(ClientesRepository clientesRepository, EnderecoRepository enderecoRepository, ContatoRepository contatoRepository, AutenticarRepository autenticarRepository, ClienteMapper clienteMapper, EnderecoMapper enderecoMapper, ContatoMapper contatoMapper) {
        this.clienteRepository = clientesRepository;
        this.enderecoRepository = enderecoRepository;
        this.contatoRepository = contatoRepository;
        this.autenticarRepository = autenticarRepository;
        this.clienteMapper = clienteMapper;
        this.enderecoMapper = enderecoMapper;
        this.contatoMapper = contatoMapper;
    }

    // --- IMPLEMENTAÇÃO DA BUSCA DE CLIENTES ---
    @Override
    @Transactional(readOnly = true)
    public List<ClienteInfoDTO> buscarClientes(String nome, String documento, Long idCliente) {
        log.info("Buscando clientes com critérios: nome='{}', documento='{}', idCliente={}", nome, documento, idCliente);

        Specification<Clientes> spec = Specification.where(null); // Inicia sem filtro

        // Adiciona filtros conforme os parâmetros recebidos
        if (nome != null && !nome.isBlank()) {
            spec = spec.and(ClienteSpecification.nomeContains(nome));
        }
        if (documento != null && !documento.isBlank()) {
            spec = spec.and(ClienteSpecification.numeroDocumentoEquals(documento));
        }
        if (idCliente != null && idCliente > 0) {
            spec = spec.and(ClienteSpecification.idCliEquals(idCliente));
        }

        // Evita buscar tudo se nenhum critério for fornecido (opcional)
        if ((nome == null || nome.isBlank()) && (documento == null || documento.isBlank()) && (idCliente == null || idCliente <= 0)) {
            log.warn("Busca de clientes chamada sem critérios.");
            return List.of(); // Retorna lista vazia ou lança exceção
        }


        List<Clientes> clientesEncontrados = clienteRepository.findAll(spec);
        log.info("Encontrados {} clientes para os critérios.", clientesEncontrados.size());

        // Mapeia para DTO incluindo os IDs necessários
        return clientesEncontrados.stream()
                .map(cliente -> new ClienteInfoDTO(
                        cliente.getId().getIdCli(),
                        cliente.getId().getEnderecoId(), // <<< Pega o ID do endereço do relacionamento
                        cliente.getNome(),
                        cliente.getSobrenome(),
                        cliente.getNumeroDocumento()
                ))
                .collect(Collectors.toList());
    }
    // ----------------------------------------

    // --- Mantenha seus métodos findAll, findById, create, update, deleteById como estavam ---
    // ... (Seu código existente para os outros métodos do ClienteService) ...

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDto> findAll() {
        log.info("Buscando todos os clientes");
        return clienteRepository.findAll().stream()
                .map(clienteMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDto findById(ClienteId id) {
        log.info("Buscando cliente por ID: {}", id);
        Clientes cliente = findClienteById(id);
        return clienteMapper.toResponseDto(cliente);
    }

    @Override
    @Transactional
    public ClienteResponseDto create(ClienteRequestDto clienteDto) {
        //...(seu código create como antes)...
        log.info("Criando novo cliente: {}", clienteDto.getNome());
        try {
            Endereco enderecoEntity = enderecoMapper.toEntity(clienteDto.getEndereco());
            Endereco savedEndereco = enderecoRepository.save(enderecoEntity);
            log.info("Endereço criado/salvo com ID: {}", savedEndereco.getCodigo());

            Contato contatoEntity = contatoMapper.toEntity(clienteDto.getContato());
            Contato savedContato = contatoRepository.save(contatoEntity);
            log.info("Contato criado/salvo com ID: {}", savedContato.getCodigo());

            Clientes clienteEntity = clienteMapper.toEntity(clienteDto);
            clienteEntity.setEndereco(savedEndereco);
            clienteEntity.setContato(savedContato);

            // Importante: Inicializar o ClienteId se não for feito automaticamente
            if (clienteEntity.getId() == null) {
                clienteEntity.setId(new ClienteId());
            }
            // O @MapsId no relacionamento com Endereco deve cuidar de setar enderecoId
            // O idCli será gerado pelo sequence/trigger do banco

            Clientes savedCliente = clienteRepository.save(clienteEntity);
            log.info("Cliente criado com ID_CLI: {}, ID_ENDERECO: {}", savedCliente.getId().getIdCli(), savedCliente.getId().getEnderecoId());

            return clienteMapper.toResponseDto(savedCliente);

        } catch (Exception e) {
            log.error("Erro ao criar cliente: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar cliente", e);
        }
    }

    @Override
    @Transactional
    public ClienteResponseDto update(ClienteId id, ClienteRequestDto clienteDto) {
        //...(seu código update como antes)...
        log.info("Atualizando cliente com ID: {}", id);
        Clientes existingCliente = findClienteById(id);
        Endereco existingEndereco = existingCliente.getEndereco();
        if (existingEndereco != null && clienteDto.getEndereco() != null) {
            enderecoMapper.updateEntityFromDto(clienteDto.getEndereco(), existingEndereco);
            enderecoRepository.save(existingEndereco);
        } else {
            log.warn("Endereço existente ou DTO de endereço nulo para cliente ID {}. Não foi possível atualizar o endereço.", id);
        }

        Contato existingContato = existingCliente.getContato();
        if (existingContato != null && clienteDto.getContato() != null) {
            contatoMapper.updateEntityFromDto(clienteDto.getContato(), existingContato);
            contatoRepository.save(existingContato);
        } else {
            log.warn("Contato existente ou DTO de contato nulo para cliente ID {}. Não foi possível atualizar o contato.", id);
        }

        clienteMapper.updateEntityFromDto(clienteDto, existingCliente);
        Clientes updatedCliente = clienteRepository.save(existingCliente);
        log.info("Cliente atualizado com ID: {}", updatedCliente.getId());
        return clienteMapper.toResponseDto(updatedCliente);
    }

    @Override
    @Transactional
    public void deleteById(ClienteId id) {
        //...(seu código deleteById como antes)...
        log.info("Deletando cliente com ID: {}", id);
        Clientes cliente = findClienteById(id);
        try {
            clienteRepository.delete(cliente);
            log.info("Cliente deletado com ID: {}", id);
            // Considere deletar Endereco/Contato órfãos aqui se necessário e seguro
        } catch (Exception e) {
            log.error("Erro ao deletar cliente com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar cliente com ID: " + id, e);
        }
    }

    private Clientes findClienteById(ClienteId id) {
        if (id == null || id.getIdCli() == null || id.getEnderecoId() == null) {
            throw new IllegalArgumentException("ID do Cliente (composto) não pode ser nulo ou incompleto.");
        }
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ClientesNotFoundException("Cliente não encontrado com ID: " + id));
    }
}