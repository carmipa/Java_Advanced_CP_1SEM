// br/com/fiap/mapper/OficinaMapper.java
package br.com.fiap.mapper;

import br.com.fiap.dto.oficina.OficinaRequestDto; // Usado para CRUD simples de Oficina
import br.com.fiap.dto.oficina.OficinaResponseDto;
import br.com.fiap.dto.orcamento.OrcamentoComServicoRequestDto; // Novo DTO
import br.com.fiap.model.Oficina;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface OficinaMapper {

    @Mappings({
            @Mapping(target = "id", ignore = true),
            // Mapeia os campos correspondentes do DTO complexo para a entidade Oficina
            @Mapping(source = "dataOficina", target = "dataOficina"),
            @Mapping(source = "descricaoProblema", target = "descricaoProblema"),
            @Mapping(source = "diagnostico", target = "diagnostico"),
            @Mapping(source = "partesAfetadas", target = "partesAfetadas"),
            @Mapping(source = "horasTrabalhadasOficina", target = "horasTrabalhadas"),
            // Ignora coleções de relacionamento e campos não presentes no DTO parcial
            @Mapping(target = "agendaOficinas", ignore = true),
            @Mapping(target = "oficinaVeiculos", ignore = true),
            @Mapping(target = "oficinaPecas", ignore = true), // Será preenchido no serviço
            @Mapping(target = "oficinaOrcamentos", ignore = true)
    })
    Oficina fromOrcamentoComServicoDto(OrcamentoComServicoRequestDto dto);

    // Métodos existentes para CRUD simples de Oficina (se houver)
    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "agendaOficinas", ignore = true),
            @Mapping(target = "oficinaVeiculos", ignore = true),
            @Mapping(target = "oficinaPecas", ignore = true),
            @Mapping(target = "oficinaOrcamentos", ignore = true)
    })
    Oficina toEntity(OficinaRequestDto dto);

    OficinaResponseDto toResponseDto(Oficina entity);

    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "agendaOficinas", ignore = true),
            @Mapping(target = "oficinaVeiculos", ignore = true),
            @Mapping(target = "oficinaPecas", ignore = true),
            @Mapping(target = "oficinaOrcamentos", ignore = true)
    })
    void updateEntityFromDto(OficinaRequestDto dto, @MappingTarget Oficina entity);

    // Novo método para atualizar a partir do DTO complexo
    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(source = "dataOficina", target = "dataOficina"),
            @Mapping(source = "descricaoProblema", target = "descricaoProblema"),
            @Mapping(source = "diagnostico", target = "diagnostico"),
            @Mapping(source = "partesAfetadas", target = "partesAfetadas"),
            @Mapping(source = "horasTrabalhadasOficina", target = "horasTrabalhadas"),
            @Mapping(target = "agendaOficinas", ignore = true),
            @Mapping(target = "oficinaVeiculos", ignore = true),
            @Mapping(target = "oficinaPecas", ignore = true),
            @Mapping(target = "oficinaOrcamentos", ignore = true)
    })
    void updateOficinaFromOrcamentoComServicoDto(OrcamentoComServicoRequestDto dto, @MappingTarget Oficina entity);
}