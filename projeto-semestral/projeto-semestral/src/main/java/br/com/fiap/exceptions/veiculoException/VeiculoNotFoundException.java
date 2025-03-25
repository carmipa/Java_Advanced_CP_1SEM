package br.com.fiap.exceptions.veiculoException;

public class VeiculoNotFoundException extends Exception{
    public VeiculoNotFoundException(String message) {
        super(message);
    }

    public VeiculoNotFoundException(String message, Throwable cause){
        super(message, cause);
    }
}
