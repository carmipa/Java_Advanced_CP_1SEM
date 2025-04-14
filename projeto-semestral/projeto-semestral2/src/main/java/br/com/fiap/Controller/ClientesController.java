package br.com.fiap.Controller;

import br.com.fiap.DTO.ClientesDto;
import br.com.fiap.exceptions.clientesException.ClientesNotFoundException;
import br.com.fiap.exceptions.clientesException.ClientesNotSavedException;
import br.com.fiap.exceptions.clientesException.ClientesUnsupportedServiceOperationExcept;
import br.com.fiap.model.Clientes;
import br.com.fiap.model.Contato;
import br.com.fiap.model.Endereco;
import br.com.fiap.service.clientesService.ClientesService;
import br.com.fiap.service.clientesService.ClientesServiceFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController // Indica que essa classe é um controlador REST e que os métodos retornarão dados (ex.: JSON)
@RequestMapping("/rest/clientes") // Define o caminho base para os endpoints deste controlador
public class ClientesController {

    // Instancia o serviço de clientes utilizando um factory, promovendo desacoplamento
    private final ClientesService clientesService = ClientesServiceFactory.create();


    // Endpoint para criar um novo cliente via requisição HTTP POST
    @PostMapping
    public ResponseEntity<?> add(@RequestBody ClientesDto input) {
        // Verifica se o DTO possui código; se sim, não é permitido criar um novo cliente (o código é gerado no backend)
        if (input.getCodigo() != null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensagem", "Este método só permite a criação de novos clientes sem código"));
        }
        try {
            // Cria uma instância da entidade Clientes e popula com os dados recebidos
            Clientes clientes = new Clientes();
            clientes.setNome(input.getNome());
            clientes.setTipoCliente(input.getTipoCliente());
            clientes.setSobrenome(input.getSobrenome());
            clientes.setSexo(input.getSexo());
            clientes.setTipoDocumento(input.getTipoDocumento());
            clientes.setNumeroDocumento(input.getNumeroDocumento());
            clientes.setDataNascimento(input.getDataNascimento());
            clientes.setAtividadeProfissional(input.getAtividadeProfissional());

            // Verifica se há informações de endereço e as mapeia para a entidade Endereco
            if (input.getEndereco() != null) {
                Endereco endereco = new Endereco();
                endereco.setCep(input.getEndereco().getCep());
                endereco.setLogradouro(input.getEndereco().getLogradouro());
                endereco.setNumero(input.getEndereco().getNumero());
                endereco.setComplemento(input.getEndereco().getComplemento());
                endereco.setBairro(input.getEndereco().getBairro());
                endereco.setCidade(input.getEndereco().getCidade());
                endereco.setEstado(input.getEndereco().getEstado());
                clientes.setEndereco(endereco);
            }

            // Verifica se há informações de contato e as mapeia para a entidade Contato
            if (input.getContato() != null) {
                Contato contato = new Contato();
                contato.setCelular(input.getContato().getCelular());
                contato.setEmail(input.getContato().getEmail());
                contato.setContato(input.getContato().getContato());
                clientes.setContato(contato);
            }

            // Chama o serviço para criar o cliente e armazena o resultado
            Clientes saved = clientesService.create(clientes);
            // Retorna o cliente criado com status HTTP 201 (Created)
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (ClientesUnsupportedServiceOperationExcept e) {
            // Caso a operação não seja suportada, retorna status 400 (Bad Request) com mensagem de erro
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        } catch (SQLException | ClientesNotSavedException e) {
            // Se ocorrer um erro de SQL ou falha ao salvar, retorna status 500 (Internal Server Error)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar inserir um cliente"));
        }
    }

    // Endpoint para obter todos os clientes via requisição HTTP GET na rota /rest/clientes/all
    @GetMapping("/all")
    public ResponseEntity<List<Clientes>> findAll() {
        List<Clientes> clientes = clientesService.findAll();
        if (clientes == null || clientes.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(clientes);
    }

    @GetMapping
    public ResponseEntity<List<Clientes>> findAllDefault() {
        List<Clientes> clientes = clientesService.findAll();
        if (clientes == null || clientes.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(clientes);
    }

    // Endpoint para atualizar um cliente existente via requisição HTTP PUT
    // O ID do cliente a ser atualizado é passado como parte da URL
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ClientesDto input) {
        try {
            // Cria uma instância da entidade Clientes e configura o ID e demais dados do DTO
            Clientes clientes = new Clientes();
            clientes.setCodigo(id);
            clientes.setNome(input.getNome());
            clientes.setTipoCliente(input.getTipoCliente());
            clientes.setSobrenome(input.getSobrenome());
            clientes.setSexo(input.getSexo());
            clientes.setTipoDocumento(input.getTipoDocumento());
            clientes.setNumeroDocumento(input.getNumeroDocumento());
            clientes.setDataNascimento(input.getDataNascimento());
            clientes.setAtividadeProfissional(input.getAtividadeProfissional());

            // Mapeia os dados de endereço, se presentes, para a entidade Endereco
            if (input.getEndereco() != null) {
                Endereco endereco = new Endereco();
                endereco.setCep(input.getEndereco().getCep());
                endereco.setLogradouro(input.getEndereco().getLogradouro());
                endereco.setNumero(input.getEndereco().getNumero());
                endereco.setComplemento(input.getEndereco().getComplemento());
                endereco.setBairro(input.getEndereco().getBairro());
                endereco.setCidade(input.getEndereco().getCidade());
                endereco.setEstado(input.getEndereco().getEstado());
                clientes.setEndereco(endereco);
            }

            // Mapeia os dados de contato, se presentes, para a entidade Contato
            if (input.getContato() != null) {
                Contato contato = new Contato();
                contato.setCelular(input.getContato().getCelular());
                contato.setEmail(input.getContato().getEmail());
                contato.setContato(input.getContato().getContato());
                clientes.setContato(contato);
            }

            // Chama o serviço para atualizar o cliente e armazena o resultado
            Clientes updated = clientesService.update(clientes);
            // Retorna o cliente atualizado com status HTTP 200 (OK)
            return ResponseEntity.ok(updated);
        } catch (ClientesNotFoundException e) {
            // Se o cliente não for encontrado, retorna status 404 (Not Found) com mensagem de erro
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Cliente não encontrado para atualização"));
        } catch (SQLException e) {
            // Em caso de erro durante a atualização, retorna status 500 (Internal Server Error)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar atualizar o cliente"));
        }
    }

    // Endpoint para deletar um cliente via requisição HTTP DELETE
    // O ID do cliente a ser removido é informado na URL
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            // Chama o serviço para deletar o cliente com o ID informado
            clientesService.deleteById(id);
            // Retorna status HTTP 204 (No Content) indicando que a exclusão foi bem-sucedida
            return ResponseEntity.noContent().build();
        } catch (ClientesNotFoundException e) {
            // Se o cliente não for encontrado, retorna status 404 (Not Found)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensagem", "Cliente não encontrado para exclusão"));
        } catch (SQLException e) {
            // Em caso de erro ao deletar, retorna status 500 (Internal Server Error)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensagem", "Erro inesperado ao tentar deletar o cliente"));
        }
    }
}
