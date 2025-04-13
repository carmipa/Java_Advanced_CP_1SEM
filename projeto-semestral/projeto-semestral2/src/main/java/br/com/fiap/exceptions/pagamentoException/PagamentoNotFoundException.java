package br.com.fiap.exceptions.pagamentoException;

public class PagamentoNotFoundException extends Exception{
    public PagamentoNotFoundException(String message) {
        super(message);
    }

    public PagamentoNotFoundException(String message, Throwable cause){
        super(message);
    }
}
