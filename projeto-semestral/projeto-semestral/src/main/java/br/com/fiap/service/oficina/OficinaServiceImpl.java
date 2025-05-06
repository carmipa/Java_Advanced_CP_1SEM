// br/com/fiap/service/oficina/OficinaServiceImpl.java
package br.com.fiap.service.oficina;

import br.com.fiap.dto.oficina.OficinaRequestDto;
import br.com.fiap.dto.oficina.OficinaResponseDto;
import br.com.fiap.dto.oficina.ItemPecaServicoDto; // Importar
import br.com.fiap.exception.OficinaNotFoundException;
import br.com.fiap.exception.PecasNotFoundException; // Importar
import br.com.fiap.mapper.OficinaMapper;
import br.com.fiap.model.Oficina;
import br.com.fiap.model.Pecas; // Importar
import br.com.fiap.model.relacionamentos.OficinaPeca; // Importar
import br.com.fiap.repository.OficinaRepository;
import br.com.fiap.repository.PecasRepository; // Importar
import br.com.fiap.repository.relacionamentos.OficinaPecaRepository; // Importar
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OficinaServiceImpl implements OficinaService {

    private static final Logger log = LoggerFactory.getLogger(OficinaServiceImpl.class);
    private final OficinaRepository oficinaRepository;
    private final OficinaMapper oficinaMapper;
    private final PecasRepository pecasRepository; // Necessário para buscar Peças
    private final OficinaPecaRepository oficinaPecaRepository; // Necessário para salvar a junção

    @Autowired
    public OficinaServiceImpl(OficinaRepository oficinaRepository,
                              OficinaMapper oficinaMapper,
                              PecasRepository pecasRepository,
                              OficinaPecaRepository oficinaPecaRepository) {
        this.oficinaRepository = oficinaRepository;
        this.oficinaMapper = oficinaMapper;
        this.pecasRepository = pecasRepository;
        this.oficinaPecaRepository = oficinaPecaRepository;
    }

    // Métodos CRUD simples existentes (create, update, findAll, findById, deleteById)...
    // O método create existente recebe OficinaRequestDto, que não tem a lista de peças.
    // O método update existente recebe OficinaRequestDto.

    @Override
    @Transactional(readOnly = true)
    public List<OficinaResponseDto> findAll() {
        log.info("Buscando todas as oficinas");
        return oficinaRepository.findAll().stream()
                .map(oficinaMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OficinaResponseDto findById(Long id) {
        log.info("Buscando oficina por ID: {}", id);
        Oficina oficina = findOficinaByIdOrElseThrow(id);
        return oficinaMapper.toResponseDto(oficina);
    }

    @Override
    @Transactional
    public OficinaResponseDto create(OficinaRequestDto oficinaDto) {
        log.info("Criando nova oficina (diagnóstico vindo do DTO simples)");
        try {
            Oficina oficina = oficinaMapper.toEntity(oficinaDto);
            Oficina savedOficina = oficinaRepository.save(oficina);
            log.info("Oficina criada com ID: {}", savedOficina.getId());
            return oficinaMapper.toResponseDto(savedOficina);
        } catch (Exception e) {
            log.error("Erro ao criar oficina: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar oficina", e);
        }
    }
    @Override
    @Transactional
    public OficinaResponseDto update(Long id, OficinaRequestDto oficinaDto) {
        log.info("Atualizando oficina com ID: {}", id);
        Oficina existingOficina = findOficinaByIdOrElseThrow(id);
        oficinaMapper.updateEntityFromDto(oficinaDto, existingOficina);
        Oficina updatedOficina = oficinaRepository.save(existingOficina);
        log.info("Oficina atualizada com ID: {}", updatedOficina.getId());
        return oficinaMapper.toResponseDto(updatedOficina);
    }


    @Override
    @Transactional
    public void deleteById(Long id) {
        log.info("Deletando oficina com ID: {}", id);
        Oficina oficina = findOficinaByIdOrElseThrow(id);
        try {
            // Antes de deletar a oficina, é preciso remover as associações em OFP
            // Se houver cascade configurado de Oficina para OficinaPeca, isso pode ser automático
            // Mas é mais seguro limpar manualmente ou garantir que orphanRemoval=true esteja em Oficina.oficinaPecas
            oficinaPecaRepository.deleteAll(oficina.getOficinaPecas()); // Exemplo, precisa de getOficinaPecas()
            oficina.getOficinaPecas().clear(); // Limpa a coleção na entidade gerenciada

            oficinaRepository.delete(oficina);
            log.info("Oficina deletada com ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar oficina com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar oficina com ID: " + id, e);
        }
    }


    // NOVO MÉTODO IMPLEMENTADO
    @Override
    @Transactional
    public Oficina salvarOficinaComPecas(Oficina oficinaEntidade, List<ItemPecaServicoDto> pecasDto) {
        log.info("Salvando Oficina e associando peças.");
        // A entidade Oficina já deve ter os campos básicos preenchidos pelo mapper antes de chamar este método
        // Salva a Oficina primeiro para ter um ID, se for nova
        Oficina oficinaSalva = oficinaRepository.save(oficinaEntidade);

        // Processa as peças
        if (pecasDto != null && !pecasDto.isEmpty()) {
            // Limpa associações antigas se for uma atualização e quiser substituir todas as peças
            // (Para uma lógica de update mais granular, seria necessário comparar com as existentes)
            // Por simplicidade, aqui vamos assumir que para update, as peças antigas são removidas e novas são adicionadas.
            // Se oficinaSalva.getOficinaPecas() não for nulo, limpe-o.
            if (oficinaSalva.getOficinaPecas() != null) {
                oficinaPecaRepository.deleteAll(oficinaSalva.getOficinaPecas()); // Remove do banco
                oficinaSalva.getOficinaPecas().clear(); // Limpa a coleção gerenciada
            } else {
                oficinaSalva.setOficinaPecas(new ArrayList<>());
            }

            for (ItemPecaServicoDto itemPecaDto : pecasDto) {
                Pecas peca = pecasRepository.findById(itemPecaDto.getPecaId())
                        .orElseThrow(() -> new PecasNotFoundException("Peça não encontrada com ID: " + itemPecaDto.getPecaId()));

                OficinaPeca oficinaPeca = new OficinaPeca();
                oficinaPeca.setOficina(oficinaSalva);
                oficinaPeca.setPeca(peca);
                oficinaPeca.setQuantidade(itemPecaDto.getQuantidade());

                oficinaSalva.getOficinaPecas().add(oficinaPecaRepository.save(oficinaPeca));
            }
        }
        // O save final da oficinaSalva não é estritamente necessário aqui se o cascade estiver configurado
        // e a coleção for gerenciada, mas pode ser feito para garantir.
        return oficinaRepository.save(oficinaSalva);
    }

    // NOVO MÉTODO IMPLEMENTADO (para o fluxo de atualização do orçamento)
    @Override
    @Transactional
    public Oficina atualizarOficinaComPecas(Long oficinaId, Oficina oficinaParcialmenteMapeada, List<ItemPecaServicoDto> pecasDto) {
        log.info("Atualizando Oficina ID {} e associando peças.", oficinaId);
        Oficina oficinaExistente = findOficinaByIdOrElseThrow(oficinaId);

        // Atualiza campos da Oficina (ex: descricaoProblema, diagnostico, etc.)
        // O mapper já deve ter feito isso na entidade 'oficinaParcialmenteMapeada',
        // então transferimos os valores para 'oficinaExistente'
        oficinaExistente.setDataOficina(oficinaParcialmenteMapeada.getDataOficina());
        oficinaExistente.setDescricaoProblema(oficinaParcialmenteMapeada.getDescricaoProblema());
        oficinaExistente.setDiagnostico(oficinaParcialmenteMapeada.getDiagnostico());
        oficinaExistente.setPartesAfetadas(oficinaParcialmenteMapeada.getPartesAfetadas());
        oficinaExistente.setHorasTrabalhadas(oficinaParcialmenteMapeada.getHorasTrabalhadas());
        // ... outros campos da Oficina que podem ser atualizados

        // Gerencia as peças: remove antigas, adiciona novas/atualizadas.
        // Uma abordagem simples é remover todas as OficinaPeca antigas e adicionar as novas.
        // Se a lista oficinaExistente.getOficinaPecas() não for nula, limpe-a
        if (oficinaExistente.getOficinaPecas() != null) {
            oficinaPecaRepository.deleteAllInBatch(oficinaExistente.getOficinaPecas()); // Mais eficiente para bulk delete
            oficinaExistente.getOficinaPecas().clear();
        } else {
            oficinaExistente.setOficinaPecas(new ArrayList<>());
        }

        if (pecasDto != null && !pecasDto.isEmpty()) {
            for (ItemPecaServicoDto itemPecaDto : pecasDto) {
                Pecas peca = pecasRepository.findById(itemPecaDto.getPecaId())
                        .orElseThrow(() -> new PecasNotFoundException("Peça não encontrada com ID: " + itemPecaDto.getPecaId()));

                OficinaPeca novaOficinaPeca = new OficinaPeca();
                novaOficinaPeca.setOficina(oficinaExistente);
                novaOficinaPeca.setPeca(peca);
                novaOficinaPeca.setQuantidade(itemPecaDto.getQuantidade());
                oficinaExistente.getOficinaPecas().add(novaOficinaPeca); // Adiciona à coleção gerenciada
            }
        }
        // O save da oficinaExistente vai persistir as novas OficinaPeca devido ao cascade,
        // e as antigas já foram removidas.
        return oficinaRepository.save(oficinaExistente);
    }


    private Oficina findOficinaByIdOrElseThrow(Long id) {
        return oficinaRepository.findById(id)
                .orElseThrow(() -> new OficinaNotFoundException("Registro de Oficina não encontrado com ID: " + id));
    }
}