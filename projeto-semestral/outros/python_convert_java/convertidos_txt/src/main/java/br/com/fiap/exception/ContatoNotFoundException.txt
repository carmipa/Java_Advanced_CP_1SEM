package br.com.fiap.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ContatoNotFoundException extends RuntimeException {

    public ContatoNotFoundException(String message) {
        super(message);
    }

    public ContatoNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

}
