package br.com.fiap.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class PecasNotFoundException extends RuntimeException{

    public PecasNotFoundException(String message) {
        super(message);
    }

    public PecasNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

}
