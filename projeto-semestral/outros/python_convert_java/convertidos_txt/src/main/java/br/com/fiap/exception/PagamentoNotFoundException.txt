package br.com.fiap.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class PagamentoNotFoundException extends RuntimeException {

    public PagamentoNotFoundException(String message) {
        super(message);
    }

    public PagamentoNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

}
