// src/main/java/br/com/fiap/dto/relatorio/ContagemMensalDTO.java
package br.com.fiap.dto.relatorio;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // Necessário para a query JPQL construir o objeto
public class ContagemMensalDTO {
    private String mesAno; // Formato "YYYY-MM"
    private Long quantidade; // Contagem de agendamentos no mês/ano
}