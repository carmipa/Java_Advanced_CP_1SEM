package br.com.fiap.dto.veiculo;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class VeiculoResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id; // ID incluído
    private String tipoVeiculo;
    private String renavam;
    private String placa;
    private String modelo;
    private String proprietario;
    private String montadora;
    private String cor;
    private String motor;
    private LocalDate anoFabricacao; // Mantido como LocalDate
}