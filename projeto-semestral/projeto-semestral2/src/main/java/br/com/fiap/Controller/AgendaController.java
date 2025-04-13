package br.com.fiap.Controller;

import br.com.fiap.DTO.AgendaDto;
import br.com.fiap.exceptions.agendaException.AgendaNotFoundException;
import br.com.fiap.exceptions.agendaException.AgendaNotSavedException;
import br.com.fiap.exceptions.agendaException.AgendaUnsupportedServiceOperationExcept;
import br.com.fiap.model.Agenda;
import br.com.fiap.service.agendaService.AgendaService;
import br.com.fiap.service.agendaService.AgendaServiceFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController // Indica que esta classe é um controlador REST (os métodos retornarão dados, normalmente em JSON)
@RequestMapping("/rest/agenda") // Define o caminho base para os endpoints deste controlador
public class AgendaController {

    // Cria uma instância do serviço de agenda utilizando um factory para desacoplar a criação do serviço
    private final AgendaService agendaService = AgendaServiceFactory.create();

    // Logger para registrar mensagens de log
    private static final Logger logger = LoggerFactory.getLogger(AgendaController.class);

    /**
     * Endpoint para criação de uma nova agenda.
     * Método HTTP POST que recebe um objeto AgendaDto no corpo da requisição.
     */
    @PostMapping
    public ResponseEntity<?> add(@RequestBody AgendaDto input) {
        // Verifica se o DTO não possui um código (pois este método é destinado apenas à criação de novas agendas)
        if (input.getCodigo() != null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensagem", "Este método só permite a criação de novas agendas sem código"));
        }
        try {
            // Cria uma nova instância da entidade Agenda e popula com os dados do DTO
            Agenda agenda = new Agenda();
            agenda.setDataAgendamento(input.getDataAgendamento());
            agenda.setObsAgenda(input.getObsAgenda());

            // Chama o serviço para criar a agenda e armazena o objeto persistido
            agenda = agendaService.create(agenda);

            // Retorna a agenda criada com status HTTP 201 (Created)
            return ResponseEntity.status(HttpStatus.CREATED).body(agenda);
        } catch (AgendaUnsupportedServiceOperationExcept e) {
            // Se a operação não for suportada, retorna status 400 (Bad Request) com a mensagem de erro
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        } catch (SQLException | AgendaNotSavedException e) {
            // Registra o erro no log e retorna status 500 (Internal Server Error)
            logger.error("Erro ao criar agenda: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar inserir uma agenda"));
        }
    }

    /**
     * Endpoint para recuperar todas as agendas.
     * Método HTTP GET na rota /rest/agenda/all.
     */
    @GetMapping("/all")
    public ResponseEntity<List<Agenda>> findAll() {
        // Chama o serviço para obter a lista de agendas
        List<Agenda> agendas = agendaService.findAll();
        // Se a lista estiver vazia, retorna status 204 (No Content)
        if (agendas == null || agendas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        // Caso existam agendas, retorna a lista com status 200 (OK)
        return ResponseEntity.ok(agendas);
    }

    /**
     * Endpoint para atualizar uma agenda existente.
     * Método HTTP PUT que recebe o ID da agenda na URL e os novos dados no corpo da requisição.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody AgendaDto input) {
        try {
            // Cria uma instância da entidade Agenda e popula com os dados do DTO, definindo o ID a ser atualizado
            Agenda agenda = new Agenda();
            agenda.setCodigo(id);
            agenda.setDataAgendamento(input.getDataAgendamento());
            agenda.setObsAgenda(input.getObsAgenda());

            // Chama o serviço para atualizar a agenda e armazena o objeto atualizado
            Agenda updated = agendaService.update(agenda);

            // Retorna a agenda atualizada com status 200 (OK)
            return ResponseEntity.ok(updated);
        } catch (AgendaNotFoundException e) {
            // Se a agenda não for encontrada para atualização, retorna status 404 (Not Found)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Agenda não encontrada para atualização"));
        } catch (SQLException e) {
            // Registra o erro e retorna status 500 (Internal Server Error)
            logger.error("Erro ao atualizar agenda: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar atualizar a agenda"));
        }
    }

    /**
     * Endpoint para deletar uma agenda.
     * Método HTTP DELETE que recebe o ID da agenda a ser removida na URL.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            // Chama o serviço para deletar a agenda pelo ID informado
            agendaService.deleteById(id);
            // Retorna status 204 (No Content) indicando que a exclusão foi bem-sucedida
            return ResponseEntity.noContent().build();
        } catch (AgendaNotFoundException e) {
            // Registra aviso e retorna status 404 (Not Found) caso a agenda não seja encontrada
            logger.warn("Agenda não encontrada para exclusão: ID " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Agenda não encontrada para exclusão"));
        } catch (SQLException e) {
            // Registra o erro e retorna status 500 (Internal Server Error)
            logger.error("Erro ao deletar agenda: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar deletar a agenda"));
        }
    }
}
