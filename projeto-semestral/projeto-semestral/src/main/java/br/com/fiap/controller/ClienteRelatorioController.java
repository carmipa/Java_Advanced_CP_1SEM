// --- Arquivo: src/main/java/br/com/fiap/controller/ClienteRelatorioController.java ---
package br.com.fiap.controller;

import br.com.fiap.dto.relatorio.ClienteRelatorioCompletoDTO;
import br.com.fiap.exception.ClientesNotFoundException;
import br.com.fiap.service.relatorio.cliente.RelatorioClienteService; // Importa o serviço de relatório
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest/relatorios/cliente") // <<< Novo RequestMapping base para relatórios de cliente
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Relatórios Cliente", description = "Endpoints para gerar relatórios específicos de clientes") // <<< Nova Tag
public class ClienteRelatorioController {

    private static final Logger log = LoggerFactory.getLogger(ClienteRelatorioController.class);

    @Autowired
    private RelatorioClienteService relatorioClienteService; // <<< Injeta o serviço de relatório

    @GetMapping("/completo") // <<< Endpoint relativo ao RequestMapping da classe
    @Operation(summary = "Relatório Completo do Cliente", description = "Busca todos os dados relacionados a um cliente por ID ou Documento.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Relatório gerado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Parâmetros de busca inválidos"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<ClienteRelatorioCompletoDTO> getRelatorioCompleto(
            @Parameter(description = "Tipo de busca: 'id' para ID_CLI ou 'documento' para CPF/CNPJ", required = true, example = "documento")
            @RequestParam String tipoBusca,
            @Parameter(description = "Valor correspondente ao tipo de busca", required = true, example = "12345678900")
            @RequestParam String valorBusca
    ) {
        log.info("Requisição GET /rest/relatorios/cliente/completo: tipo={}, valor={}", tipoBusca, valorBusca);
        try {
            ClienteRelatorioCompletoDTO relatorio = relatorioClienteService.getRelatorioCompletoCliente(tipoBusca, valorBusca);
            return ResponseEntity.ok(relatorio);
        } catch (ClientesNotFoundException e) {
            log.warn("Cliente não encontrado para relatório: tipo={}, valor={}", tipoBusca, valorBusca);
            return ResponseEntity.notFound().build(); // 404
        } catch (IllegalArgumentException e) {
            log.warn("Argumento inválido para relatório: {}", e.getMessage());
            // Retorna 400 com a mensagem de erro no corpo para o frontend
            return ResponseEntity.badRequest().body(null); // Corpo vazio ou pode criar um DTO de erro { "error": e.getMessage() }
        } catch (Exception e) {
            log.error("Erro ao gerar relatório completo para cliente: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500
        }
    }

}