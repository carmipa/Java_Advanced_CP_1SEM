// --- src/main/java/br/com/fiap/mapper/PagamentoMapper.java ---
package br.com.fiap.mapper;

import br.com.fiap.dto.pagamento.PagamentoRequestDto;
import br.com.fiap.dto.pagamento.PagamentoResponseDto;
import br.com.fiap.model.Pagamento;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface PagamentoMapper {

    @Mappings({
            @Mapping(target = "id", ignore = true),
            // Mapeia totalParcelas (String DTO) para totalParcelas (String Entidade)
            @Mapping(target = "totalParcelas", source="totalParcelas"),
            @Mapping(target = "clientePagamentos", ignore = true), // Ignora relacionamentos
            @Mapping(target = "pagamentoOrcamentos", ignore = true)
    })
    Pagamento toEntity(PagamentoRequestDto dto);

    // Mapeia totalParcelas (String Entidade) para totalParcelas (String DTO)
    @Mapping(target = "totalParcelas", source="totalParcelas")
    PagamentoResponseDto toResponseDto(Pagamento entity);

    @Mappings({
            @Mapping(target = "id", ignore = true),
            // Mapeia totalParcelas (String DTO) para totalParcelas (String Entidade)
            @Mapping(target = "totalParcelas", source="totalParcelas"),
            @Mapping(target = "clientePagamentos", ignore = true),
            @Mapping(target = "pagamentoOrcamentos", ignore = true)
    })
    void updateEntityFromDto(PagamentoRequestDto dto, @MappingTarget Pagamento entity);
}