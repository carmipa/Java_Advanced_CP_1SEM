// --- Arquivo: src/main/java/br/com/fiap/service/relatorio/cliente/RelatorioClienteServiceImpl.java ---
package br.com.fiap.service.relatorio.cliente;

// --- Imports Verificados e Completos ---
import br.com.fiap.dto.relatorio.ClienteRelatorioCompletoDTO;
import br.com.fiap.dto.relatorio.ClienteRelatorioCompletoDTO.*; // Para Sub-DTOs aninhados
import br.com.fiap.dto.cliente.ClienteResponseDto; // Import do DTO Cliente
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.dto.orcamento.OrcamentoResponseDto; // <<< IMPORT ESSENCIAL
import br.com.fiap.dto.pagamento.PagamentoResponseDto; // <<< IMPORT ESSENCIAL
// Importe outros DTOs usados se necessário (AgendaSimplificadoDTO, OficinaServicoDTO, etc., se não forem aninhados)

import br.com.fiap.exception.ClientesNotFoundException;
import br.com.fiap.mapper.*;
import br.com.fiap.model.*;
import br.com.fiap.model.relacionamentos.*;
import br.com.fiap.repository.*;
import br.com.fiap.repository.relacionamentos.*;
import br.com.fiap.repository.specification.ClienteSpecification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
// ---------------------------------------

@Service
public class RelatorioClienteServiceImpl implements RelatorioClienteService {

    private static final Logger log = LoggerFactory.getLogger(RelatorioClienteServiceImpl.class);

