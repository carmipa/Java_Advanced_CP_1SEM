package br.com.fiap.service.pecasService;

import br.com.fiap.exceptions.pecasException.PecasNotFoundException;
import br.com.fiap.exceptions.pecasException.PecasNotSavedException;
import br.com.fiap.exceptions.pecasException.PecasUnsupportedServiceOperationException;
import br.com.fiap.model.Pecas;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public interface PecasService {
    Pecas create(Pecas pecas) throws PecasUnsupportedServiceOperationException, SQLException, PecasNotSavedException;

    List<Pecas> findaall();

    Pecas update(Pecas pecas) throws PecasNotFoundException, SQLException;

    void deleteById(Long id) throws PecasNotFoundException, SQLException;
}