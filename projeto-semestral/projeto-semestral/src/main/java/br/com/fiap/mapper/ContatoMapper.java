// --- src/main/java/br/com/fiap/mapper/ContatoMapper.java ---
package br.com.fiap.mapper;

import br.com.fiap.dto.contato.ContatoRequestDto;
import br.com.fiap.dto.contato.ContatoResponseDto;
import br.com.fiap.model.Contato;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ContatoMapper {

    @Mapping(target = "codigo", ignore = true) // Ignora ID na criação
    Contato toEntity(ContatoRequestDto dto);

    ContatoResponseDto toResponseDto(Contato entity);

    @Mapping(target = "codigo", ignore = true) // Ignora ID na atualização
    void updateEntityFromDto(ContatoRequestDto dto, @MappingTarget Contato entity);
}