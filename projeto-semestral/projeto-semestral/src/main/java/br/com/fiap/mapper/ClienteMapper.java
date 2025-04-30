// --- src/main/java/br/com/fiap/mapper/ClienteMapper.java ---
package br.com.fiap.mapper;

import br.com.fiap.dto.cliente.ClienteRequestDto;
import br.com.fiap.dto.cliente.ClienteResponseDto;
import br.com.fiap.model.Clientes;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;

// Declara que este mapper usa outros mappers (para Endereco e Contato)
@Mapper(componentModel = "spring", uses = {EnderecoMapper.class, ContatoMapper.class})
public interface ClienteMapper {

    // Mapeamento DTO -> Entidade (Criação)
    // Ignora o ID composto ('id') pois será gerenciado pelo JPA/@MapsId e Sequence
    // Mapeia os DTOs aninhados de endereco e contato usando os mappers injetados
    @Mappings({
            @Mapping(target = "id", ignore = true), // Ignora o @EmbeddedId
            @Mapping(target = "endereco", source = "endereco"), // Usa EnderecoMapper
            @Mapping(target = "contato", source = "contato"),   // Usa ContatoMapper
            @Mapping(target = "autenticar", ignore = true) // Ignora autenticar por enquanto
    })
    Clientes toEntity(ClienteRequestDto dto);

    // Mapeamento Entidade -> DTO (Resposta)
    // Mapeia a parte idCli da chave composta para o campo idCli do DTO
    // Mapeia as entidades aninhadas Endereco e Contato para seus DTOs de resposta
    @Mappings({
            @Mapping(target = "idCli", source = "id.idCli"), // Pega o idCli de dentro do ClienteId
            @Mapping(target = "endereco", source = "endereco"), // Usa EnderecoMapper
            @Mapping(target = "contato", source = "contato")    // Usa ContatoMapper
            // Mapear autenticar se houver um DTO para ele
    })
    ClienteResponseDto toResponseDto(Clientes entity);

    // Mapeamento DTO -> Entidade (Atualização)
    // Ignora o ID composto ('id') pois não deve ser alterado
    // Mapeia os DTOs aninhados (a lógica de salvar/atualizar Endereco/Contato fica no Service)
    // Atualiza os campos simples do cliente
    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "endereco", ignore = true), // Endereço é atualizado separadamente no Service
            @Mapping(target = "contato", ignore = true),  // Contato é atualizado separadamente no Service
            @Mapping(target = "autenticar", ignore = true) // Ignora autenticar
    })
    void updateEntityFromDto(ClienteRequestDto dto, @MappingTarget Clientes entity);
}