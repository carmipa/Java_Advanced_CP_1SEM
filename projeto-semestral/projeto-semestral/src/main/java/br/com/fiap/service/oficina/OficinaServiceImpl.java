// Pacote: br.com.fiap.service.oficina
package br.com.fiap.service.oficina;

import br.com.fiap.dto.oficina.OficinaRequestDto;
import br.com.fiap.dto.oficina.OficinaResponseDto;
import br.com.fiap.dto.oficina.ItemPecaServicoDto;
import br.com.fiap.dto.oficina.ServicoHistoricoResponseDto;
import br.com.fiap.exception.OficinaNotFoundException;
import br.com.fiap.exception.PecasNotFoundException;
import br.com.fiap.exception.VeiculoNotFoundException;
import br.com.fiap.mapper.OficinaMapper;
import br.com.fiap.model.Oficina;
import br.com.fiap.model.Pecas;
import br.com.fiap.model.relacionamentos.OficinaPeca;
import br.com.fiap.model.relacionamentos.OficinaVeiculo;
import br.com.fiap.repository.OficinaRepository;
import br.com.fiap.repository.PecasRepository;
import br.com.fiap.repository.VeiculoRepository;
import br.com.fiap.repository.relacionamentos.OficinaPecaRepository;
import br.com.fiap.repository.relacionamentos.OficinaVeiculoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OficinaServiceImpl implements OficinaService {

    private static final Logger log = LoggerFactory.getLogger(OficinaServiceImpl.class);

    // Marcar campos como final é boa prática com injeção via construtor
    private final OficinaRepository oficinaRepository;
    private final OficinaMapper oficinaMapper;
    private final PecasRepository pecasRepository;
    private final OficinaPecaRepository oficinaPecaRepository;
    private final VeiculoRepository veiculoRepository;
    private final OficinaVeiculoRepository oficinaVeiculoRepository;

    @Autowired
    public OficinaServiceImpl(OficinaRepository oficinaRepository,
                              OficinaMapper oficinaMapper,
                              PecasRepository pecasRepository,
                              OficinaPecaRepository oficinaPecaRepository,
                              VeiculoRepository veiculoRepository,
                              OficinaVeiculoRepository oficinaVeiculoRepository) {
        this.oficinaRepository = oficinaRepository;
        this.oficinaMapper = oficinaMapper;
        this.pecasRepository = pecasRepository;
        this.oficinaPecaRepository = oficinaPecaRepository;
        this.veiculoRepository = veiculoRepository;
        this.oficinaVeiculoRepository = oficinaVeiculoRepository;
    }

    // --- Implementação dos Métodos CRUD Simples ---
    @Override
    @Transactional(readOnly = true)
    public List<OficinaResponseDto> findAll() {
        log.info("Buscando todos os registros de oficina");
        return oficinaRepository.findAll().stream()
                .map(oficinaMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OficinaResponseDto findById(Long id) {
        log.info("Buscando registro de oficina por ID: {}", id);
        Oficina oficina = findOficinaByIdOrElseThrow(id);
        return oficinaMapper.toResponseDto(oficina);
    }

    @Override
    @Transactional
    public OficinaResponseDto create(OficinaRequestDto oficinaDto) {
        log.info("Criando novo registro de oficina (via DTO simples)");
        try {
            Oficina oficina = oficinaMapper.toEntity(oficinaDto);
            // Aqui não há associação de peças, pois vem do DTO simples
            Oficina savedOficina = oficinaRepository.save(oficina);
            log.info("Registro de oficina criado com ID: {}", savedOficina.getId());
            return oficinaMapper.toResponseDto(savedOficina);
        } catch (Exception e) {
            log.error("Erro ao criar registro de oficina: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar registro de oficina", e);
        }
    }

    @Override
    @Transactional
    public OficinaResponseDto update(Long id, OficinaRequestDto oficinaDto) {
        log.info("Atualizando registro de oficina ID: {} (via DTO simples)", id);
        Oficina existingOficina = findOficinaByIdOrElseThrow(id);
        // Este mapper só atualiza os campos presentes no OficinaRequestDto
        oficinaMapper.updateEntityFromDto(oficinaDto, existingOficina);
        // Associações existentes (peças, veículos, etc.) não são alteradas aqui
        Oficina updatedOficina = oficinaRepository.save(existingOficina);
        log.info("Registro de oficina atualizado com ID: {}", updatedOficina.getId());
        return oficinaMapper.toResponseDto(updatedOficina);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        log.warn("Tentando deletar registro de oficina ID: {}", id);
        Oficina oficina = findOficinaByIdOrElseThrow(id);
        try {
            // IMPORTANTE: Remover associações ANTES de deletar a oficina
            // para evitar erros de chave estrangeira.

            // Exemplo: Remover associações Oficina-Peça (OFP)
            if (oficina.getOficinaPecas() != null && !oficina.getOficinaPecas().isEmpty()) {
                log.info("Removendo {} associações Oficina-Peça para Oficina ID: {}", oficina.getOficinaPecas().size(), id);
                oficinaPecaRepository.deleteAllInBatch(oficina.getOficinaPecas()); // Mais eficiente
                oficina.getOficinaPecas().clear(); // Limpa a coleção na entidade gerenciada
            }
            // Exemplo: Remover associações Oficina-Veiculo (OV)
            if (oficina.getOficinaVeiculos() != null && !oficina.getOficinaVeiculos().isEmpty()) {
                log.info("Removendo {} associações Oficina-Veículo para Oficina ID: {}", oficina.getOficinaVeiculos().size(), id);
                oficinaVeiculoRepository.deleteAllInBatch(oficina.getOficinaVeiculos());
                oficina.getOficinaVeiculos().clear();
            }
            // Adicionar remoção para OficinaOrcamento (OFO) e AgendaOficina (AO) se necessário

            // Agora deleta a oficina
            oficinaRepository.delete(oficina);
            log.info("Registro de oficina deletado com ID: {}", id);
        } catch (DataIntegrityViolationException e) {
            log.error("Erro de integridade ao deletar oficina ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Não é possível excluir o registro de oficina pois ele possui outras associações (orçamentos, agendamentos?). Verifique e remova as dependências.", e);
        } catch (Exception e) {
            log.error("Erro inesperado ao deletar oficina ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar registro de oficina.", e);
        }
    }

    // --- Implementação dos Métodos para Salvar/Atualizar com Peças ---

    @Override
    @Transactional
    public Oficina salvarOficinaComPecas(Oficina oficinaEntidade, List<ItemPecaServicoDto> pecasDto) {
        log.info("Salvando novo registro de Oficina e associando peças.");
        // Garante que a lista de peças na entidade não é nula
        if (oficinaEntidade.getOficinaPecas() == null) {
            oficinaEntidade.setOficinaPecas(new ArrayList<>());
        }
        // Salva a Oficina primeiro para obter o ID, se for nova
        Oficina oficinaSalva = oficinaRepository.save(oficinaEntidade);
        log.debug("Oficina salva com ID: {}", oficinaSalva.getId());

        // Limpa associações antigas (se houver alguma por engano) antes de adicionar novas
        // Isso é mais relevante no 'atualizar', mas por segurança pode ficar aqui também.
        if (!oficinaSalva.getOficinaPecas().isEmpty()) {
            log.warn("Limpando {} associações de peças pré-existentes inesperadas para a nova Oficina ID {}", oficinaSalva.getOficinaPecas().size(), oficinaSalva.getId());
            oficinaPecaRepository.deleteAllInBatch(oficinaSalva.getOficinaPecas());
            oficinaSalva.getOficinaPecas().clear();
        }

        // Processa e salva as novas peças
        if (pecasDto != null && !pecasDto.isEmpty()) {
            log.debug("Processando {} peças para Oficina ID {}", pecasDto.size(), oficinaSalva.getId());
            for (ItemPecaServicoDto itemPecaDto : pecasDto) {
                Pecas peca = pecasRepository.findById(itemPecaDto.getPecaId())
                        .orElseThrow(() -> new PecasNotFoundException("Peça não encontrada com ID: " + itemPecaDto.getPecaId() + " ao salvar Oficina ID " + oficinaSalva.getId()));

                OficinaPeca oficinaPeca = new OficinaPeca();
                oficinaPeca.setOficina(oficinaSalva);
                oficinaPeca.setPeca(peca);
                oficinaPeca.setQuantidade(itemPecaDto.getQuantidade());

                // Salva a entidade de junção e adiciona à coleção gerenciada
                oficinaSalva.getOficinaPecas().add(oficinaPecaRepository.save(oficinaPeca));
                log.trace("Associada Peça ID {} (Qtd: {}) à Oficina ID {}", itemPecaDto.getPecaId(), itemPecaDto.getQuantidade(), oficinaSalva.getId());
            }
        }
        // O save final não é estritamente necessário por causa do contexto transacional,
        // mas pode ser útil para garantir que o objeto retornado esteja totalmente atualizado.
        // return oficinaRepository.save(oficinaSalva); // Ou só oficinaSalva
        return oficinaSalva;
    }

    // --- IMPLEMENTAÇÃO DO MÉTODO QUE FALTAVA ---
    @Override
    @Transactional
    public Oficina atualizarOficinaComPecas(Long oficinaId, Oficina oficinaParcialmenteMapeada, List<ItemPecaServicoDto> pecasDto) {
        log.info("Atualizando Oficina ID {} e associando/atualizando peças.", oficinaId);
        Oficina oficinaExistente = findOficinaByIdOrElseThrow(oficinaId);

        // Atualiza campos simples da Oficina vindos do DTO mapeado
        oficinaExistente.setDataOficina(oficinaParcialmenteMapeada.getDataOficina());
        oficinaExistente.setDescricaoProblema(oficinaParcialmenteMapeada.getDescricaoProblema());
        oficinaExistente.setDiagnostico(oficinaParcialmenteMapeada.getDiagnostico());
        oficinaExistente.setPartesAfetadas(oficinaParcialmenteMapeada.getPartesAfetadas());
        oficinaExistente.setHorasTrabalhadas(oficinaParcialmenteMapeada.getHorasTrabalhadas());
        // Adicione outros campos se o 'oficinaParcialmenteMapeada' os contiver

        // Gerencia as peças: remove antigas, adiciona novas.
        // Abordagem: Limpa todas as existentes e recria com base no DTO atual.
        log.debug("Removendo associações de peças antigas para Oficina ID {}", oficinaId);
        if (oficinaExistente.getOficinaPecas() != null && !oficinaExistente.getOficinaPecas().isEmpty()) {
            oficinaPecaRepository.deleteAllInBatch(oficinaExistente.getOficinaPecas());
            oficinaExistente.getOficinaPecas().clear();
        } else {
            // Garante que a lista existe para adicionar novos itens
            oficinaExistente.setOficinaPecas(new ArrayList<>());
        }

        // Adiciona as peças do DTO atualizado
        if (pecasDto != null && !pecasDto.isEmpty()) {
            log.debug("Adicionando/Atualizando {} peças para Oficina ID {}", pecasDto.size(), oficinaId);
            for (ItemPecaServicoDto itemPecaDto : pecasDto) {
                Pecas peca = pecasRepository.findById(itemPecaDto.getPecaId())
                        .orElseThrow(() -> new PecasNotFoundException("Peça não encontrada com ID: " + itemPecaDto.getPecaId() + " ao atualizar Oficina ID " + oficinaId));

                OficinaPeca novaOficinaPeca = new OficinaPeca();
                novaOficinaPeca.setOficina(oficinaExistente);
                novaOficinaPeca.setPeca(peca);
                novaOficinaPeca.setQuantidade(itemPecaDto.getQuantidade());

                // Adiciona à coleção gerenciada (o save ocorrerá em cascata ou ao final)
                oficinaExistente.getOficinaPecas().add(novaOficinaPeca);
                log.trace("Associada Peça ID {} (Qtd: {}) à Oficina ID {}", itemPecaDto.getPecaId(), itemPecaDto.getQuantidade(), oficinaId);
            }
        }

        // Salva a entidade Oficina. O JPA/Hibernate gerencia o save/update das OficinaPeca
        // adicionadas à coleção, devido ao CascadeType (assumindo CascadeType.ALL ou MERGE/PERSIST no relacionamento).
        return oficinaRepository.save(oficinaExistente);
    }
    // --- FIM DO MÉTODO QUE FALTAVA ---


    // --- Implementação do Histórico de Serviços ---
    @Override
    @Transactional(readOnly = true)
    public List<ServicoHistoricoResponseDto> findServicosByVeiculoId(Long veiculoId) {
        log.info("Buscando histórico de serviços para o veículo ID: {}", veiculoId);
        if (!veiculoRepository.existsById(veiculoId)) {
            throw new VeiculoNotFoundException("Veículo não encontrado com ID: " + veiculoId + " ao buscar histórico.");
        }

        List<OficinaVeiculo> associacoes = oficinaVeiculoRepository.findByVeiculoId(veiculoId);
        if (associacoes.isEmpty()) {
            log.info("Nenhum serviço encontrado para o veículo ID: {}", veiculoId);
            return Collections.emptyList();
        }

        List<ServicoHistoricoResponseDto> historico = associacoes.stream()
                .map(OficinaVeiculo::getOficina)
                .map(oficina -> {
                    List<OficinaPeca> pecasDoServico = oficinaPecaRepository.findByOficinaId(oficina.getId());
                    List<ItemPecaServicoDto> pecasDto = pecasDoServico.stream()
                            .map(oficinaPeca -> new ItemPecaServicoDto(
                                    oficinaPeca.getPeca().getId(),
                                    oficinaPeca.getPeca().getDescricao(),
                                    oficinaPeca.getPeca().getFabricante(),
                                    oficinaPeca.getQuantidade()
                            ))
                            .collect(Collectors.toList());

                    return new ServicoHistoricoResponseDto(
                            oficina.getId(),
                            oficina.getDataOficina(),
                            oficina.getDescricaoProblema(),
                            oficina.getDiagnostico(),
                            oficina.getPartesAfetadas(),
                            oficina.getHorasTrabalhadas(),
                            pecasDto
                    );
                })
                // Ordena pelo mais recente ANTES de coletar
                .sorted((s1, s2) -> {
                    if (s1.getDataOficina() == null && s2.getDataOficina() == null) return 0;
                    if (s1.getDataOficina() == null) return 1; // Nulos por último
                    if (s2.getDataOficina() == null) return -1; // Nulos por último
                    return s2.getDataOficina().compareTo(s1.getDataOficina()); // DESC
                })
                .collect(Collectors.toList());

        log.info("Encontrados {} registros de serviço para o veículo ID: {}", historico.size(), veiculoId);
        return historico;
    }
    // --- Fim do Histórico ---

    // --- Método Auxiliar Privado ---
    private Oficina findOficinaByIdOrElseThrow(Long id) {
        return oficinaRepository.findById(id)
                .orElseThrow(() -> new OficinaNotFoundException("Registro de Oficina não encontrado com ID: " + id));
    }
    // --- Fim do Método Auxiliar ---

} // <<< FIM DA CLASSE OficinaServiceImpl >>>