    // --- Injeções (sem alterações) ---
    private final ClientesRepository clienteRepository;
    private final VeiculoRepository veiculoRepository;
    private final AgendaRepository agendaRepository;
    private final OficinaRepository oficinaRepository;
    private final PecasRepository pecasRepository;
    private final OrcamentoRepository orcamentoRepository;
    private final PagamentoRepository pagamentoRepository;
    private final ClienteVeiculoRepository clienteVeiculoRepository;
    private final AgendaVeiculoRepository agendaVeiculoRepository;
    private final OficinaVeiculoRepository oficinaVeiculoRepository;
    private final OficinaPecaRepository oficinaPecaRepository;
    private final ClienteOrcamentoRepository clienteOrcamentoRepository;
    private final ClientePagamentoRepository clientePagamentoRepository;
    private final ClienteMapper clienteMapper;
    private final VeiculoMapper veiculoMapper;
    private final AgendaMapper agendaMapper;
    private final OficinaMapper oficinaMapper;
    private final PecasMapper pecasMapper;
    private final OrcamentoMapper orcamentoMapper;
    private final PagamentoMapper pagamentoMapper;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Autowired
    public RelatorioClienteServiceImpl(
            ClientesRepository clienteRepository, VeiculoRepository veiculoRepository,
            AgendaRepository agendaRepository, OficinaRepository oficinaRepository,
            PecasRepository pecasRepository, OrcamentoRepository orcamentoRepository,
            PagamentoRepository pagamentoRepository,
            ClienteVeiculoRepository clienteVeiculoRepository,
            AgendaVeiculoRepository agendaVeiculoRepository,
            OficinaVeiculoRepository oficinaVeiculoRepository,
            OficinaPecaRepository oficinaPecaRepository,
            ClienteOrcamentoRepository clienteOrcamentoRepository,
            ClientePagamentoRepository clientePagamentoRepository,
            ClienteMapper clienteMapper, VeiculoMapper veiculoMapper,
            AgendaMapper agendaMapper, OficinaMapper oficinaMapper,
            PecasMapper pecasMapper, OrcamentoMapper orcamentoMapper,
            PagamentoMapper pagamentoMapper) {
        // ... atribuições do construtor ...
        this.clienteRepository = clienteRepository;
        this.veiculoRepository = veiculoRepository;
        this.agendaRepository = agendaRepository;
        this.oficinaRepository = oficinaRepository;
        this.pecasRepository = pecasRepository;
        this.orcamentoRepository = orcamentoRepository;
        this.pagamentoRepository = pagamentoRepository;
        this.clienteVeiculoRepository = clienteVeiculoRepository;
        this.agendaVeiculoRepository = agendaVeiculoRepository;
        this.oficinaVeiculoRepository = oficinaVeiculoRepository;
        this.oficinaPecaRepository = oficinaPecaRepository;
        this.clienteOrcamentoRepository = clienteOrcamentoRepository;
        this.clientePagamentoRepository = clientePagamentoRepository;
        this.clienteMapper = clienteMapper;
        this.veiculoMapper = veiculoMapper;
        this.agendaMapper = agendaMapper;
        this.oficinaMapper = oficinaMapper;
        this.pecasMapper = pecasMapper;
        this.orcamentoMapper = orcamentoMapper;
        this.pagamentoMapper = pagamentoMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteRelatorioCompletoDTO getRelatorioCompletoCliente(String tipoBusca, String valorBusca) {
        log.info("Gerando relatório completo para cliente: tipo={}, valor={}", tipoBusca, valorBusca);

        // 1. Encontrar o Cliente (sem alterações)
        Specification<Clientes> spec = Specification.where(null);
        if ("id".equalsIgnoreCase(tipoBusca)) {
            try { Long idCli = Long.parseLong(valorBusca); spec = spec.and(ClienteSpecification.idCliEquals(idCli)); }
            catch (NumberFormatException e) { throw new IllegalArgumentException("ID do cliente inválido: " + valorBusca); }
        } else if ("documento".equalsIgnoreCase(tipoBusca)) {
            spec = spec.and(ClienteSpecification.numeroDocumentoEquals(valorBusca));
        } else { throw new IllegalArgumentException("Tipo de busca inválido: " + tipoBusca); }

        Optional<Clientes> clienteOpt = clienteRepository.findAll(spec).stream().findFirst();
        if (clienteOpt.isEmpty()) { throw new ClientesNotFoundException("Cliente não encontrado para os critérios fornecidos."); }
        Clientes cliente = clienteOpt.get();
        ClienteId clienteId = cliente.getId();

        // 2. Mapear Dados Básicos (sem alterações)
        ClienteRelatorioCompletoDTO relatorio = new ClienteRelatorioCompletoDTO();
        relatorio.setCliente(clienteMapper.toResponseDto(cliente));

        // 3. Buscar Veículos Associados (Usa o método correto do repo)
        List<ClienteVeiculo> clienteVeiculos = clienteVeiculoRepository.findByCliente_Id(clienteId); // CORRIGIDO
        List<VeiculoResponseDto> veiculosDto = clienteVeiculos.stream()
                .map(cv -> veiculoMapper.toResponseDto(cv.getVeiculo()))
                .collect(Collectors.toList());
        relatorio.setVeiculos(veiculosDto);
        List<Long> veiculoIds = clienteVeiculos.stream().map(cv -> cv.getVeiculo().getId()).collect(Collectors.toList());

        // 4. Buscar Agendamentos (Usa o método correto do repo e ordena antes)
        if (!veiculoIds.isEmpty()) {
            List<AgendaVeiculo> agendaVeiculos = agendaVeiculoRepository.findByVeiculoIdIn(veiculoIds); // CORRIGIDO
            List<AgendaSimplificadoDTO> agendamentosDto = agendaVeiculos.stream()
                    .sorted(Comparator.comparing( (AgendaVeiculo av) -> av.getAgenda().getDataAgendamento(), Comparator.nullsLast(Comparator.reverseOrder()) ))
                    .map(av -> {
                        AgendaSimplificadoDTO dto = new AgendaSimplificadoDTO();
                        dto.setId(av.getAgenda().getId());
                        dto.setDataAgendamento(av.getAgenda().getDataAgendamento() != null ? av.getAgenda().getDataAgendamento().format(dateFormatter) : null);
                        dto.setObservacao(av.getAgenda().getObservacao());
                        dto.setVeiculoPlaca(av.getVeiculo().getPlaca());
                        return dto;
                    })
                    .collect(Collectors.toList());
            relatorio.setAgendamentos(agendamentosDto);
            relatorio.setTotalAgendamentos(agendamentosDto.size());
        } else {
            relatorio.setAgendamentos(Collections.emptyList());
            relatorio.setTotalAgendamentos(0);
        }

        // 5. Buscar Serviços de Oficina e Peças (Usa os métodos corretos dos repos e ordena antes)
        if (!veiculoIds.isEmpty()) {
            List<OficinaVeiculo> oficinaVeiculos = oficinaVeiculoRepository.findByVeiculoIdIn(veiculoIds); // CORRIGIDO
            List<OficinaServicoDTO> servicosDto = oficinaVeiculos.stream()
                    .sorted(Comparator.comparing( (OficinaVeiculo ov) -> ov.getOficina().getDataOficina(), Comparator.nullsLast(Comparator.reverseOrder()) ))
                    .map(ov -> {
                        Oficina oficina = ov.getOficina();
                        OficinaServicoDTO dto = new OficinaServicoDTO();
                        dto.setIdOficina(oficina.getId());
                        dto.setDataOficina(oficina.getDataOficina() != null ? oficina.getDataOficina().format(dateFormatter) : null);
                        dto.setDescricaoProblema(oficina.getDescricaoProblema());
                        dto.setDiagnostico(oficina.getDiagnostico());
                        dto.setPartesAfetadas(oficina.getPartesAfetadas());
                        dto.setHorasTrabalhadas(oficina.getHorasTrabalhadas());
                        dto.setVeiculoPlaca(ov.getVeiculo().getPlaca());

                        List<OficinaPeca> oficinaPecas = oficinaPecaRepository.findByOficinaId(oficina.getId()); // CORRIGIDO
                        List<PecaUtilizadaDTO> pecasDto = oficinaPecas.stream()
                                .map(op -> {
                                    Pecas peca = op.getPeca();
                                    PecaUtilizadaDTO pecaDto = new PecaUtilizadaDTO();
                                    pecaDto.setIdPeca(peca.getId());
                                    pecaDto.setDescricaoPeca(peca.getDescricao());
                                    pecaDto.setFabricante(peca.getFabricante());
                                    return pecaDto;
                                })
                                .collect(Collectors.toList());
                        dto.setPecasUtilizadas(pecasDto);
                        return dto;
                    })
                    .collect(Collectors.toList());
            relatorio.setServicosOficina(servicosDto);
        } else {
            relatorio.setServicosOficina(Collections.emptyList());
        }

        // 6. Buscar Orçamentos (Já estava correto, apenas garantindo import)
        List<ClienteOrcamento> clienteOrcamentos = clienteOrcamentoRepository.findByCliente_Id(clienteId);
        List<OrcamentoResponseDto> orcamentosDto = clienteOrcamentos.stream()
                .map(co -> orcamentoMapper.toResponseDto(co.getOrcamento()))
                .sorted(Comparator.comparing( OrcamentoResponseDto::getDataOrcamento, Comparator.nullsLast(Comparator.reverseOrder()) ))
                .collect(Collectors.toList());
        relatorio.setOrcamentos(orcamentosDto);

        // 7. Buscar Pagamentos (Já estava correto, apenas garantindo import)
        List<ClientePagamento> clientePagamentos = clientePagamentoRepository.findByCliente_Id(clienteId);
        List<PagamentoResponseDto> pagamentosDto = clientePagamentos.stream()
                .map(cp -> pagamentoMapper.toResponseDto(cp.getPagamento()))
                .sorted(Comparator.comparing( PagamentoResponseDto::getDataPagamento, Comparator.nullsLast(Comparator.reverseOrder()) ))
                .collect(Collectors.toList());
        relatorio.setPagamentos(pagamentosDto);

        log.info("Relatório completo gerado com sucesso para cliente ID: {}", clienteId);
        return relatorio;
    }
}