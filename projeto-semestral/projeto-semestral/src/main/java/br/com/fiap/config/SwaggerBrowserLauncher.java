package br.com.fiap.config; // Ou o pacote que preferir

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.awt.Desktop;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

@Component
public class SwaggerBrowserLauncher {

    private static final Logger log = LoggerFactory.getLogger(SwaggerBrowserLauncher.class);

    // Pega a porta do servidor do application.properties ou usa 8080 como padrão
    @Value("${server.port:8080}")
    private String serverPort;

    // Pega o contexto da aplicação (se houver) do application.properties
    @Value("${server.servlet.context-path:}")
    private String contextPath;

    // Pega o path da UI do Swagger do application.properties ou usa o padrão do Springdoc
    @Value("${springdoc.swagger-ui.path:/swagger-ui.html}") // Padrão do Springdoc
    private String swaggerUiPath;

    // Condição para habilitar/desabilitar a abertura automática
    @Value("${app.launch-swagger-on-startup:true}") // Adicione esta propriedade no application.properties
    private boolean launchSwaggerOnStartup;

    @EventListener(ApplicationReadyEvent.class)
    public void launchBrowserOnStartup() {
        if (!launchSwaggerOnStartup) {
            log.info("Abertura automática do Swagger no navegador está desabilitada.");
            return;
        }

        // Remove barras iniciais/finais duplicadas do contextPath e swaggerUiPath
        String cleanContextPath = contextPath.startsWith("/") ? contextPath : "/" + contextPath;
        if (cleanContextPath.endsWith("/")) {
            cleanContextPath = cleanContextPath.substring(0, cleanContextPath.length() - 1);
        }

        String cleanSwaggerUiPath = swaggerUiPath.startsWith("/") ? swaggerUiPath : "/" + swaggerUiPath;


        String url = "http://localhost:" + serverPort + cleanContextPath + cleanSwaggerUiPath;
        log.info("Tentando abrir o Swagger UI em: {}", url);

        if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
            try {
                Desktop.getDesktop().browse(new URI(url));
                log.info("Navegador aberto com sucesso na URL do Swagger UI.");
            } catch (IOException | URISyntaxException e) {
                log.error("Erro ao tentar abrir o navegador para o Swagger UI: {}", e.getMessage());
            }
        } else {
            log.warn("Abertura automática do navegador não é suportada neste ambiente. Acesse manualmente: {}", url);
        }
    }
}