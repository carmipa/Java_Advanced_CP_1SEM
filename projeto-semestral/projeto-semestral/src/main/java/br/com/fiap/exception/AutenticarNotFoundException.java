package br.com.fiap.exception;

public class AutenticarNotFoundException extends RuntimeException{

    public AutenticarNotFoundException(String message) {
        super(message);
    }

    public AutenticarNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

}
