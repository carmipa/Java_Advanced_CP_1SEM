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
            @Mapping(source = "descontoPercentual", target = "desconto"), // Mapeia % do DTO para 'desconto' na entidade
            @Mapping(source = "totalParcelas", target = "totalParcelas"),   // MapStruct converte Integer (DTO) para String (Entidade)
            @Mapping(target = "valorParcelas", ignore = true),          // Calculado no Service
            @Mapping(target = "totalComDesconto", ignore = true),       // Calculado no Service
            @Mapping(target = "clientePagamentos", ignore = true),
            @Mapping(target = "pagamentoOrcamentos", ignore = true)
    })
    Pagamento toEntity(PagamentoRequestDto dto);

    // O toResponseDto geralmente não precisa de mappings explícitos se os nomes dos campos
    // na entidade (após os cálculos no service) e no DTO de resposta forem iguais.
    PagamentoResponseDto toResponseDto(Pagamento entity);

    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(source = "descontoPercentual", target = "desconto"),
            @Mapping(source = "totalParcelas", target = "totalParcelas"),
            @Mapping(target = "valorParcelas", ignore = true),
            @Mapping(target = "totalComDesconto", ignore = true),
            @Mapping(target = "clientePagamentos", ignore = true),
            @Mapping(target = "pagamentoOrcamentos", ignore = true)
    })
    void updateEntityFromDto(PagamentoRequestDto dto, @MappingTarget Pagamento entity);
}