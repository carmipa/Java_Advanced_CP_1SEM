// Pacote: br.com.fiap.service.clientes
package br.com.fiap.service.clientes;

import br.com.fiap.dto.cliente.ClienteInfoDTO;
import br.com.fiap.dto.cliente.ClienteRequestDto;
import br.com.fiap.dto.cliente.ClienteResponseDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.exception.ClientesNotFoundException;
import br.com.fiap.mapper.ClienteMapper;
import br.com.fiap.mapper.ContatoMapper;
import br.com.fiap.mapper.EnderecoMapper;
import br.com.fiap.mapper.VeiculoMapper;
import br.com.fiap.model.Clientes;
import br.com.fiap.model.Contato;
import br.com.fiap.model.Endereco;
// Remova o import de Veiculo se não for usado diretamente aqui
// import br.com.fiap.model.Veiculo;
import br.com.fiap.model.relacionamentos.ClienteId;
import br.com.fiap.model.relacionamentos.ClienteVeiculo;
import br.com.fiap.repository.AutenticarRepository; // Mantenha se usar Autenticar
import br.com.fiap.repository.ClientesRepository;
import br.com.fiap.repository.ContatoRepository;
import br.com.fiap.repository.EnderecoRepository;
import br.com.fiap.repository.relacionamentos.ClienteVeiculoRepository;
import br.com.fiap.repository.specification.ClienteSpecification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClienteServiceImpl implements ClienteService {

    private static final Logger log = LoggerFactory.getLogger(ClienteServiceImpl.class);

    // Campos marcados como 'final' - boa prática com injeção via construtor
    private final ClientesRepository clienteRepository;
    private final EnderecoRepository enderecoRepository;
    private final ContatoRepository contatoRepository;
    private final AutenticarRepository autenticarRepository; // Mantenha se usar Autenticar
    private final ClienteMapper clienteMapper;
    private final EnderecoMapper enderecoMapper;
    private final ContatoMapper contatoMapper;
    private final ClienteVeiculoRepository clienteVeiculoRepository;
    private final VeiculoMapper veiculoMapper;

    @Autowired
    public ClienteServiceImpl(ClientesRepository clientesRepository, EnderecoRepository enderecoRepository,
                              ContatoRepository contatoRepository, AutenticarRepository autenticarRepository,
                              ClienteMapper clienteMapper, EnderecoMapper enderecoMapper, ContatoMapper contatoMapper,
                              ClienteVeiculoRepository clienteVeiculoRepository,
                              VeiculoMapper veiculoMapper) {
        // Certifique-se que TODAS as atribuições estão aqui e corretas
        this.clienteRepository = clientesRepository;
        this.enderecoRepository = enderecoRepository;
        this.contatoRepository = contatoRepository;
        this.autenticarRepository = autenticarRepository;
        this.clienteMapper = clienteMapper;
        this.enderecoMapper = enderecoMapper;
        this.contatoMapper = contatoMapper;
        this.clienteVeiculoRepository = clienteVeiculoRepository;
        this.veiculoMapper = veiculoMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDto> findAll() {
        log.info("Buscando todos os clientes");
        List<Clientes> clientes = clienteRepository.findAll();
        return clientes.stream()
                .map(clienteMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDto findById(ClienteId id) {
        log.info("Buscando cliente por ID: {}", id);
        // Chama o método auxiliar privado
        Clientes cliente = findClienteByIdOrElseThrow(id);
        return clienteMapper.toResponseDto(cliente);
    }

    @Override
    @Transactional
    public ClienteResponseDto create(ClienteRequestDto clienteDto) {
        log.info("Criando novo cliente: {}", clienteDto.getNome());
        try {
            // Salvar Endereço
            Endereco enderecoEntity = enderecoMapper.toEntity(clienteDto.getEndereco());
            Endereco savedEndereco = enderecoRepository.save(enderecoEntity);
            log.info("Endereço criado/salvo com ID: {}", savedEndereco.getCodigo());

            // Salvar Contato
            Contato contatoEntity = contatoMapper.toEntity(clienteDto.getContato());
            Contato savedContato = contatoRepository.save(contatoEntity);
            log.info("Contato criado/salvo com ID: {}", savedContato.getCodigo());

            // Mapear Cliente e Associar
            Clientes clienteEntity = clienteMapper.toEntity(clienteDto);
            clienteEntity.setEndereco(savedEndereco);
            clienteEntity.setContato(savedContato);

            // Inicializar ID se necessário (geralmente @MapsId cuida disso)
            if (clienteEntity.getId() == null) {
                clienteEntity.setId(new ClienteId());
            }
            // O ID do cliente (ID_CLI) será gerado pela trigger/sequence do banco

            Clientes savedCliente = clienteRepository.save(clienteEntity);
            log.info("Cliente criado com ID_CLI: {}, ID_ENDERECO: {}", savedCliente.getId().getIdCli(), savedCliente.getId().getEnderecoId());

            return clienteMapper.toResponseDto(savedCliente);
        } catch (Exception e) {
            log.error("Erro ao criar cliente: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar cliente: " + e.getMessage(), e);
        }
    }


    @Override
    @Transactional
    public ClienteResponseDto update(ClienteId id, ClienteRequestDto clienteDto) {
        log.info("Atualizando cliente com ID: {}", id);
        // Chama o método auxiliar privado
        Clientes existingCliente = findClienteByIdOrElseThrow(id);

        // Atualiza Endereço
        if (clienteDto.getEndereco() != null && existingCliente.getEndereco() != null) {
            log.info("Atualizando endereço ID {} para cliente ID {}", existingCliente.getEndereco().getCodigo(), id);
            enderecoMapper.updateEntityFromDto(clienteDto.getEndereco(), existingCliente.getEndereco());
        } else if (clienteDto.getEndereco() != null && existingCliente.getEndereco() == null) {
            log.warn("Tentando atualizar endereço para cliente ID {}, mas o cliente não possui endereço associado.", id);
            // Você pode optar por criar um novo endereço aqui ou lançar um erro/aviso.
            // Por segurança, vamos ignorar por enquanto.
        }

        // Atualiza Contato
        if (clienteDto.getContato() != null && existingCliente.getContato() != null) {
            log.info("Atualizando contato ID {} para cliente ID {}", existingCliente.getContato().getCodigo(), id);
            contatoMapper.updateEntityFromDto(clienteDto.getContato(), existingCliente.getContato());
        } else if (clienteDto.getContato() != null && existingCliente.getContato() == null) {
            log.warn("Tentando atualizar contato para cliente ID {}, mas o cliente não possui contato associado.", id);
            // Mesma lógica do endereço. Ignorando por segurança.
        }

        // Atualiza dados do cliente
        clienteMapper.updateEntityFromDto(clienteDto, existingCliente);

        // Salva o cliente (JPA/Hibernate gerencia as atualizações em cascata se configurado)
        Clientes updatedCliente = clienteRepository.save(existingCliente);
        log.info("Cliente atualizado com ID: {}", updatedCliente.getId());
        return clienteMapper.toResponseDto(updatedCliente);
    }

    @Override
    @Transactional
    public void deleteById(ClienteId id) {
        log.warn("Tentando deletar cliente com ID: {}", id);
        // Chama o método auxiliar privado
        Clientes cliente = findClienteByIdOrElseThrow(id);

        // Lógica de verificação de dependências (IMPORTANTE)
        // Exemplo:
        if (!clienteVeiculoRepository.findByCliente_Id(id).isEmpty()) {
            throw new DataIntegrityViolationException("Não é possível excluir cliente pois ele possui veículos associados.");
        }
        // Adicionar verificações para ClienteOrcamento, ClientePagamento, etc.

        try {
            clienteRepository.delete(cliente);
            log.info("Cliente ID {} deletado com sucesso.", id);
            // Não deletar endereço/contato órfãos automaticamente por segurança
        } catch (DataIntegrityViolationException e) {
            log.error("Erro de integridade ao deletar cliente ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Não é possível excluir o cliente pois ele possui registros associados (veículos, orçamentos, etc.). Verifique e remova as associações primeiro.", e);
        } catch (Exception e) {
            log.error("Erro inesperado ao deletar cliente ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar cliente.", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteInfoDTO> buscarClientes(String nome, String documento, Long idCliente) {
        log.info("Buscando clientes com critérios: nome='{}', documento='{}', idCliente={}", nome, documento, idCliente);
        Specification<Clientes> spec = Specification.where(null);

        if (nome != null && !nome.isBlank()) spec = spec.and(ClienteSpecification.nomeContains(nome));
        if (documento != null && !documento.isBlank()) spec = spec.and(ClienteSpecification.numeroDocumentoEquals(documento));
        if (idCliente != null && idCliente > 0) spec = spec.and(ClienteSpecification.idCliEquals(idCliente));

        if ((nome == null || nome.isBlank()) && (documento == null || documento.isBlank()) && (idCliente == null || idCliente <= 0)) {
            log.warn("Busca de clientes chamada sem critérios válidos.");
            return List.of();
        }

        List<Clientes> clientesEncontrados = clienteRepository.findAll(spec);
        log.info("Encontrados {} clientes para os critérios.", clientesEncontrados.size());

        return clientesEncontrados.stream()
                .map(cliente -> new ClienteInfoDTO(
                        cliente.getId().getIdCli(),
                        cliente.getEndereco().getCodigo(), // Pega o ID do objeto Endereco associado
                        cliente.getNome(),
                        cliente.getSobrenome(),
                        cliente.getNumeroDocumento()
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VeiculoResponseDto> findVeiculosByClienteId(ClienteId clienteId) {
        log.info("Buscando veículos para o cliente ID: {}", clienteId);
        // Chama o método auxiliar privado
        if (!clienteRepository.existsById(clienteId)) {
            throw new ClientesNotFoundException("Cliente não encontrado com ID: " + clienteId + " ao buscar veículos.");
        }

        List<ClienteVeiculo> associacoes = clienteVeiculoRepository.findByCliente_Id(clienteId);
        if (associacoes.isEmpty()) {
            log.info("Nenhum veículo encontrado para o cliente ID: {}", clienteId);
            return Collections.emptyList();
        }

        List<VeiculoResponseDto> veiculosDto = associacoes.stream()
                .map(ClienteVeiculo::getVeiculo)
                .map(veiculoMapper::toResponseDto)
                .collect(Collectors.toList());

        log.info("Encontrados {} veículos para o cliente ID: {}", veiculosDto.size(), clienteId);
        return veiculosDto;
    }

    // --- MÉTODO AUXILIAR PRIVADO ---
    // Garante que está DENTRO da classe ClienteServiceImpl
    private Clientes findClienteByIdOrElseThrow(ClienteId id) {
        if (id == null || id.getIdCli() == null || id.getEnderecoId() == null) {
            throw new IllegalArgumentException("ID do Cliente (composto) não pode ser nulo ou incompleto.");
        }
        // Busca pelo ID composto ou lança ClientesNotFoundException
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ClientesNotFoundException("Cliente não encontrado com ID: " + id));
    }
    // --- FIM DO MÉTODO AUXILIAR ---

} // <<< FIM DA CLASSE ClienteServiceImpl