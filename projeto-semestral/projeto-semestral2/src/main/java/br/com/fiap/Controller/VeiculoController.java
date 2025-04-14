package br.com.fiap.Controller;

import br.com.fiap.DTO.VeiculoDto;
import br.com.fiap.exceptions.veiculoException.VeiculoNotFoundException;
import br.com.fiap.exceptions.veiculoException.VeiculoNotSavedException;
import br.com.fiap.exceptions.veiculoException.VeiculoUnsupportedServiceOperationException;
import br.com.fiap.model.Veiculo;
import br.com.fiap.service.veiculoService.VeiculoService;
import br.com.fiap.service.veiculoService.VeiculoServiceFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController // Define que a classe é um controlador REST e seus métodos retornarão dados (normalmente em JSON)
@RequestMapping("/rest/veiculo") // Define a rota base para os endpoints deste controlador
public class VeiculoController {

    // Cria a instância do serviço de veículo utilizando um factory para desacoplar a criação do serviço
    private final VeiculoService veiculoService = VeiculoServiceFactory.create();

    // Logger para registrar mensagens e erros
    private static final Logger logger = LoggerFactory.getLogger(VeiculoController.class);

    /**
     * Endpoint para criação de um novo veículo.
     * Método HTTP POST que recebe um objeto VeiculoDto no corpo da requisição.
     */
    @PostMapping
    public ResponseEntity<?> add(@RequestBody VeiculoDto input) {
        // Verifica se o DTO não possui código, garantindo que esse método seja usado apenas para criação
        if (input.getCodigo() != null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensagem", "Este método só permite a criação de novos veículos sem código"));
        }
        try {
            // Cria uma nova instância da entidade Veiculo e popula com os dados do DTO
            Veiculo veiculo = new Veiculo();
            // Suponha que aqui você defina as propriedades do veículo a partir do DTO
            veiculo.setTipoVeiculo(input.getTipoVeiculo());
            veiculo.setRenavam(input.getRenavam());
            veiculo.setPlaca(input.getPlaca());
            veiculo.setProprietario(input.getProprietario());
            veiculo.setModelo(input.getModelo());
            veiculo.setCor(input.getCor());
            veiculo.setMontadora(input.getMontadora());
            veiculo.setMotor(input.getMotor());
            veiculo.setAnofabricacao(input.getAnofabricacao());

            // Chama o serviço para criar o veículo e obtém a entidade persistida
            veiculo = veiculoService.create(veiculo);

            // Retorna o veículo criado com status HTTP 201 (Created)
            return ResponseEntity.status(HttpStatus.CREATED).body(veiculo);
        } catch (VeiculoUnsupportedServiceOperationException e) {
            // Retorna status 400 (Bad Request) se a operação não for suportada
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        } catch (SQLException | VeiculoNotSavedException e) {
            // Registra o erro e retorna status 500 (Internal Server Error) para erros inesperados
            logger.error("Erro ao criar veículo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar inserir um veículo"));
        }
    }

    /**
     * Endpoint para recuperar todos os veículos.
     * Método HTTP GET na rota /rest/veiculo/all.
     */
    @GetMapping("/all")
    public ResponseEntity<List<Veiculo>> findAll() {
        // Chama o serviço para obter a lista de veículos
        List<Veiculo> veiculos = veiculoService.findall();
        // Se a lista estiver vazia ou nula, retorna status 204 (No Content)
        if (veiculos == null || veiculos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        // Retorna a lista de veículos com status 200 (OK)
        return ResponseEntity.ok(veiculos);
    }

    /**
     * Endpoint para atualizar um veículo existente.
     * Método HTTP PUT que recebe o ID do veículo na URL e os novos dados no corpo da requisição.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody VeiculoDto input) {
        try {
            // Cria uma instância da entidade Veiculo e popula com os dados do DTO, definindo o ID para atualização
            Veiculo veiculo = new Veiculo();
            veiculo.setCodigo(id);
            veiculo.setTipoVeiculo(input.getTipoVeiculo());
            veiculo.setRenavam(input.getRenavam());
            veiculo.setPlaca(input.getPlaca());
            veiculo.setProprietario(input.getProprietario());
            veiculo.setModelo(input.getModelo());
            veiculo.setCor(input.getCor());
            veiculo.setMontadora(input.getMontadora());
            veiculo.setMotor(input.getMotor());
            veiculo.setAnofabricacao(input.getAnofabricacao());

            // Chama o serviço para atualizar o veículo e obtém a entidade atualizada
            Veiculo updated = veiculoService.update(veiculo);

            // Retorna o veículo atualizado com status 200 (OK)
            return ResponseEntity.ok(updated);
        } catch (VeiculoNotFoundException e) {
            // Retorna status 404 (Not Found) se o veículo não for encontrado para atualização
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Veículo não encontrado para atualização"));
        } catch (SQLException e) {
            // Registra o erro e retorna status 500 (Internal Server Error) para erros inesperados
            logger.error("Erro ao atualizar veículo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar atualizar o veículo"));
        }
    }

    /**
     * Endpoint para deletar um veículo.
     * Método HTTP DELETE que recebe o ID do veículo a ser removido na URL.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            // Chama o serviço para deletar o veículo pelo ID informado
            veiculoService.deleteById(id);
            // Retorna status 204 (No Content) indicando que a exclusão foi bem-sucedida
            return ResponseEntity.noContent().build();
        } catch (VeiculoNotFoundException e) {
            // Registra aviso e retorna status 404 (Not Found) se o veículo não for encontrado para exclusão
            logger.warn("Veículo não encontrado para exclusão: ID " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Veículo não encontrado para exclusão"));
        } catch (SQLException e) {
            // Registra o erro e retorna status 500 (Internal Server Error) para erros inesperados
            logger.error("Erro ao deletar veículo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar deletar o veículo"));
        }
    }
}
