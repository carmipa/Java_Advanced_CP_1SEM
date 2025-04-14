// --- src/main/java/br/com/fiap/mapper/PecasMapper.java ---
package br.com.fiap.mapper;

import br.com.fiap.dto.pecas.PecasRequestDto;
import br.com.fiap.dto.pecas.PecasResponseDto;
import br.com.fiap.model.Pecas;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface PecasMapper {

    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "oficinaPecas", ignore = true), // Ignora relacionamentos
            @Mapping(target = "pecaVeiculos", ignore = true)
    })
    Pecas toEntity(PecasRequestDto dto);

    PecasResponseDto toResponseDto(Pecas entity);

    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "oficinaPecas", ignore = true),
            @Mapping(target = "pecaVeiculos", ignore = true)
    })
    void updateEntityFromDto(PecasRequestDto dto, @MappingTarget Pecas entity);
}