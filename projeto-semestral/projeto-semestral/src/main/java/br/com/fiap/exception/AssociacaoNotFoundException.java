// --- src/main/java/br/com/fiap/exception/AssociacaoNotFoundException.java ---
package br.com.fiap.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND) // Retorna 404 Not Found
public class AssociacaoNotFoundException extends RuntimeException {
    public AssociacaoNotFoundException(String message) {
        super(message);
    }
}