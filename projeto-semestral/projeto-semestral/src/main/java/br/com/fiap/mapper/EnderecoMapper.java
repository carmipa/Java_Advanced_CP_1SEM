// --- src/main/java/br/com/fiap/mapper/EnderecoMapper.java ---
package br.com.fiap.mapper;

import br.com.fiap.dto.endereco.EnderecoRequestDto;
import br.com.fiap.dto.endereco.EnderecoResponseDto;
import br.com.fiap.model.Endereco;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EnderecoMapper {

    @Mapping(target = "codigo", ignore = true) // Ignora ID na criação
    Endereco toEntity(EnderecoRequestDto dto);

    EnderecoResponseDto toResponseDto(Endereco entity);

    @Mapping(target = "codigo", ignore = true) // Ignora ID na atualização
    void updateEntityFromDto(EnderecoRequestDto dto, @MappingTarget Endereco entity);
}