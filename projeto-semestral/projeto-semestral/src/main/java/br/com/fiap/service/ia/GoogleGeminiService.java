// ===========================================================================
// 1. Interface (Arquivo: src/main/java/br/com/fiap/service/ia/GoogleGeminiService.java)
// ===========================================================================
package br.com.fiap.service.ia;

/**
 * Interface definindo o contrato para serviços que geram diagnósticos via API Google Gemini.
 */
public interface GoogleGeminiService { // <<< Interface Renomeada

    /**
     * Gera um diagnóstico sugerido com base na descrição do problema.
     * @param descricaoProblema A descrição fornecida pelo usuário.
     * @return Uma string com o diagnóstico sugerido pela IA, ou uma mensagem de erro/padrão.
     */
    String gerarDiagnostico(String descricaoProblema);
}