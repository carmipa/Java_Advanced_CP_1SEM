// Arquivo: src/main/java/br/com/fiap/Controller/IaController.java
package br.com.fiap.Controller;

import br.com.fiap.service.ia.GoogleGeminiService; // Importa a interface do serviço IA
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag; // Para agrupar no Swagger
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest/ia") // Novo path base para ações de IA
@CrossOrigin(origins = "http://localhost:3000") // Permite acesso do frontend
@Tag(name = "IA Service", description = "Endpoint para interação com a IA Generativa") // Tag para Swagger
public class IaController {

    private static final Logger log = LoggerFactory.getLogger(IaController.class);

    @Autowired
    private GoogleGeminiService iaService; // Injeta o serviço de IA (que usa RestTemplate internamente)

    @GetMapping("/diagnostico")
    @Operation(summary = "Gerar Diagnóstico via IA", description = "Recebe a descrição de um problema e retorna um diagnóstico gerado pela IA.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Diagnóstico gerado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Descrição do problema não fornecida"),
            @ApiResponse(responseCode = "500", description = "Erro interno ou falha na comunicação com a IA")
    })
    public ResponseEntity<String> gerarDiagnostico(
            @Parameter(description = "Descrição do problema do veículo", required = true, example = "Motor falhando na partida a frio e fumaça branca saindo do escapamento.")
            @RequestParam String descricao) { // Recebe a descrição como parâmetro de query (?descricao=...)

        log.info("Requisição para gerar diagnóstico via IA recebida para descrição: '{}'", descricao);

        if (descricao == null || descricao.isBlank()) {
            log.warn("Descrição do problema está vazia.");
            return ResponseEntity.badRequest().body("A descrição do problema é obrigatória.");
        }

        try {
            // Chama o serviço que faz a chamada para a API Externa (Gemini via RestTemplate)
            String diagnostico = iaService.gerarDiagnostico(descricao);

            // Verifica se o serviço retornou um diagnóstico válido ou uma mensagem de erro/placeholder
            if (diagnostico != null && !diagnostico.isBlank() && !diagnostico.toLowerCase().contains("erro") && !diagnostico.toLowerCase().contains("não configurado")) {
                log.info("Diagnóstico da IA retornado com sucesso.");
                // Retorna o texto do diagnóstico diretamente com status 200 OK
                return ResponseEntity.ok(diagnostico);
            } else {
                log.error("Serviço de IA retornou um erro ou diagnóstico inválido: {}", diagnostico);
                // Retorna 500 Internal Server Error com a mensagem de erro/placeholder
                return ResponseEntity.status(500).body(diagnostico != null ? diagnostico : "Erro desconhecido no serviço de IA.");
            }
        } catch (Exception e) {
            log.error("Erro inesperado ao chamar o serviço de IA: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Erro interno ao processar solicitação de diagnóstico.");
        }
    }
}
