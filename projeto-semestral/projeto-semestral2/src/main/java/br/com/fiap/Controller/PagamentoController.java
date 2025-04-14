package br.com.fiap.Controller;

import br.com.fiap.DTO.PagamentoDto;
import br.com.fiap.exceptions.pagamentoException.PagamentoNotFoundException;
import br.com.fiap.exceptions.pagamentoException.PagamentoNotSavedException;
import br.com.fiap.exceptions.pagamentoException.PagamentoUnsupportedServiceOperationException;
import br.com.fiap.model.Pagamento;
import br.com.fiap.service.pagamentoService.PagamentoService;
import br.com.fiap.service.pagamentoService.PagamentoServiceFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController // Indica que essa classe é um controlador REST e que os métodos retornarão dados (normalmente em JSON)
@RequestMapping("/rest/pagamento") // Define a rota base para os endpoints deste controlador
public class PagamentoController {

    // Cria a instância do serviço de pagamento utilizando um factory para desacoplar a criação do serviço
    private final PagamentoService pagamentoService = PagamentoServiceFactory.create();

    // Logger para registrar mensagens e erros
    private static final Logger logger = LoggerFactory.getLogger(PagamentoController.class);

    /**
     * Endpoint para criação de um novo pagamento.
     * Método HTTP POST que recebe um objeto PagamentoDto no corpo da requisição.
     */
    @PostMapping
    public ResponseEntity<?> add(@RequestBody PagamentoDto input) {
        // Verifica se o DTO não possui código, pois esse método deve ser utilizado somente para criação
        if (input.getCodigo() != null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensagem", "Este método só permite a criação de novos pagamentos sem código"));
        }
        try {
            // Cria uma nova instância da entidade Pagamento e popula com os dados do DTO
            Pagamento pagamento = new Pagamento();
            pagamento.setDataPagamento(input.getDataPagamento());
            pagamento.setTipoPagamento(input.getTipoPagamento());
            pagamento.setDesconto(input.getDesconto());
            pagamento.setParcelamento(input.getParcelamento());
            pagamento.setValorParcelas(input.getValorParcelas());
            pagamento.setTotalComDesconto(input.getTotalComDesconto());

            // Chama o serviço para criar o pagamento e obtém a entidade persistida
            pagamento = pagamentoService.create(pagamento);

            // Retorna o pagamento criado com status HTTP 201 (Created)
            return ResponseEntity.status(HttpStatus.CREATED).body(pagamento);
        } catch (PagamentoUnsupportedServiceOperationException e) {
            // Se a operação não for suportada, retorna status 400 (Bad Request) com a mensagem de erro
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        } catch (SQLException | PagamentoNotSavedException e) {
            // Registra o erro e retorna status 500 (Internal Server Error)
            logger.error("Erro ao criar pagamento: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar inserir o pagamento"));
        }
    }

    /**
     * Endpoint para recuperar todos os pagamentos.
     * Método HTTP GET na rota /rest/pagamento/all.
     */
    @GetMapping("/all")
    public ResponseEntity<List<Pagamento>> findAll() {
        // Chama o serviço para obter a lista de pagamentos
        List<Pagamento> pagamentos = pagamentoService.findall();
        // Se a lista estiver vazia ou nula, retorna status 204 (No Content)
        if (pagamentos == null || pagamentos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        // Retorna a lista de pagamentos com status 200 (OK)
        return ResponseEntity.ok(pagamentos);
    }

    /**
     * Endpoint para atualizar um pagamento existente.
     * Método HTTP PUT que recebe o ID do pagamento na URL e os novos dados no corpo da requisição.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody PagamentoDto input) {
        try {
            // Cria uma instância da entidade Pagamento e popula com os dados do DTO, definindo o ID para atualização
            Pagamento pagamento = new Pagamento();
            pagamento.setCodigo(id);
            pagamento.setDataPagamento(input.getDataPagamento());
            pagamento.setTipoPagamento(input.getTipoPagamento());
            pagamento.setDesconto(input.getDesconto());
            pagamento.setParcelamento(input.getParcelamento());
            pagamento.setValorParcelas(input.getValorParcelas());
            pagamento.setTotalComDesconto(input.getTotalComDesconto());

            // Chama o serviço para atualizar o pagamento e obtém a entidade atualizada
            Pagamento updated = pagamentoService.update(pagamento);

            // Retorna o pagamento atualizado com status 200 (OK)
            return ResponseEntity.ok(updated);
        } catch (PagamentoNotFoundException e) {
            // Se o pagamento não for encontrado para atualização, retorna status 404 (Not Found)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Pagamento não encontrado para atualização"));
        } catch (SQLException e) {
            // Registra o erro e retorna status 500 (Internal Server Error)
            logger.error("Erro ao atualizar pagamento: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar atualizar o pagamento"));
        }
    }

    /**
     * Endpoint para deletar um pagamento.
     * Método HTTP DELETE que recebe o ID do pagamento a ser removido na URL.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            // Chama o serviço para deletar o pagamento pelo ID informado
            pagamentoService.deleteById(id);
            // Retorna status 204 (No Content) indicando que a exclusão foi bem-sucedida
            return ResponseEntity.noContent().build();
        } catch (PagamentoNotFoundException e) {
            // Registra aviso e retorna status 404 (Not Found) se o pagamento não for encontrado para exclusão
            logger.warn("Pagamento não encontrado para exclusão: ID " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Pagamento não encontrado para exclusão"));
        } catch (SQLException e) {
            // Registra o erro e retorna status 500 (Internal Server Error) em caso de erro inesperado
            logger.error("Erro ao deletar pagamento: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar deletar o pagamento"));
        }
    }
}
