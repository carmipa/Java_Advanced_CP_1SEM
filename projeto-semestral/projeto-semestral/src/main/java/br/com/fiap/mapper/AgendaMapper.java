// --- src/main/java/br/com/fiap/mapper/AgendaMapper.java ---
// (Já existe no seu código, apenas garantindo que está correto)
package br.com.fiap.mapper;

import br.com.fiap.dto.agenda.AgendaRequestDto;
import br.com.fiap.dto.agenda.AgendaResponseDto;
import br.com.fiap.model.Agenda;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AgendaMapper {

    AgendaMapper INSTANCE = Mappers.getMapper(AgendaMapper.class);

    // Ignora o 'id' ao mapear do DTO para a Entidade (será gerado pelo banco)
    // Mapeia 'observacao' do DTO para 'observacao' da Entidade
    @Mapping(target = "id", ignore = true)
    Agenda toEntity(AgendaRequestDto dto);

    // Mapeia 'id' e 'observacao' da Entidade para o DTO de resposta
    AgendaResponseDto toResponseDto(Agenda entity);

    // Ignora o 'id' ao atualizar a Entidade a partir do DTO
    // Mapeia 'observacao' do DTO para 'observacao' da Entidade existente
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(AgendaRequestDto dto, @MappingTarget Agenda entity);
}