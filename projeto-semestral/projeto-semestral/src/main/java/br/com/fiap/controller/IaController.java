// src/main/java/br/com/fiap/Controller/IaController.java
package br.com.fiap.controller;

import br.com.fiap.service.ia.GoogleGeminiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest/ia")
// @CrossOrigin(origins = "http://localhost:3000") // REMOVIDO: A configuração global de CORS em SecurityConfig será usada
@Tag(name = "IA Service", description = "Endpoint para interação com a IA Generativa (Google Gemini)") // Descrição um pouco mais específica
public class IaController {

    private static final Logger log = LoggerFactory.getLogger(IaController.class);
    @Autowired
    private GoogleGeminiService iaService;

    @GetMapping("/diagnostico")
    @Operation(summary = "Gerar Diagnóstico via IA",
            description = "Recebe a descrição de um problema de veículo e retorna um possível diagnóstico, partes afetadas e estimativa de horas, gerados pela IA.") // Descrição atualizada
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Diagnóstico gerado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Descrição do problema não fornecida ou inválida"), // Atualizado
            @ApiResponse(responseCode = "500", description = "Erro interno, falha na comunicação com a IA ou IA não configurada") // Atualizado
    })
    public ResponseEntity<String> gerarDiagnostico(
            @Parameter(description = "Descrição textual do problema do veículo.", required = true, example = "Motor falhando na partida a frio e fumaça branca saindo do escapamento.")
            @RequestParam String descricao
    ) {
        log.info("Requisição para gerar diagnóstico via IA recebida para descrição: '{}'", descricao);
        if (descricao == null || descricao.isBlank()) {
            log.warn("Descrição do problema está vazia.");
            return ResponseEntity.badRequest().body("A descrição do problema é obrigatória."); // Retorna 400
        }
        try {
            String diagnostico = iaService.gerarDiagnostico(descricao);
            // Verifica se o diagnóstico é válido ou uma mensagem de erro/placeholder do serviço
            if (diagnostico != null && !diagnostico.isBlank() && !diagnostico.toLowerCase().contains("erro") && !diagnostico.toLowerCase().contains("não configurado")) {
                log.info("Diagnóstico da IA retornado com sucesso.");
                return ResponseEntity.ok(diagnostico); // 200
            } else {
                log.error("Serviço de IA retornou um erro, placeholder ou diagnóstico inválido: {}", diagnostico);
                // Retorna 500 com a mensagem de erro/placeholder do serviço
                return ResponseEntity.status(500).body(diagnostico != null ? diagnostico : "Erro desconhecido no serviço de IA.");
            }
        } catch (Exception e) {
            log.error("Erro inesperado ao chamar o serviço de IA: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Erro interno ao processar solicitação de diagnóstico."); // 500
        }
    }
}