// --- src/main/java/br/com/fiap/mapper/OficinaMapper.java ---
package br.com.fiap.mapper;

import br.com.fiap.dto.oficina.OficinaRequestDto;
import br.com.fiap.dto.oficina.OficinaResponseDto;
import br.com.fiap.model.Oficina;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface OficinaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "agendaOficinas", ignore = true) // Ignora coleções de relacionamentos
    @Mapping(target = "oficinaVeiculos", ignore = true)
    @Mapping(target = "oficinaPecas", ignore = true)
    @Mapping(target = "oficinaOrcamentos", ignore = true)
    Oficina toEntity(OficinaRequestDto dto);

    OficinaResponseDto toResponseDto(Oficina entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "agendaOficinas", ignore = true)
    @Mapping(target = "oficinaVeiculos", ignore = true)
    @Mapping(target = "oficinaPecas", ignore = true)
    @Mapping(target = "oficinaOrcamentos", ignore = true)
    void updateEntityFromDto(OficinaRequestDto dto, @MappingTarget Oficina entity);
}