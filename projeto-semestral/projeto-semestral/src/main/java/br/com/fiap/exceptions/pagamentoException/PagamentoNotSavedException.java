package br.com.fiap.exceptions.pagamentoException;

public class PagamentoNotSavedException extends Exception {
    public PagamentoNotSavedException(String message) {
        super(message);
    }

    public PagamentoNotSavedException(String message, Throwable cause){
        super(message, cause);
    }

}
