package br.com.fiap.dto.oficina;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class OficinaResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id; // ID incluído
    private LocalDate dataOficina;
    private String descricaoProblema;
    private String diagnostico;
    private String partesAfetadas;
    private String horasTrabalhadas; // Mantido como String
}