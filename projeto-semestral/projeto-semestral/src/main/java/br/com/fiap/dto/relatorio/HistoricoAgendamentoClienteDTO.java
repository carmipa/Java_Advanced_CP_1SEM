// src/main/java/br/com/fiap/dto/relatorio/HistoricoAgendamentoClienteDTO.java
package br.com.fiap.dto.relatorio;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // Necessário para a query JPQL
public class HistoricoAgendamentoClienteDTO {
    private LocalDate dataAgendamento;
    private String observacao;
    private String veiculoPlaca; // Placa do veículo associado ao agendamento
}