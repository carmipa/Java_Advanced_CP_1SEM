// br/com/fiap/service/orcamento/OrcamentoServiceImpl.java
package br.com.fiap.service.orcamento;

import br.com.fiap.dto.orcamento.OrcamentoComServicoRequestDto;
import br.com.fiap.dto.orcamento.OrcamentoResponseDto;
import br.com.fiap.dto.orcamento.OrcamentoRequestDto;
import br.com.fiap.exception.*;
import br.com.fiap.mapper.OrcamentoMapper;
import br.com.fiap.mapper.OficinaMapper; // <<< Import que estava faltando e foi adicionado
// Se ClienteMapper e VeiculoMapper não forem usados diretamente aqui, podem ser removidos dos imports desta classe.
import br.com.fiap.model.*;
import br.com.fiap.model.relacionamentos.*;
import br.com.fiap.repository.*;
import br.com.fiap.repository.relacionamentos.*;
import br.com.fiap.service.oficina.OficinaService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrcamentoServiceImpl implements OrcamentoService {

    private static final Logger log = LoggerFactory.getLogger(OrcamentoServiceImpl.class);

    private final OrcamentoRepository orcamentoRepository;
    private final OrcamentoMapper orcamentoMapper;
    private final OficinaMapper oficinaMapper; // Agora o import existe
    private final OficinaService oficinaService;
    private final PecasRepository pecasRepository;

    private final OficinaOrcamentoRepository oficinaOrcamentoRepository;
    private final ClienteOrcamentoRepository clienteOrcamentoRepository;
    private final ClientesRepository clientesRepository;
    private final VeiculoRepository veiculoRepository;
    private final OficinaVeiculoRepository oficinaVeiculoRepository;

    @Autowired
    public OrcamentoServiceImpl(OrcamentoRepository orcamentoRepository,
                                OrcamentoMapper orcamentoMapper,
                                OficinaMapper oficinaMapper, // Injetado
                                OficinaService oficinaService,
                                PecasRepository pecasRepository,
                                OficinaOrcamentoRepository oficinaOrcamentoRepository,
                                ClienteOrcamentoRepository clienteOrcamentoRepository,
                                ClientesRepository clientesRepository,
                                VeiculoRepository veiculoRepository,
                                OficinaVeiculoRepository oficinaVeiculoRepository) {
        this.orcamentoRepository = orcamentoRepository;
        this.orcamentoMapper = orcamentoMapper;
        this.oficinaMapper = oficinaMapper; // Atribuído
        this.oficinaService = oficinaService;
        this.pecasRepository = pecasRepository;
        this.oficinaOrcamentoRepository = oficinaOrcamentoRepository;
        this.clienteOrcamentoRepository = clienteOrcamentoRepository;
        this.clientesRepository = clientesRepository;
        this.veiculoRepository = veiculoRepository;
        this.oficinaVeiculoRepository = oficinaVeiculoRepository;
    }

    // ... (Restante do código da classe OrcamentoServiceImpl como na resposta anterior) ...
    @Override
    @Transactional
    public OrcamentoResponseDto registrarServicoComOrcamento(OrcamentoComServicoRequestDto dto) {
        log.info("Registrando novo serviço com orçamento.");

        Oficina oficinaEntidade;
        if (dto.getOficinaExistenteId() != null) {
            log.info("Atualizando oficina existente ID: {}", dto.getOficinaExistenteId());
            Oficina oficinaParcialmenteMapeadaComDadosDoDto = oficinaMapper.fromOrcamentoComServicoDto(dto);
            oficinaEntidade = oficinaService.atualizarOficinaComPecas(
                    dto.getOficinaExistenteId(),
                    oficinaParcialmenteMapeadaComDadosDoDto,
                    dto.getPecasUtilizadas()
            );
        } else {
            log.info("Criando nova oficina.");
            Oficina oficinaParcialmenteMapeadaComDadosDoDto = oficinaMapper.fromOrcamentoComServicoDto(dto);
            oficinaEntidade = oficinaService.salvarOficinaComPecas(
                    oficinaParcialmenteMapeadaComDadosDoDto,
                    dto.getPecasUtilizadas()
            );
        }
        log.info("Oficina ID {} processada com {} peças.", oficinaEntidade.getId(), oficinaEntidade.getOficinaPecas() != null ? oficinaEntidade.getOficinaPecas().size() : 0);

        if (dto.getVeiculoId() != null && oficinaEntidade.getId() != null) {
            Veiculo veiculo = veiculoRepository.findById(dto.getVeiculoId())
                    .orElseThrow(() -> new VeiculoNotFoundException("Veículo não encontrado com ID: " + dto.getVeiculoId()));

            boolean associacaoExiste = oficinaEntidade.getOficinaVeiculos() != null &&
                    oficinaEntidade.getOficinaVeiculos().stream()
                            .anyMatch(ov -> ov.getVeiculo().getId().equals(dto.getVeiculoId()));

            if (!associacaoExiste) {
                OficinaVeiculo oficinaVeiculo = new OficinaVeiculo();
                oficinaVeiculo.setOficina(oficinaEntidade);
                oficinaVeiculo.setVeiculo(veiculo);
                oficinaVeiculoRepository.save(oficinaVeiculo);
                if (oficinaEntidade.getOficinaVeiculos() == null) {
                    oficinaEntidade.setOficinaVeiculos(new ArrayList<>());
                }
                oficinaEntidade.getOficinaVeiculos().add(oficinaVeiculo);
                log.info("Veículo ID {} associado à Oficina ID {}.", dto.getVeiculoId(), oficinaEntidade.getId());
            }
        }

        BigDecimal totalCustoPecas = BigDecimal.ZERO;
        if (oficinaEntidade.getOficinaPecas() != null) {
            for (OficinaPeca op : oficinaEntidade.getOficinaPecas()) {
                if (op.getPeca() != null && op.getPeca().getPreco() != null && op.getQuantidade() != null) {
                    BigDecimal precoPeca = op.getPeca().getPreco();
                    BigDecimal quantidadePeca = BigDecimal.valueOf(op.getQuantidade());
                    totalCustoPecas = totalCustoPecas.add(precoPeca.multiply(quantidadePeca));
                } else {
                    log.warn("Peça ou preço da peça nulo para OficinaPeca ID: {} na Oficina ID: {}", op.getId(), oficinaEntidade.getId());
                }
            }
        }
        log.info("Custo total das peças calculado: {}", totalCustoPecas);

        Orcamento orcamento = orcamentoMapper.fromOrcamentoComServicoDto(dto);

        BigDecimal custoMaoDeObraHoras = BigDecimal.ZERO;
        if (orcamento.getValorHora() != null && orcamento.getQuantidadeHoras() != null && orcamento.getQuantidadeHoras() >= 0) {
            custoMaoDeObraHoras = orcamento.getValorHora().multiply(BigDecimal.valueOf(orcamento.getQuantidadeHoras()));
        }
        BigDecimal custoMaoDeObraTotal = (orcamento.getMaoDeObra() != null ? orcamento.getMaoDeObra() : BigDecimal.ZERO).add(custoMaoDeObraHoras);
        log.info("Custo total da mão de obra calculado: {}", custoMaoDeObraTotal);

        BigDecimal valorTotalOrcamento = custoMaoDeObraTotal.add(totalCustoPecas);
        orcamento.setValorTotal(valorTotalOrcamento.setScale(2, RoundingMode.HALF_UP));
        log.info("Valor total do orçamento calculado: {}", orcamento.getValorTotal());

        Orcamento orcamentoSalvo = orcamentoRepository.save(orcamento);
        log.info("Orçamento salvo com ID: {}", orcamentoSalvo.getId());

        OficinaOrcamento oficinaOrcamento = new OficinaOrcamento();
        oficinaOrcamento.setOficina(oficinaEntidade);
        oficinaOrcamento.setOrcamento(orcamentoSalvo);
        oficinaOrcamentoRepository.save(oficinaOrcamento);
        log.info("Ligação Oficina-Orçamento criada: Oficina ID {}, Orçamento ID {}", oficinaEntidade.getId(), orcamentoSalvo.getId());

        if (dto.getClienteId() != null && dto.getClienteEnderecoId() != null) {
            ClienteId clientePk = new ClienteId(dto.getClienteId(), dto.getClienteEnderecoId());
            Clientes cliente = clientesRepository.findById(clientePk)
                    .orElseThrow(() -> new ClientesNotFoundException("Cliente não encontrado com ID: " + clientePk));

            ClienteOrcamento clienteOrcamento = new ClienteOrcamento();
            clienteOrcamento.setCliente(cliente);
            clienteOrcamento.setOrcamento(orcamentoSalvo);
            clienteOrcamentoRepository.save(clienteOrcamento);
            log.info("Ligação Cliente-Orçamento criada: Cliente ID {}, Orçamento ID {}", clientePk, orcamentoSalvo.getId());
        }

        return orcamentoMapper.toResponseDto(orcamentoSalvo);
    }

    @Override
    @Transactional
    public OrcamentoResponseDto create(OrcamentoRequestDto dto) {
        log.info("Criando novo orçamento (simples)");
        Orcamento orcamento = orcamentoMapper.toEntity(dto);

        BigDecimal maoDeObra = orcamento.getMaoDeObra() != null ? orcamento.getMaoDeObra() : BigDecimal.ZERO;
        BigDecimal valorHora = orcamento.getValorHora() != null ? orcamento.getValorHora() : BigDecimal.ZERO;
        Integer qtdHoras = orcamento.getQuantidadeHoras() != null ? orcamento.getQuantidadeHoras() : 0;

        BigDecimal custoHoras = valorHora.multiply(BigDecimal.valueOf(qtdHoras));
        orcamento.setValorTotal(maoDeObra.add(custoHoras).setScale(2, RoundingMode.HALF_UP));

        Orcamento savedOrcamento = orcamentoRepository.save(orcamento);
        log.info("Orçamento (simples) criado com ID: {}", savedOrcamento.getId());
        return orcamentoMapper.toResponseDto(savedOrcamento);
    }

    @Override
    @Transactional
    public OrcamentoResponseDto update(Long id, OrcamentoRequestDto dto) {
        log.info("Atualizando orçamento (simples) com ID: {}", id);
        Orcamento existingOrcamento = findOrcamentoByIdOrElseThrow(id);

        orcamentoMapper.updateEntityFromDto(dto, existingOrcamento);

        BigDecimal maoDeObra = existingOrcamento.getMaoDeObra() != null ? existingOrcamento.getMaoDeObra() : BigDecimal.ZERO;
        BigDecimal valorHora = existingOrcamento.getValorHora() != null ? existingOrcamento.getValorHora() : BigDecimal.ZERO;
        Integer qtdHoras = existingOrcamento.getQuantidadeHoras() != null ? existingOrcamento.getQuantidadeHoras() : 0;

        BigDecimal custoHoras = valorHora.multiply(BigDecimal.valueOf(qtdHoras));
        existingOrcamento.setValorTotal(maoDeObra.add(custoHoras).setScale(2, RoundingMode.HALF_UP));

        Orcamento updatedOrcamento = orcamentoRepository.save(existingOrcamento);
        log.info("Orçamento (simples) atualizado com ID: {}", updatedOrcamento.getId());
        return orcamentoMapper.toResponseDto(updatedOrcamento);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrcamentoResponseDto> findAll() {
        log.info("Buscando todos os orçamentos (simples)");
        return orcamentoRepository.findAll().stream()
                .map(orcamentoMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrcamentoResponseDto findById(Long id) {
        log.info("Buscando orçamento por ID: {}", id);
        Orcamento orcamento = findOrcamentoByIdOrElseThrow(id);
        return orcamentoMapper.toResponseDto(orcamento);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        log.info("Deletando orçamento com ID: {}", id);
        Orcamento orcamento = findOrcamentoByIdOrElseThrow(id);

        log.warn("Lógica de remoção de associações (OFO, CO, PAO) para o orçamento ID {} precisa ser implementada antes da exclusão final.", id);

        // Exemplo de como remover associações em OFO (OficinaOrcamento)
        // Assumindo que você tenha um método no OficinaOrcamentoRepository para buscar por orcamentoId
        List<OficinaOrcamento> oficinaOrcamentos = oficinaOrcamentoRepository.findByOrcamentoId(id); // Precisa existir esse método no repo
        if (oficinaOrcamentos != null && !oficinaOrcamentos.isEmpty()) {
            oficinaOrcamentoRepository.deleteAll(oficinaOrcamentos);
            log.info("Associações Oficina-Orçamento removidas para Orçamento ID: {}", id);
        }

        List<ClienteOrcamento> clienteOrcamentos = clienteOrcamentoRepository.findByOrcamentoId(id); // Precisa existir esse método no repo
        if (clienteOrcamentos != null && !clienteOrcamentos.isEmpty()) {
            clienteOrcamentoRepository.deleteAll(clienteOrcamentos);
            log.info("Associações Cliente-Orçamento removidas para Orçamento ID: {}", id);
        }
        // Adicionar lógica para PagamentoOrcamentoRepository.deleteByOrcamentoId(id); se aplicável

        try {
            orcamentoRepository.delete(orcamento);
            log.info("Orçamento deletado com ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar orçamento com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar orçamento. Pode estar associado a outros registros. ID: " + id, e);
        }
    }

    private Orcamento findOrcamentoByIdOrElseThrow(Long id) {
        return orcamentoRepository.findById(id)
                .orElseThrow(() -> new OrcamentoNotFoundException("Orçamento não encontrado com ID: " + id));
    }
}