package br.com.fiap.dto.agenda;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class AgendaRequestDto implements Serializable {
    private static final long serialVersionUID = 1L;

    // ID Omitido para criação/atualização

    @NotNull(message = "Data do agendamento é obrigatória")
    @FutureOrPresent(message = "Data do agendamento não pode ser no passado") // Ou só @NotNull se permitir passado
    private LocalDate dataAgendamento;

    @Size(max = 400, message = "Observação pode ter no máximo 400 caracteres") // DDL: VARCHAR2(400)
    private String observacao; // Renomeado de obsAgenda
}