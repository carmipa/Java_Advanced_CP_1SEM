package br.com.fiap.Controller;

import br.com.fiap.DTO.OficinaDto;
import br.com.fiap.exceptions.oficinaException.OficinaNotFoundException;
import br.com.fiap.exceptions.oficinaException.OficinaNotSavedException;
import br.com.fiap.exceptions.oficinaException.OficinaUnsupportedServiceOperationExcept;
import br.com.fiap.model.Oficina;
import br.com.fiap.service.oficinaService.OficinaService;
import br.com.fiap.service.oficinaService.OficinaServiceFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController // Indica que a classe é um controlador REST e seus métodos retornam dados (geralmente em JSON)
@RequestMapping("/rest/oficina") // Define a rota base para os endpoints deste controlador
public class OficinaController {

    // Cria a instância do serviço de oficina utilizando um factory para desacoplar a criação do serviço
    private final OficinaService oficinaService = OficinaServiceFactory.create();

    // Logger para registrar mensagens e erros
    private static final Logger logger = LoggerFactory.getLogger(OficinaController.class);

    /**
     * Endpoint para criação de uma nova oficina.
     * Método HTTP POST que recebe um objeto OficinaDto no corpo da requisição.
     */
    @PostMapping
    public ResponseEntity<?> add(@RequestBody OficinaDto input) {
        // Verifica se o DTO não possui um código, pois este método deve ser utilizado somente para criação
        if (input.getCodigo() != null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensagem", "Este método só permite a criação de novas oficinas sem código"));
        }
        try {
            // Cria uma nova instância da entidade Oficina e popula com os dados do DTO
            Oficina oficina = new Oficina();
            oficina.setDataOficina(input.getDataOficina());
            oficina.setDescricaoProblema(input.getDescricaoProblema());
            oficina.setDiagnostico(input.getDiagnostico());
            oficina.setPartesAfetadas(input.getPartesAfetadas());
            oficina.setHorasTrabalhadas(input.getHorasTrabalhadas());

            // Chama o serviço para criar a oficina e obtém a entidade persistida
            oficina = oficinaService.create(oficina);

            // Retorna a oficina criada com status HTTP 201 (Created)
            return ResponseEntity.status(HttpStatus.CREATED).body(oficina);
        } catch (OficinaUnsupportedServiceOperationExcept e) {
            // Se a operação não for suportada, retorna status 400 (Bad Request) com a mensagem de erro
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        } catch (SQLException | OficinaNotSavedException e) {
            // Registra o erro e retorna status 500 (Internal Server Error)
            logger.error("Erro ao criar oficina: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar inserir uma oficina"));
        }
    }

    /**
     * Endpoint para recuperar todas as oficinas.
     * Método HTTP GET na rota /rest/oficina/all.
     */
    @GetMapping("/all")
    public ResponseEntity<List<Oficina>> findAll() {
        // Chama o serviço para obter a lista de oficinas
        List<Oficina> oficinas = oficinaService.findall();
        // Se a lista estiver vazia ou nula, retorna status 204 (No Content)
        if (oficinas == null || oficinas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        // Retorna a lista de oficinas com status 200 (OK)
        return ResponseEntity.ok(oficinas);
    }

    /**
     * Endpoint para atualizar uma oficina existente.
     * Método HTTP PUT que recebe o ID da oficina na URL e os novos dados no corpo da requisição.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody OficinaDto input) {
        try {
            // Cria uma instância da entidade Oficina e popula com os dados do DTO, definindo o ID da oficina a ser atualizada
            Oficina oficina = new Oficina();
            oficina.setCodigo(id);
            oficina.setDataOficina(input.getDataOficina());
            oficina.setDescricaoProblema(input.getDescricaoProblema());
            oficina.setDiagnostico(input.getDiagnostico());
            oficina.setPartesAfetadas(input.getPartesAfetadas());
            oficina.setHorasTrabalhadas(input.getHorasTrabalhadas());

            // Chama o serviço para atualizar a oficina e obtém a entidade atualizada
            Oficina updated = oficinaService.update(oficina);

            // Retorna a oficina atualizada com status 200 (OK)
            return ResponseEntity.ok(updated);
        } catch (OficinaNotFoundException e) {
            // Se a oficina não for encontrada para atualização, retorna status 404 (Not Found)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Oficina não encontrada para atualização"));
        } catch (SQLException e) {
            // Registra o erro e retorna status 500 (Internal Server Error)
            logger.error("Erro ao atualizar oficina: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar atualizar a oficina"));
        }
    }

    /**
     * Endpoint para deletar uma oficina.
     * Método HTTP DELETE que recebe o ID da oficina a ser removida na URL.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            // Chama o serviço para deletar a oficina pelo ID informado
            oficinaService.deleteById(id);
            // Retorna status 204 (No Content) indicando que a exclusão foi bem-sucedida
            return ResponseEntity.noContent().build();
        } catch (OficinaNotFoundException e) {
            // Registra aviso e retorna status 404 (Not Found) caso a oficina não seja encontrada
            logger.warn("Oficina não encontrada para exclusão: ID " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Oficina não encontrada para exclusão"));
        } catch (SQLException e) {
            // Registra o erro e retorna status 500 (Internal Server Error)
            logger.error("Erro ao deletar oficina: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar deletar a oficina"));
        }
    }
}
