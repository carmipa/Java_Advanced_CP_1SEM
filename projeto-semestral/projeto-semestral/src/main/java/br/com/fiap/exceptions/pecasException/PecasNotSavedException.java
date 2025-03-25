package br.com.fiap.exceptions.pecasException;

public class PecasNotSavedException extends Exception{
    public PecasNotSavedException(String message) {
        super(message);
    }

    public PecasNotSavedException(String message, Throwable cause){
        super(message, cause);
    }
}
