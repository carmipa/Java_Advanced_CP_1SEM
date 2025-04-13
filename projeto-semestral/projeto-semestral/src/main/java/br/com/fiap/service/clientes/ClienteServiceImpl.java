package br.com.fiap.service;

import br.com.fiap.dto.cliente.ClienteRequestDto;
import br.com.fiap.dto.cliente.ClienteResponseDto;
import br.com.fiap.dto.contato.ContatoRequestDto;
import br.com.fiap.dto.contato.ContatoResponseDto;
import br.com.fiap.dto.endereco.EnderecoRequestDto;
import br.com.fiap.dto.endereco.EnderecoResponseDto;
import br.com.fiap.exception.ClientesNotFoundException; // Supondo que você criou esta
import br.com.fiap.exception.ContatoNotFoundException; // Supondo que você criou esta
import br.com.fiap.exception.EnderecoNotFoundException; // Supondo que você criou esta
import br.com.fiap.model.Autenticar; // Supondo que você criou a entidade
import br.com.fiap.model.Clientes;
import br.com.fiap.model.Contato;
import br.com.fiap.model.Endereco;
import br.com.fiap.model.relacionamentos.ClienteId;
import br.com.fiap.repository.AutenticarRepository; // Se for gerenciar Autenticar aqui
import br.com.fiap.repository.ClientesRepository;
import br.com.fiap.repository.ContatoRepository;
import br.com.fiap.repository.EnderecoRepository;
import br.com.fiap.service.clientes.ClienteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClienteServiceImpl implements ClienteService {

    private static final Logger log = LoggerFactory.getLogger(ClienteServiceImpl.class);
    private final ClientesRepository clienteRepository;
    private final EnderecoRepository enderecoRepository; // Necessário para salvar/atualizar Endereco
    private final ContatoRepository contatoRepository;   // Necessário para salvar/atualizar Contato
    private final AutenticarRepository autenticarRepository; // Opcional, dependendo de como Autenticar é gerenciado

    @Autowired
    public ClienteServiceImpl(ClientesRepository clientesRepository,
                              EnderecoRepository enderecoRepository,
                              ContatoRepository contatoRepository,
                              AutenticarRepository autenticarRepository) { // Injete se necessário
        this.clienteRepository = clientesRepository;
        this.enderecoRepository = enderecoRepository;
        this.contatoRepository = contatoRepository;
        this.autenticarRepository = autenticarRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDto> findAll() {
        log.info("Buscando todos os clientes");
        return clienteRepository.findAll().stream()
                .map(this::mapEntityToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDto findById(ClienteId id) {
        log.info("Buscando cliente por ID: {}", id);
        Clientes cliente = findClienteById(id);
        return mapEntityToResponseDto(cliente);
    }

    @Override
    @Transactional
    public ClienteResponseDto create(ClienteRequestDto clienteDto) {
        log.info("Criando novo cliente: {}", clienteDto.getNome());
        try {
            // 1. Salvar Endereco primeiro (pois é parte da chave do Cliente)
            Endereco enderecoEntity = mapEnderecoRequestDtoToEntity(clienteDto.getEndereco());
            Endereco savedEndereco = enderecoRepository.save(enderecoEntity);
            log.info("Endereço criado/salvo com ID: {}", savedEndereco.getCodigo());

            // 2. Salvar Contato
            Contato contatoEntity = mapContatoRequestDtoToEntity(clienteDto.getContato());
            Contato savedContato = contatoRepository.save(contatoEntity);
            log.info("Contato criado/salvo com ID: {}", savedContato.getCodigo());

            // 3. Criar Cliente (agora temos ID do endereço para a chave composta)
            Clientes clienteEntity = new Clientes();
            // ID_CLI será gerado pelo trigger/sequence no save do cliente
            // Precisamos setar o Endereco e Contato salvos, e mapear outros campos
            clienteEntity.setEndereco(savedEndereco); // Associa o endereço salvo
            clienteEntity.setContato(savedContato);   // Associa o contato salvo
            // Mapear outros campos do DTO para a Entidade Cliente
            updateClienteEntityFromDto(clienteEntity, clienteDto); // Reusa lógica de mapeamento

            // *** ATENÇÃO: Criar o ClienteId ANTES de salvar Cliente ***
            // O ID_CLI ainda será nulo, mas o ID do Endereço já existe.
            // O JPA/Hibernate usará o ID do Endereço associado via @MapsId para a parte enderecoId da chave.
            // O ID_CLI será populado pelo banco/trigger.
            // A entidade Cliente com @EmbeddedId e @MapsId gerencia isso.

            Clientes savedCliente = clienteRepository.save(clienteEntity);
            log.info("Cliente criado com ID_CLI: {}, ID_ENDERECO: {}", savedCliente.getId().getIdCli(), savedCliente.getId().getEnderecoId());

            // 4. Mapear para Response DTO (agora temos o ID completo)
            return mapEntityToResponseDto(savedCliente);

        } catch (Exception e) {
            log.error("Erro ao criar cliente: {}", e.getMessage(), e);
            // Lançar exceção específica
            throw new RuntimeException("Falha ao criar cliente", e);
        }
    }

    @Override
    @Transactional
    public ClienteResponseDto update(ClienteId id, ClienteRequestDto clienteDto) {
        log.info("Atualizando cliente com ID: {}", id);
        // 1. Busca Cliente existente (já valida se existe)
        Clientes existingCliente = findClienteById(id);

        // 2. Atualiza Endereco associado (se fornecido e diferente)
        // (Lógica mais complexa pode ser necessária aqui: buscar endereço existente pelo ID do DTO?)
        // Simplificação: Atualiza o endereço existente do cliente.
        Endereco existingEndereco = existingCliente.getEndereco();
        updateEnderecoEntityFromDto(existingEndereco, clienteDto.getEndereco());
        enderecoRepository.save(existingEndereco); // Salva mudanças no endereço

        // 3. Atualiza Contato associado
        Contato existingContato = existingCliente.getContato();
        updateContatoEntityFromDto(existingContato, clienteDto.getContato());
        contatoRepository.save(existingContato); // Salva mudanças no contato

        // 4. Atualiza outros campos do Cliente
        updateClienteEntityFromDto(existingCliente, clienteDto);

        // 5. Salva o Cliente (JPA fará UPDATE pois já tem ID)
        // Note: O ID (@EmbeddedId) não muda
        Clientes updatedCliente = clienteRepository.save(existingCliente);
        log.info("Cliente atualizado com ID: {}", updatedCliente.getId());
        return mapEntityToResponseDto(updatedCliente);
    }

    @Override
    @Transactional
    public void deleteById(ClienteId id) {
        log.info("Deletando cliente com ID: {}", id);
        Clientes cliente = findClienteById(id); // Verifica existência
        try {
            // Atenção: Devido ao CascadeType.ALL (se usado) e à dependência de FK,
            // a ordem de deleção ou a configuração do cascade pode ser importante.
            // Se Cliente "possui" Endereco/Contato (CascadeType.ALL),
            // deletar Cliente pode deletar os outros automaticamente via JPA.
            // Se não houver cascade, talvez seja necessário deletar Endereco/Contato
            // separadamente se eles não forem referenciados por mais ninguém.
            // A FK na tabela Cliente também pode impedir deleção se houver constraints.
            // Assumindo que a deleção do Cliente é suficiente ou o cascade está configurado:
            clienteRepository.delete(cliente);
            log.info("Cliente deletado com ID: {}", id);
            // Considerar deletar Endereco/Contato órfãos se não houver cascade e for necessário.
            // enderecoRepository.delete(cliente.getEndereco());
            // contatoRepository.delete(cliente.getContato());
        } catch (Exception e) {
            log.error("Erro ao deletar cliente com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar cliente com ID: " + id, e);
        }
    }

    // --- Mapeamento ---
    private Clientes findClienteById(ClienteId id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ClientesNotFoundException("Cliente não encontrado com ID: " + id));
    }

    private ClienteResponseDto mapEntityToResponseDto(Clientes entity) {
        ClienteResponseDto dto = new ClienteResponseDto();
        if (entity.getId() != null) {
            dto.setIdCli(entity.getId().getIdCli()); // Expõe a parte ID_CLI
        }
        dto.setTipoCliente(entity.getTipoCliente());
        dto.setNome(entity.getNome());
        dto.setSobrenome(entity.getSobrenome());
        dto.setSexo(entity.getSexo());
        dto.setTipoDocumento(entity.getTipoDocumento());
        dto.setNumeroDocumento(entity.getNumeroDocumento());
        dto.setDataNascimento(entity.getDataNascimento());
        dto.setAtividadeProfissional(entity.getAtividadeProfissional());
        if (entity.getEndereco() != null) {
            dto.setEndereco(mapEnderecoEntityToResponseDto(entity.getEndereco())); // Mapeia aninhado
        }
        if (entity.getContato() != null) {
            dto.setContato(mapContatoEntityToResponseDto(entity.getContato())); // Mapeia aninhado
        }
        // Mapear Autenticar se necessário (para um DTO resumido)
        return dto;
    }

    // Mapeia Request -> Entidade (para criação e atualização)
    private void updateClienteEntityFromDto(Clientes entity, ClienteRequestDto dto) {
        entity.setTipoCliente(dto.getTipoCliente());
        entity.setNome(dto.getNome());
        entity.setSobrenome(dto.getSobrenome());
        entity.setSexo(dto.getSexo());
        entity.setTipoDocumento(dto.getTipoDocumento());
        entity.setNumeroDocumento(dto.getNumeroDocumento());
        entity.setDataNascimento(dto.getDataNascimento());
        entity.setAtividadeProfissional(dto.getAtividadeProfissional());
        // Endereco e Contato são tratados separadamente (associados/atualizados)
        // Mapear Autenticar se necessário
    }

    // Métodos de mapeamento para Endereco e Contato (similar aos de Agenda)
    private Endereco mapEnderecoRequestDtoToEntity(EnderecoRequestDto dto) {
        if (dto == null) return null;
        Endereco entity = new Endereco();
        entity.setNumero(dto.getNumero());
        entity.setCep(dto.getCep());
        entity.setLogradouro(dto.getLogradouro());
        entity.setCidade(dto.getCidade());
        entity.setBairro(dto.getBairro());
        entity.setEstado(dto.getEstado());
        entity.setComplemento(dto.getComplemento());
        return entity;
    }

    private void updateEnderecoEntityFromDto(Endereco entity, EnderecoRequestDto dto) {
        if (dto == null || entity == null) return;
        entity.setNumero(dto.getNumero());
        entity.setCep(dto.getCep());
        entity.setLogradouro(dto.getLogradouro());
        entity.setCidade(dto.getCidade());
        entity.setBairro(dto.getBairro());
        entity.setEstado(dto.getEstado());
        entity.setComplemento(dto.getComplemento());
    }


    private EnderecoResponseDto mapEnderecoEntityToResponseDto(Endereco entity) {
        if (entity == null) return null;
        EnderecoResponseDto dto = new EnderecoResponseDto();
        dto.setCodigo(entity.getCodigo());
        dto.setNumero(entity.getNumero());
        dto.setCep(entity.getCep());
        dto.setLogradouro(entity.getLogradouro());
        dto.setCidade(entity.getCidade());
        dto.setBairro(entity.getBairro());
        dto.setEstado(entity.getEstado());
        dto.setComplemento(entity.getComplemento());
        return dto;
    }

    private Contato mapContatoRequestDtoToEntity(ContatoRequestDto dto) {
        if (dto == null) return null;
        Contato entity = new Contato();
        entity.setCelular(dto.getCelular());
        entity.setEmail(dto.getEmail());
        entity.setContato(dto.getContato());
        return entity;
    }

    private void updateContatoEntityFromDto(Contato entity, ContatoRequestDto dto) {
        if (dto == null || entity == null) return;
        entity.setCelular(dto.getCelular());
        entity.setEmail(dto.getEmail());
        entity.setContato(dto.getContato());
    }

    private ContatoResponseDto mapContatoEntityToResponseDto(Contato entity) {
        if (entity == null) return null;
        ContatoResponseDto dto = new ContatoResponseDto();
        dto.setCodigo(entity.getCodigo());
        dto.setCelular(entity.getCelular());
        dto.setEmail(entity.getEmail());
        dto.setContato(entity.getContato());
        return dto;
    }
}