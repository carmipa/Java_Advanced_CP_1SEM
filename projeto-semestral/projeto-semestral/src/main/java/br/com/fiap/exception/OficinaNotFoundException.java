package br.com.fiap.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class OficinaNotFoundException extends RuntimeException{

    public OficinaNotFoundException(String message) {
        super(message);
    }

    public OficinaNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

}
