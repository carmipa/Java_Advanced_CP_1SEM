// br/com/fiap/mapper/OrcamentoMapper.java
package br.com.fiap.mapper;

import br.com.fiap.dto.orcamento.OrcamentoRequestDto; // Usado para CRUD simples de Orcamento
import br.com.fiap.dto.orcamento.OrcamentoResponseDto;
import br.com.fiap.dto.orcamento.OrcamentoComServicoRequestDto; // Novo DTO
import br.com.fiap.model.Orcamento;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface OrcamentoMapper {

    @Mappings({
            @Mapping(target = "id", ignore = true),
            // Mapeia os campos correspondentes do DTO complexo para a entidade Orcamento
            @Mapping(source = "dataOrcamento", target = "dataOrcamento"),
            @Mapping(source = "valorMaoDeObraAdicional", target = "maoDeObra"),
            @Mapping(source = "valorHoraOrcamento", target = "valorHora"),
            @Mapping(source = "quantidadeHorasOrcamento", target = "quantidadeHoras"),
            @Mapping(target = "valorTotal", ignore = true), // Calculado no serviço
            @Mapping(target = "clienteOrcamentos", ignore = true),
            @Mapping(target = "oficinaOrcamentos", ignore = true), // Será preenchido no serviço
            @Mapping(target = "pagamentoOrcamentos", ignore = true)
    })
    Orcamento fromOrcamentoComServicoDto(OrcamentoComServicoRequestDto dto);

    // Métodos existentes para CRUD simples de Orcamento (se houver)
    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "clienteOrcamentos", ignore = true),
            @Mapping(target = "oficinaOrcamentos", ignore = true),
            @Mapping(target = "pagamentoOrcamentos", ignore = true)
    })
    Orcamento toEntity(OrcamentoRequestDto dto); // Para CRUD simples de orçamento

    OrcamentoResponseDto toResponseDto(Orcamento entity);

    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "clienteOrcamentos", ignore = true),
            @Mapping(target = "oficinaOrcamentos", ignore = true),
            @Mapping(target = "pagamentoOrcamentos", ignore = true)
    })
    void updateEntityFromDto(OrcamentoRequestDto dto, @MappingTarget Orcamento entity); // Para CRUD simples

    // Novo método para atualizar a partir do DTO complexo
    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(source = "dataOrcamento", target = "dataOrcamento"),
            @Mapping(source = "valorMaoDeObraAdicional", target = "maoDeObra"),
            @Mapping(source = "valorHoraOrcamento", target = "valorHora"),
            @Mapping(source = "quantidadeHorasOrcamento", target = "quantidadeHoras"),
            @Mapping(target = "valorTotal", ignore = true),
            @Mapping(target = "clienteOrcamentos", ignore = true),
            @Mapping(target = "oficinaOrcamentos", ignore = true),
            @Mapping(target = "pagamentoOrcamentos", ignore = true)
    })
    void updateOrcamentoFromOrcamentoComServicoDto(OrcamentoComServicoRequestDto dto, @MappingTarget Orcamento entity);
}