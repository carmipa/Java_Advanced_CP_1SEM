// src/main/java/br/com/fiap/dto/relatorio/ServicoAgendadoDTO.java
package br.com.fiap.dto.relatorio;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // Necessário para a query JPQL com 'new'
public class ServicoAgendadoDTO {
    private Long agendaId;                    // ID do agendamento
    private LocalDate dataAgendamento;        // Data do agendamento
    private String agendaObservacao;          // Observação vinda da Agenda
    private String veiculoPlaca;              // Placa do Veiculo (pode ser null)
    private String oficinaDescricaoProblema;  // Descrição vinda da Oficina (pode ser null)
    private String oficinaDiagnostico;        // Diagnóstico vindo da Oficina (pode ser null)
}