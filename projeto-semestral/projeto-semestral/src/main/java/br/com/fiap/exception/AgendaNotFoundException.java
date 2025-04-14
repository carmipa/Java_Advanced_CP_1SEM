package br.com.fiap.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;


@ResponseStatus(HttpStatus.NOT_FOUND)
public class AgendaNotFoundException extends RuntimeException{

    public AgendaNotFoundException(String message) {
        super(message);
    }


    public AgendaNotFoundException(String message, Throwable cause) {
        super(message, cause); // Chama o construtor de RuntimeException que aceita mensagem e causa
    }


}
