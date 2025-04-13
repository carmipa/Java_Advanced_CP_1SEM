package br.com.fiap.exceptions.clientesException;

public class ClientesNotSavedException extends Exception {

    public ClientesNotSavedException(String message) {
        super(message);
    }

    public ClientesNotSavedException(String message, Throwable cause) {
        super(message, cause);
    }
}
