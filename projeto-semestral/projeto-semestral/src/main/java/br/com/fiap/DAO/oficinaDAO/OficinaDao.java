package br.com.fiap.DAO.oficinaDAO;

import br.com.fiap.exceptions.oficinaException.OficinaNotFoundException;
import br.com.fiap.exceptions.oficinaException.OficinaNotSavedException;
import br.com.fiap.model.Oficina;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public interface OficinaDao {

    List<Oficina> findAll();

    void deleteById(Long id, Connection connection) throws OficinaNotFoundException, SQLException;

    Oficina save(Oficina oficina, Connection connection) throws SQLException, OficinaNotSavedException;

    Oficina update(Oficina oficina, Connection connection) throws OficinaNotFoundException, SQLException;
}
