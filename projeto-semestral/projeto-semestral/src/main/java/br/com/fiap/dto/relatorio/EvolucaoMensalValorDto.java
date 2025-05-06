package br.com.fiap.dto.relatorio;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EvolucaoMensalValorDto {
    private String mesAno; // Formato "YYYY-MM"
    private BigDecimal valorTotal;
    // private Long quantidade; // Opcional, se quiser mostrar contagem também
}