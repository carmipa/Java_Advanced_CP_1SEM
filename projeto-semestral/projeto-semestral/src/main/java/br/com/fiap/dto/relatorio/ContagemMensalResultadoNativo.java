// src/main/java/br/com/fiap/dto/relatorio/ContagemMensalResultadoNativo.java
package br.com.fiap.dto.relatorio;

// Interface para mapear o resultado da query nativa
public interface ContagemMensalResultadoNativo {
    String getMesAno();      // Nome do método DEVE corresponder ao alias da coluna na query nativa (case-insensitive)
    Long getQuantidade(); // Nome do método DEVE corresponder ao alias da coluna na query nativa (case-insensitive)
}