package br.com.fiap.exception;

public class ClientesNotFoundException extends RuntimeException{

    public ClientesNotFoundException(String message){
        super(message);
    }

    public ClientesNotFoundException(String message, Throwable cause){
        super(message, cause);
    }

}
