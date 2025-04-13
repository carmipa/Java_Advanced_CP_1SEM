// --- src/main/java/br/com/fiap/mapper/OrcamentoMapper.java ---
package br.com.fiap.mapper;

import br.com.fiap.dto.orcamento.OrcamentoRequestDto;
import br.com.fiap.dto.orcamento.OrcamentoResponseDto;
import br.com.fiap.model.Orcamento;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface OrcamentoMapper {

    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "clienteOrcamentos", ignore = true), // Ignora relacionamentos
            @Mapping(target = "oficinaOrcamentos", ignore = true),
            @Mapping(target = "pagamentoOrcamentos", ignore = true)
    })
    Orcamento toEntity(OrcamentoRequestDto dto);

    OrcamentoResponseDto toResponseDto(Orcamento entity);

    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "clienteOrcamentos", ignore = true),
            @Mapping(target = "oficinaOrcamentos", ignore = true),
            @Mapping(target = "pagamentoOrcamentos", ignore = true)
    })
    void updateEntityFromDto(OrcamentoRequestDto dto, @MappingTarget Orcamento entity);
}