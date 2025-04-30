package br.com.fiap.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class EnderecoNotFoundException extends RuntimeException{

    public EnderecoNotFoundException(String message) {
        super(message);
    }

    public EnderecoNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

}
