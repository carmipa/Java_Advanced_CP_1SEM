package br.com.fiap.DAO.pecasDAO;

import br.com.fiap.exceptions.pecasException.PecasNotFoundException;
import br.com.fiap.exceptions.pecasException.PecasNotSavedException;
import br.com.fiap.model.Pecas;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public interface PecasDao {

    List<Pecas> findAll();

    void deleteById(Long id, Connection connection) throws PecasNotFoundException, SQLException;

    Pecas save(Pecas pecas, Connection connection) throws SQLException, PecasNotSavedException;

    Pecas update(Pecas pecas, Connection connection) throws PecasNotFoundException, SQLException;
}
