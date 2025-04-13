package br.com.fiap.exceptions.oficinaException;

public class OficinaNotFoundException extends Exception{
    public OficinaNotFoundException(String message) {
        super(message);
    }

    public OficinaNotFoundException(String message, Throwable cause){
        super(message, cause);
    }
}
