package br.com.fiap.service.ia;

import com.fasterxml.jackson.databind.JsonNode; // <<< Importa JsonNode do Jackson
import com.fasterxml.jackson.databind.ObjectMapper; // <<< Importa ObjectMapper do Jackson
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class GoogleGeminiServiceImpl implements GoogleGeminiService {

    private static final Logger log = LoggerFactory.getLogger(GoogleGeminiServiceImpl.class);

    @Autowired
    private RestTemplate restTemplate;

    // ObjectMapper para parsear JSON (pode ser injetado ou criado)
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.endpoint}")
    private String apiEndpoint;

    @Override
    public String gerarDiagnostico(String descricaoProblema) {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("SUA_CHAVE")) {
            log.warn("Chave da API Gemini não configurada."); return "Diagnóstico IA não configurado (API Key)."; }
        if (apiEndpoint == null || apiEndpoint.isBlank() || apiEndpoint.startsWith("URL_DA_API")) {
            log.warn("Endpoint da API Gemini não configurado."); return "Diagnóstico IA não configurado (Endpoint)."; }

        log.info("Chamando API Gemini via RestTemplate para: '{}'", descricaoProblema);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // Autenticação via ?key=... na URL

        // Adapte o corpo JSON e o prompt à API Gemini
        String prompt = String.format( /* ... seu prompt ... */
                "Aja como um mecânico experiente. Gere um possível diagnóstico técnico conciso (max 1-2 frases), liste as prováveis partes afetadas (max 3-4 itens em lista simples) e estime um número de horas de trabalho (apenas o número, ex: '2.5') para um veículo com o seguinte problema descrito pelo cliente: \"%s\"",
                descricaoProblema.replace("\"", "\\\""));
        String requestBodyJson = String.format("""
                {
                  "contents": [{"parts":[{"text": "%s"}]}]
                }
                """, prompt); // <<< Confirme se esta estrutura está correta para sua API/modelo

        HttpEntity<String> requestEntity = new HttpEntity<>(requestBodyJson, headers);

        String urlWithKey = UriComponentsBuilder.fromHttpUrl(apiEndpoint)
                .queryParam("key", apiKey)
                .toUriString();
        log.debug("URL da API Gemini sendo chamada: {}", apiEndpoint);

        try {
            ResponseEntity<String> responseEntity = restTemplate.postForEntity(urlWithKey, requestEntity, String.class);

            if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                String responseBody = responseEntity.getBody();
                log.debug("Resposta crua da IA: {}", responseBody);

                // <<< Chama a função de extração implementada >>>
                String diagnosticoGerado = extrairDiagnosticoDaResposta(responseBody);

                if (diagnosticoGerado == null || diagnosticoGerado.isBlank() || diagnosticoGerado.contains("Falha ao extrair")) {
                    log.error("Não foi possível extrair diagnóstico da resposta da IA.");
                    return diagnosticoGerado; // Retorna a mensagem de falha da extração
                }

                log.info("Diagnóstico gerado pela IA recebido.");
                return diagnosticoGerado;
            } else {
                log.error("Erro na chamada para API Gemini: Status {}", responseEntity.getStatusCode());
                // Tenta extrair mensagem de erro do corpo, se houver
                String errorBody = responseEntity.getBody();
                String errorMessage = errorBody != null ? extrairMensagemDeErroDaResposta(errorBody) : String.format("Erro da IA (%s)", responseEntity.getStatusCode());
                return errorMessage;
            }
        } catch (RestClientException e) {
            log.error("Erro de comunicação ao chamar API Gemini: {}", e.getMessage());
            return "Erro de comunicação com a IA.";
        } catch (Exception e) {
            log.error("Erro inesperado ao processar diagnóstico da IA: {}", e.getMessage(), e);
            return "Erro inesperado ao processar diagnóstico.";
        }
    }

    /**
     * Extrai o texto do diagnóstico da resposta JSON da API Gemini.
     * Adapte esta lógica à estrutura EXATA da resposta da sua API/modelo.
     * @param responseBodyJson A string JSON retornada pela API.
     * @return O texto do diagnóstico extraído ou uma mensagem de erro.
     */
    private String extrairDiagnosticoDaResposta(String responseBodyJson) {
        try {
            JsonNode root = objectMapper.readTree(responseBodyJson);

            // Navega pela estrutura esperada: candidates -> [0] -> content -> parts -> [0] -> text
            JsonNode textNode = root.path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text");

            if (!textNode.isMissingNode() && textNode.isTextual()) {
                String text = textNode.asText();
                // Limita o tamanho para caber no banco (VARCHAR2(4000))
                return text.substring(0, Math.min(text.length(), 4000));
            } else {
                log.warn("Estrutura de resposta inesperada ou campo 'text' não encontrado no JSON da IA: {}", responseBodyJson);
                return "Formato de resposta da IA inesperado.";
            }
        } catch (Exception e) { // Captura JsonProcessingException e outros erros
            log.error("Falha ao fazer parse do JSON da resposta da IA: {}", e.getMessage());
            return "Falha ao processar resposta da IA.";
        }
    }

    /**
     * Tenta extrair uma mensagem de erro de uma resposta JSON da API Gemini.
     * Adapte esta lógica à estrutura de erro EXATA da sua API/modelo.
     * @param errorBodyJson A string JSON de erro retornada pela API.
     * @return A mensagem de erro extraída ou uma mensagem genérica.
     */
    private String extrairMensagemDeErroDaResposta(String errorBodyJson) {
        try {
            JsonNode root = objectMapper.readTree(errorBodyJson);
            // Exemplo: Procura por um campo 'error' -> 'message'
            JsonNode messageNode = root.path("error").path("message");
            if (!messageNode.isMissingNode() && messageNode.isTextual()) {
                return "Erro da API IA: " + messageNode.asText();
            }
        } catch (Exception e) {
            log.error("Falha ao fazer parse do JSON de erro da IA: {}", e.getMessage());
        }
        // Retorna o corpo cru se não conseguir parsear ou encontrar a mensagem
        return "Erro não especificado da IA: " + (errorBodyJson.length() > 200 ? errorBodyJson.substring(0, 200) + "..." : errorBodyJson);
    }
}