// Pacote: br.com.fiap.service.clientes
package br.com.fiap.service.clientes;

import br.com.fiap.dto.cliente.ClienteInfoDTO;
import br.com.fiap.dto.cliente.ClienteRequestDto;
import br.com.fiap.dto.cliente.ClienteResponseDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.exception.ClientesNotFoundException;
import br.com.fiap.exception.AutenticarNotFoundException; // Importe esta exceção
import br.com.fiap.mapper.ClienteMapper;
import br.com.fiap.mapper.ContatoMapper;
import br.com.fiap.mapper.EnderecoMapper;
import br.com.fiap.mapper.VeiculoMapper;
import br.com.fiap.model.Clientes;
import br.com.fiap.model.Contato;
import br.com.fiap.model.Endereco;
import br.com.fiap.model.autenticar.Autenticar; // Importe a entidade Autenticar
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
        // Não precisamos injetar PasswordEncoder aqui para a lógica de vincular Autenticar
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

    // --- Método CREATE Modificado para receber autenticarId ---
    // IMPORTANTE: Você precisará atualizar a interface ClienteService para incluir esta assinatura de método
    @Override
    @Transactional
    public ClienteResponseDto create(ClienteRequestDto clienteDto, Long autenticarId) {
        log.info("Criando novo cliente: {} (possivelmente associado a autenticarId: {})", clienteDto.getNome(), autenticarId);
        try {
            // Salvar Endereço
            Endereco enderecoEntity = enderecoMapper.toEntity(clienteDto.getEndereco());
            Endereco savedEndereco = enderecoRepository.save(enderecoEntity);
            log.info("Endereço criado/salvo com ID: {}", savedEndereco.getCodigo());

            // Salvar Contato
            Contato contatoEntity = contatoMapper.toEntity(clienteDto.getContato());
            Contato savedContato = contatoRepository.save(contatoEntity);
            log.info("Contato criado/salvo com ID: {}", savedContato.getCodigo());

            // --- Lógica para Associar com Autenticar Existente ---
            Autenticar autenticarEntity = null;
            if (autenticarId != null) {
                log.debug("Buscando entidade Autenticar com ID: {}", autenticarId);
                autenticarEntity = autenticarRepository.findById(autenticarId)
                        .orElseThrow(() -> new AutenticarNotFoundException("Credencial de autenticação não encontrada com ID: " + autenticarId));
                log.info("Credencial de autenticação ID {} encontrada.", autenticarId);
            }
            // ==================================================


            // Mapear Cliente e Associar Endereço, Contato e Autenticar
            Clientes clienteEntity = clienteMapper.toEntity(clienteDto);
            clienteEntity.setEndereco(savedEndereco);
            clienteEntity.setContato(savedContato);
            clienteEntity.setAutenticar(autenticarEntity); // Associa a entidade Autenticar (será null se autenticarId for null)

            // Inicializar ID composto se necessário (@MapsId cuida do enderecoId)
            if (clienteEntity.getId() == null) {
                clienteEntity.setId(new ClienteId());
            }
            // O ID do cliente (ID_CLI) será gerado pela trigger/sequence do banco após o save

            Clientes savedCliente = clienteRepository.save(clienteEntity);
            log.info("Cliente criado com ID_CLI: {}, ID_ENDERECO: {}{}",
                    savedCliente.getId().getIdCli(),
                    savedCliente.getId().getEnderecoId(),
                    autenticarId != null ? " e associado ao Autenticar ID: " + autenticarId : "");


            return clienteMapper.toResponseDto(savedCliente);
        } catch (AutenticarNotFoundException e) {
            // Relança a exceção específica para ser tratada no Controller/GlobalExceptionHandler
            log.warn("Erro ao criar cliente: Credencial de autenticação não encontrada. {}", e.getMessage());
            throw e;
        }
        catch (Exception e) {
            log.error("Erro ao criar cliente: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar cliente: " + e.getMessage(), e);
        }
    }
    // --- Fim do Método CREATE Modificado ---


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
            log.warn("Tentando atualizar endereço para cliente ID {}, mas o cliente não possui endereço associado. Ignorando.", id);
            // Você pode optar por criar um novo endereço aqui ou lançar um erro/aviso.
            // Por segurança, vamos ignorar por enquanto.
        }

        // Atualiza Contato
        if (clienteDto.getContato() != null && existingCliente.getContato() != null) {
            log.info("Atualizando contato ID {} para cliente ID {}", existingCliente.getContato().getCodigo(), id);
            contatoMapper.updateEntityFromDto(clienteDto.getContato(), existingCliente.getContato());
        } else if (clienteDto.getContato() != null && existingCliente.getContato() == null) {
            log.warn("Tentando atualizar contato para cliente ID {}, mas o cliente não possui contato associado. Ignorando.", id);
            // Mesma lógica do endereço. Ignorando por segurança.
        }

        // Atualiza dados do cliente (não de Autenticar via este DTO)
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

        // --- Lógica de verificação e remoção de dependências ---
        // É CRUCIAL remover associações em tabelas de junção ou entidades filhas
        // ANTES de tentar deletar a entidade pai (Clientes), para evitar
        // DataIntegrityViolationException.

        // Exemplo: Remover associações Cliente-Veículo (tabela CV)
        List<ClienteVeiculo> clienteVeiculos = clienteVeiculoRepository.findByCliente_Id(id);
        if (!clienteVeiculos.isEmpty()) {
            log.info("Removendo {} associações Cliente-Veículo para Cliente ID: {}", clienteVeiculos.size(), id);
            clienteVeiculoRepository.deleteAllInBatch(clienteVeiculos); // Mais eficiente para listas
            // Ou loop e delete individual: clienteVeiculos.forEach(clienteVeiculoRepository::delete);
        }

        // TODO: Adicionar lógica similar para outras tabelas de junção que referenciam CLIENTES:
        // - ClienteOrcamento (tabela CO) -> use clienteOrcamentoRepository.findByCliente_Id(id)
        // - ClientePagamento (tabela CP) -> use clientePagamentoRepository.findByCliente_Id(id)
        // Certifique-se de ter os métodos findByCliente_Id(...) nos respectivos repositórios de relacionamento.

        // TODO: Decidir o que fazer com Endereco e Contato associados.
        // Eles se tornam "órfãos" se o Cliente for deletado e não houver outros Clientes
        // usando o mesmo Endereco/Contato. A exclusão em cascata no relacionamento
        // @ManyToOne ou @OneToOne pode ser perigosa se outras entidades referenciam
        // o mesmo Endereco/Contato. A abordagem atual (não deletar automaticamente)
        // é mais segura, mas pode deixar dados não utilizados no BD.
        // Se Endereco/Contato só existem por causa deste Cliente, considere deletar
        // manualmente AQUI ou configurar CascadeType.ALL/REMOVE no relacionamento
        // E usar orphanRemoval = true SE TIVER CERTEZA que só este Cliente referencia.

        // TODO: Decidir o que fazer com o registro em AUTENTICAR associado.
        // Se o usuário de autenticação só serve para este cliente, você pode querer
        // deletar o registro em AUTENTICAR. Mas se o mesmo usuário puder ser
        // associado a múltiplos Clientes (menos comum, mas possível), ou se
        // você quiser manter o histórico de logins, NÃO delete o registro em AUTENTICAR.
        // Se for para deletar:
        // if (cliente.getAutenticar() != null) {
        //     log.info("Removendo registro de autenticação associado (ID: {})", cliente.getAutenticar().getId());
        //     autenticarRepository.delete(cliente.getAutenticar());
        // }

        // --- Fim da lógica de verificação/remoção de dependências ---


        try {
            // Agora, e somente agora, delete o cliente
            clienteRepository.delete(cliente);
            log.info("Cliente ID {} deletado com sucesso.", id);
        } catch (DataIntegrityViolationException e) {
            log.error("Erro de integridade ao deletar cliente ID {}: {}", id, e.getMessage());
            // Relança com uma mensagem mais amigável indicando o problema de dependência
            throw new RuntimeException("Não é possível excluir o cliente pois ele possui registros associados (veículos, orçamentos, pagamentos etc.). Verifique e remova as associações primeiro.", e);
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