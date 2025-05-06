package br.com.fiap.mapper;

import br.com.fiap.dto.agenda.AgendaRequestDto;
import br.com.fiap.dto.agenda.AgendaResponseDto;
import br.com.fiap.model.Agenda;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
// import org.mapstruct.factory.Mappers; // Remova se usar componentModel="spring"

@Mapper(componentModel = "spring") // Usa injeção do Spring
public interface AgendaMapper {

    // AgendaMapper INSTANCE = Mappers.getMapper(AgendaMapper.class); // Remova se usar componentModel="spring"

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "agendaOficinas", ignore = true) // <<< ADICIONADO PARA IGNORAR
    @Mapping(target = "agendaVeiculos", ignore = true) // <<< ADICIONADO PARA IGNORAR
    Agenda toEntity(AgendaRequestDto dto);

    AgendaResponseDto toResponseDto(Agenda entity);
    // Se AgendaResponseDto também não tiver agendaOficinas/agendaVeiculos,
    // o MapStruct não reclamará aqui. Se tivesse, precisaríamos ignorar também ou mapear.

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "agendaOficinas", ignore = true) // <<< ADICIONADO PARA IGNORAR
    @Mapping(target = "agendaVeiculos", ignore = true) // <<< ADICIONADO PARA IGNORAR
    void updateEntityFromDto(AgendaRequestDto dto, @MappingTarget Agenda entity);
}