// --- src/main/java/br/com/fiap/mapper/VeiculoMapper.java ---
package br.com.fiap.mapper;

import br.com.fiap.dto.veiculo.VeiculoRequestDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.model.Veiculo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface VeiculoMapper {

    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "agendaVeiculos", ignore = true), // Ignora relacionamentos
            @Mapping(target = "clienteVeiculos", ignore = true),
            @Mapping(target = "oficinaVeiculos", ignore = true),
            @Mapping(target = "pecaVeiculos", ignore = true)
    })
    Veiculo toEntity(VeiculoRequestDto dto);

    VeiculoResponseDto toResponseDto(Veiculo entity);

    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "agendaVeiculos", ignore = true),
            @Mapping(target = "clienteVeiculos", ignore = true),
            @Mapping(target = "oficinaVeiculos", ignore = true),
            @Mapping(target = "pecaVeiculos", ignore = true)
    })
    void updateEntityFromDto(VeiculoRequestDto dto, @MappingTarget Veiculo entity);
}