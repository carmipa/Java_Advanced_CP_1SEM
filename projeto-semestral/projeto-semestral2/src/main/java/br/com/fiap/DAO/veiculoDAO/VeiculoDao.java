package br.com.fiap.DAO.veiculoDAO;

import br.com.fiap.exceptions.veiculoException.VeiculoNotFoundException;
import br.com.fiap.exceptions.veiculoException.VeiculoNotSavedException;
import br.com.fiap.model.Veiculo;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public interface VeiculoDao {

   List<Veiculo> findAll();

   void deleteById(Long id, Connection connection) throws VeiculoNotFoundException, SQLException;

   Veiculo save(Veiculo veiculo, Connection connection) throws SQLException, VeiculoNotSavedException;

   Veiculo update(Veiculo veiculo, Connection connection) throws VeiculoNotFoundException, SQLException;
}
