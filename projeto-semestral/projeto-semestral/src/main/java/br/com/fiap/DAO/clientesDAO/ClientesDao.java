package br.com.fiap.DAO.clientesDAO;

import br.com.fiap.exceptions.clientesException.ClientesNotFoundException;
import br.com.fiap.exceptions.clientesException.ClientesNotSavedException;
import br.com.fiap.model.Clientes;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public interface ClientesDao {

   List<Clientes> findAll();

   void deleteById(Long id, Connection connection) throws ClientesNotFoundException, SQLException;

   Clientes save(Clientes clientes, Connection connection) throws SQLException, ClientesNotSavedException;

   Clientes update(Clientes clientes, Connection connection) throws ClientesNotFoundException, SQLException;



}
