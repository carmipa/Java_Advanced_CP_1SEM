package br.com.fiap.Controller;

import br.com.fiap.DTO.PecasDto;
import br.com.fiap.exceptions.pecasException.PecasNotFoundException;
import br.com.fiap.exceptions.pecasException.PecasNotSavedException;
import br.com.fiap.exceptions.pecasException.PecasUnsupportedServiceOperationException;
import br.com.fiap.model.Pecas;
import br.com.fiap.service.pecasService.PecasService;
import br.com.fiap.service.pecasService.PecasServiceFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController // Indica que essa classe é um controlador REST que retornará respostas em JSON
@RequestMapping("/rest/pecas") // Define a rota base para os endpoints deste controlador
public class PecasController {

    // Instancia o serviço de peças utilizando um factory para desacoplar a criação do serviço
    private final PecasService pecasService = PecasServiceFactory.create();

    // Logger para registrar mensagens de log e erros
    private static final Logger logger = LoggerFactory.getLogger(PecasController.class);

    /**
     * Endpoint para criação de uma nova peça.
     * Método HTTP POST que recebe um objeto PecasDto no corpo da requisição.
     */
    @PostMapping
    public ResponseEntity<?> add(@RequestBody PecasDto input) {
        // Verifica se o DTO não possui um código, pois esse método é destinado apenas para criação
        if (input.getCodigo() != null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensagem", "Este método só permite a criação de novas peças sem código"));
        }
        try {
            // Cria uma nova instância da entidade Pecas e popula com os dados do DTO
            Pecas pecas = new Pecas();
            pecas.setTipoVeiculo(input.getTipoVeiculo());
            pecas.setFabricante(input.getFabricante());
            pecas.setDescricao(input.getDescricao());
            pecas.setDataCompra(input.getDataCompra());
            pecas.setPreco(input.getPreco());
            pecas.setDesconto(input.getDesconto());
            pecas.setTotalDesconto(input.getTotalDesconto());

            // Chama o serviço para criar a peça e obtém a entidade persistida
            pecas = pecasService.create(pecas);

            // Retorna a peça criada com status HTTP 201 (Created)
            return ResponseEntity.status(HttpStatus.CREATED).body(pecas);
        } catch (PecasUnsupportedServiceOperationException e) {
            // Retorna status 400 (Bad Request) se a operação não for suportada
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        } catch (SQLException | PecasNotSavedException e) {
            // Registra o erro e retorna status 500 (Internal Server Error) para erros inesperados
            logger.error("Erro ao criar peça: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar inserir a peça"));
        }
    }

    /**
     * Endpoint para recuperar todas as peças.
     * Método HTTP GET na rota /rest/pecas/all.
     */
    @GetMapping("/all")
    public ResponseEntity<List<Pecas>> findAll() {
        // Chama o serviço para obter a lista de peças
        List<Pecas> pecasList = pecasService.findaall();
        // Se a lista estiver vazia ou nula, retorna status 204 (No Content)
        if (pecasList == null || pecasList.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        // Retorna a lista de peças com status 200 (OK)
        return ResponseEntity.ok(pecasList);
    }

    /**
     * Endpoint para atualizar uma peça existente.
     * Método HTTP PUT que recebe o ID da peça na URL e os novos dados no corpo da requisição.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody PecasDto input) {
        try {
            // Cria uma instância da entidade Pecas e popula com os dados do DTO, definindo o ID para atualização
            Pecas pecas = new Pecas();
            pecas.setCodigo(id);
            pecas.setTipoVeiculo(input.getTipoVeiculo());
            pecas.setFabricante(input.getFabricante());
            pecas.setDescricao(input.getDescricao());
            pecas.setDataCompra(input.getDataCompra());
            pecas.setPreco(input.getPreco());
            pecas.setDesconto(input.getDesconto());
            pecas.setTotalDesconto(input.getTotalDesconto());

            // Chama o serviço para atualizar a peça e obtém a entidade atualizada
            Pecas updated = pecasService.update(pecas);

            // Retorna a peça atualizada com status HTTP 200 (OK)
            return ResponseEntity.ok(updated);
        } catch (PecasNotFoundException e) {
            // Retorna status 404 (Not Found) se a peça não for encontrada para atualização
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Peça não encontrada para atualização"));
        } catch (SQLException e) {
            // Registra o erro e retorna status 500 (Internal Server Error) para erros inesperados
            logger.error("Erro ao atualizar peça: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar atualizar a peça"));
        }
    }

    /**
     * Endpoint para deletar uma peça.
     * Método HTTP DELETE que recebe o ID da peça a ser removida na URL.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            // Chama o serviço para deletar a peça pelo ID informado
            pecasService.deleteById(id);
            // Retorna status 204 (No Content) indicando que a exclusão foi bem-sucedida
            return ResponseEntity.noContent().build();
        } catch (PecasNotFoundException e) {
            // Registra aviso e retorna status 404 (Not Found) se a peça não for encontrada para exclusão
            logger.warn("Peça não encontrada para exclusão: ID " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Peça não encontrada para exclusão"));
        } catch (SQLException e) {
            // Registra o erro e retorna status 500 (Internal Server Error) para erros inesperados
            logger.error("Erro ao deletar peça: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar deletar a peça"));
        }
    }
}
