package br.com.fiap.dto.agenda;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class AgendaResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id; // ID incluído na resposta
    private LocalDate dataAgendamento;
    private String observacao;
}