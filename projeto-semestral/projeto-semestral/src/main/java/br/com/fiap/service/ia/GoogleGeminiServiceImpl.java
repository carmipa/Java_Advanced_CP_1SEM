package br.com.fiap.service.ia;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient; // Importar ChatClient
import org.springframework.ai.chat.model.ChatResponse; // Para pegar a resposta
import org.springframework.ai.chat.prompt.Prompt;     // Para criar o prompt
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GoogleGeminiServiceImpl implements GoogleGeminiService {

    private static final Logger log = LoggerFactory.getLogger(GoogleGeminiServiceImpl.class);
    private final ChatClient chatClient;

    @Autowired
    public GoogleGeminiServiceImpl(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
        log.info("ChatClient do Spring AI (Vertex AI/Gemini) inicializado.");
    }

    @Override
    public String gerarDiagnostico(String descricaoProblema) {
        log.info("Chamando IA (Vertex AI/Gemini) via Spring AI ChatClient para: '{}'", descricaoProblema);

        String promptTexto = String.format(
                "Aja como um mecânico experiente. Gere um possível diagnóstico técnico conciso (max 1-2 frases), liste as prováveis partes afetadas (max 3-4 itens em lista simples) e estime um número de horas de trabalho (apenas o número, ex: '2.5') para um veículo com o seguinte problema descrito pelo cliente: \"%s\"",
                descricaoProblema
        );

        try {
            Prompt prompt = new Prompt(promptTexto);
            ChatResponse response = chatClient.prompt(prompt).call().chatResponse();

            // --- CORREÇÃO APLICADA AQUI ---
            // Pega o conteúdo da resposta usando getText()
            String diagnosticoGerado = response.getResult().getOutput().getText();
            // -----------------------------

            if (diagnosticoGerado == null || diagnosticoGerado.isBlank()) {
                log.warn("Resposta da IA via Spring AI veio vazia ou nula.");
                return "Não foi possível gerar um diagnóstico (resposta vazia da IA).";
            }

            log.info("Diagnóstico Spring AI recebido com sucesso.");
            // Limita tamanho
            return diagnosticoGerado.substring(0, Math.min(diagnosticoGerado.length(), 4000));

        } catch (Exception e) {
            log.error("Erro ao chamar IA via Spring AI: {}", e.getMessage(), e);
            return "Erro ao se comunicar com o serviço de IA.";
        }
    }
}