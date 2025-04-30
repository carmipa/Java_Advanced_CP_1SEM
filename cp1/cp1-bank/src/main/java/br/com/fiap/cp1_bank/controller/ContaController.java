package br.com.fiap.cp1_bank.controller;

import br.com.fiap.cp1_bank.model.Conta;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/contas")
public class ContaController {

    private static final Logger log = LoggerFactory.getLogger(ContaController.class);
    private List<Conta> contas = new ArrayList<>();

    // Endpoint para cadastrar conta com validações
    @PostMapping
    public ResponseEntity<?> criarConta(@RequestBody Conta conta) {
        log.info("Recebendo solicitação para criar conta: {}", conta);

        // Validações
        if (conta.getNomeTitular() == null || conta.getNomeTitular().trim().isEmpty()) {
            log.warn("Tentativa de criar conta sem nome do titular.");
            return ResponseEntity.badRequest().body("Nome do titular é obrigatório");
        }
        if (conta.getCpfTitular() == null || conta.getCpfTitular().trim().isEmpty()) {
            log.warn("Tentativa de criar conta sem CPF do titular.");
            return ResponseEntity.badRequest().body("CPF do titular é obrigatório");
        }
        try {
            LocalDate dataAbertura = LocalDate.parse(conta.getDataAbertura());
            if (dataAbertura.isAfter(LocalDate.now())) {
                log.warn("Data de abertura no futuro: {}", conta.getDataAbertura());
                return ResponseEntity.badRequest().body("Data de abertura não pode ser no futuro");
            }
        } catch (DateTimeParseException e) {
            log.error("Erro ao processar data de abertura: {}", conta.getDataAbertura(), e);
            return ResponseEntity.badRequest().body("Data de abertura inválida");
        }
        if (conta.getSaldoInicial() < 0) {
            log.warn("Tentativa de criar conta com saldo negativo: {}", conta.getSaldoInicial());
            return ResponseEntity.badRequest().body("Saldo inicial não pode ser negativo");
        }

        // Valida o tipo da conta
        if (conta.getTipoConta() == null ||
                (!conta.getTipoConta().equalsIgnoreCase("corrente") &&
                        !conta.getTipoConta().equalsIgnoreCase("poupança") &&
                        !conta.getTipoConta().equalsIgnoreCase("salário"))) {
            log.warn("Tentativa de criar conta com tipo inválido: {}", conta.getTipoConta());
            return ResponseEntity.badRequest().body("Tipo de conta inválido. Deve ser 'corrente', 'poupança' ou 'salário'");
        }

        contas.add(conta);
        log.info("Conta criada com sucesso: {}", conta);
        return ResponseEntity.status(HttpStatus.CREATED).body(conta);
    }

    // Endpoint para listar com todas as contas
    @GetMapping
    public List<Conta> listarContas() {
        log.info("Listando todas as contas. Total: {}", contas.size());
        return contas;
    }

    // Endpoint para buscar uma conta pelo número
    @GetMapping("/{numero}")
    public ResponseEntity<Conta> buscarConta(@PathVariable long numero) {
        log.info("Buscando conta com número: {}", numero);
        Conta conta = contas.stream()
                .filter(c -> c.getNumero() == numero)
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("Conta não encontrada: {}", numero);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada");
                });

        log.info("Conta encontrada: {}", conta);
        return ResponseEntity.ok(conta);
    }

    // Endpoint para encerrar a conta (e marcar como inativa)
    @DeleteMapping("/{numero}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void encerrarConta(@PathVariable long numero) {
        log.info("Encerrando conta com número: {}", numero);
        Conta conta = contas.stream()
                .filter(c -> c.getNumero() == numero)
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("Tentativa de encerrar conta inexistente: {}", numero);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada");
                });

        conta.setAtiva(false);
        log.info("Conta encerrada com sucesso: {}", conta);
    }

    // Endpoint para fazer o  depósito
    @PostMapping("/{numero}/deposito")
    public ResponseEntity<?> depositar(@PathVariable long numero, @RequestParam double valor) {
        log.info("Tentando depositar {} na conta {}", valor, numero);
        Conta conta = contas.stream()
                .filter(c -> c.getNumero() == numero)
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("Tentativa de depósito em conta inexistente: {}", numero);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada");
                });

        if (valor <= 0) {
            log.warn("Tentativa de depósito com valor inválido: {}", valor);
            return ResponseEntity.badRequest().body("Valor de depósito deve ser positivo");
        }

        conta.setSaldoInicial(conta.getSaldoInicial() + valor);
        log.info("Depósito realizado com sucesso. Novo saldo: {}", conta.getSaldoInicial());
        return ResponseEntity.ok(conta);
    }

    // Endpoint para fazer o saque
    @PostMapping("/{numero}/saque")
    public ResponseEntity<?> sacar(@PathVariable long numero, @RequestParam double valor) {
        log.info("Tentando sacar {} da conta {}", valor, numero);
        Conta conta = contas.stream()
                .filter(c -> c.getNumero() == numero)
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("Tentativa de saque em conta inexistente: {}", numero);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada");
                });

        if (valor <= 0) {
            log.warn("Tentativa de saque com valor inválido: {}", valor);
            return ResponseEntity.badRequest().body("Valor de saque deve ser positivo");
        }
        if (valor > conta.getSaldoInicial()) {
            log.warn("Tentativa de saque maior que saldo. Saldo: {}, Saque: {}", conta.getSaldoInicial(), valor);
            return ResponseEntity.badRequest().body("Saldo insuficiente para saque");
        }

        conta.setSaldoInicial(conta.getSaldoInicial() - valor);
        log.info("Saque realizado com sucesso. Novo saldo: {}", conta.getSaldoInicial());
        return ResponseEntity.ok(conta);
    }

    // Endpoint para realizar o PIX entre as contas
    @PostMapping("/pix")
    public ResponseEntity<?> realizarPix(@RequestParam long contaOrigem,
                                         @RequestParam long contaDestino,
                                         @RequestParam double valor) {
        log.info("Tentando realizar PIX de {} da conta {} para a conta {}", valor, contaOrigem, contaDestino);

        Conta origem = contas.stream()
                .filter(c -> c.getNumero() == contaOrigem)
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("Conta de origem não encontrada: {}", contaOrigem);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta de origem não encontrada");
                });

        Conta destino = contas.stream()
                .filter(c -> c.getNumero() == contaDestino)
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("Conta de destino não encontrada: {}", contaDestino);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta de destino não encontrada");
                });

        if (valor <= 0) {
            log.warn("Tentativa de PIX com valor inválido: {}", valor);
            return ResponseEntity.badRequest().body("Valor do PIX deve ser positivo");
        }
        if (valor > origem.getSaldoInicial()) {
            log.warn("Tentativa de PIX maior que saldo disponível. Saldo: {}, Valor: {}", origem.getSaldoInicial(), valor);
            return ResponseEntity.badRequest().body("Saldo insuficiente na conta de origem");
        }

        origem.setSaldoInicial(origem.getSaldoInicial() - valor);
        destino.setSaldoInicial(destino.getSaldoInicial() + valor);
        log.info("PIX realizado com sucesso. Saldo origem: {}, Saldo destino: {}", origem.getSaldoInicial(), destino.getSaldoInicial());
        return ResponseEntity.ok(origem);
    }
}
