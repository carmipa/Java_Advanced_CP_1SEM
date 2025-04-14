package br.com.fiap.exceptions.oficinaException;

public class OficinaNotSavedException extends Exception{
    public OficinaNotSavedException(String message) {
        super(message);
    }

    public OficinaNotSavedException(String message, Throwable cause){
        super(message, cause);
    }
}
