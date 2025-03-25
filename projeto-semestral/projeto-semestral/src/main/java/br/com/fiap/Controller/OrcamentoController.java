package br.com.fiap.Controller;

import br.com.fiap.DTO.OrcamentoDto;
import br.com.fiap.exceptions.orcamentoException.OrcamentoNotFoundException;
import br.com.fiap.exceptions.orcamentoException.OrcamentoNotSavedException;
import br.com.fiap.exceptions.orcamentoException.OrcamentoUnsupportedServiceOperationException;
import br.com.fiap.model.Orcamento;
import br.com.fiap.service.orcamentoService.OrcamentoService;
import br.com.fiap.service.orcamentoService.OrcamentoServiceFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController // Define que essa classe é um controlador REST (retorna dados, normalmente em JSON)
@RequestMapping("/rest/orcamento") // Define a rota base para os endpoints deste controlador
public class OrcamentoController {

    // Cria a instância do serviço de orçamento utilizando um factory para desacoplar a criação do serviço
    private final OrcamentoService orcamentoService = OrcamentoServiceFactory.create();

    // Logger para registrar mensagens e erros
    private static final Logger logger = LoggerFactory.getLogger(OrcamentoController.class);

    /**
     * Endpoint para criação de um novo orçamento.
     * Método HTTP POST que recebe um objeto OrcamentoDto no corpo da requisição.
     */
    @PostMapping
    public ResponseEntity<?> add(@RequestBody OrcamentoDto input) {
        // Verifica se o DTO não possui código, pois esse método é destinado somente à criação de novos orçamentos
        if (input.getCodigo() != null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensagem", "Este método só permite a criação de novos orçamentos sem código"));
        }
        try {
            // Cria uma nova instância da entidade Orcamento e popula com os dados do DTO
            Orcamento orcamento = new Orcamento();
            orcamento.setDataOrcamento(input.getDataOrcamento());
            orcamento.setMaoDeObra(input.getMaoDeObra());
            orcamento.setValorHora(input.getValorHora());
            orcamento.setQuantidadeHoras(input.getQuantidadeHoras());
            orcamento.setValorTotal(input.getValorTotal());

            // Chama o serviço para criar o orçamento e obtém a entidade persistida
            orcamento = orcamentoService.create(orcamento);

            // Retorna o orçamento criado com status HTTP 201 (Created)
            return ResponseEntity.status(HttpStatus.CREATED).body(orcamento);
        } catch (OrcamentoUnsupportedServiceOperationException e) {
            // Se a operação não for suportada, retorna status 400 (Bad Request) com a mensagem de erro
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        } catch (SQLException | OrcamentoNotSavedException e) {
            // Registra o erro e retorna status 500 (Internal Server Error)
            logger.error("Erro ao criar orçamento: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar inserir um orçamento"));
        }
    }

    /**
     * Endpoint para recuperar todos os orçamentos.
     * Método HTTP GET na rota /rest/orcamento/all.
     */
    @GetMapping("/all")
    public ResponseEntity<List<Orcamento>> findAll() {
        // Chama o serviço para obter a lista de orçamentos
        List<Orcamento> orcamentos = orcamentoService.findAll();
        // Se a lista estiver vazia ou nula, retorna status 204 (No Content)
        if (orcamentos == null || orcamentos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        // Retorna a lista de orçamentos com status 200 (OK)
        return ResponseEntity.ok(orcamentos);
    }

    /**
     * Endpoint para atualizar um orçamento existente.
     * Método HTTP PUT que recebe o ID do orçamento na URL e os novos dados no corpo da requisição.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody OrcamentoDto input) {
        try {
            // Cria uma instância da entidade Orcamento e popula com os dados do DTO, definindo o ID para atualização
            Orcamento orcamento = new Orcamento();
            orcamento.setCodigo(id);
            orcamento.setDataOrcamento(input.getDataOrcamento());
            orcamento.setMaoDeObra(input.getMaoDeObra());
            orcamento.setValorHora(input.getValorHora());
            orcamento.setQuantidadeHoras(input.getQuantidadeHoras());
            orcamento.setValorTotal(input.getValorTotal());

            // Chama o serviço para atualizar o orçamento e obtém a entidade atualizada
            Orcamento updated = orcamentoService.update(orcamento);

            // Retorna o orçamento atualizado com status 200 (OK)
            return ResponseEntity.ok(updated);
        } catch (OrcamentoNotFoundException e) {
            // Se o orçamento não for encontrado para atualização, retorna status 404 (Not Found)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Orçamento não encontrado para atualização"));
        } catch (SQLException e) {
            // Registra o erro e retorna status 500 (Internal Server Error)
            logger.error("Erro ao atualizar orçamento: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar atualizar o orçamento"));
        }
    }

    /**
     * Endpoint para deletar um orçamento.
     * Método HTTP DELETE que recebe o ID do orçamento a ser removido na URL.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            // Chama o serviço para deletar o orçamento pelo ID informado
            orcamentoService.deleteById(id);
            // Retorna status 204 (No Content) indicando que a exclusão foi bem-sucedida
            return ResponseEntity.noContent().build();
        } catch (OrcamentoNotFoundException e) {
            // Registra aviso e retorna status 404 (Not Found) se o orçamento não for encontrado para exclusão
            logger.warn("Orçamento não encontrado para exclusão: ID " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Orçamento não encontrado para exclusão"));
        } catch (SQLException e) {
            // Registra o erro e retorna status 500 (Internal Server Error) em caso de erro inesperado
            logger.error("Erro ao deletar orçamento: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar deletar o orçamento"));
        }
    }
}
