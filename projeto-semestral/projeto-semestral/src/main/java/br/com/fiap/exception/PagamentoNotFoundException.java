package br.com.fiap.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND) // Faz o Spring retornar HTTP 404 automaticamente quando essa exceção é lançada do controller
public class PagamentoNotFoundException extends RuntimeException {

    public PagamentoNotFoundException(String message) {
        super(message);
    }

    public PagamentoNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}