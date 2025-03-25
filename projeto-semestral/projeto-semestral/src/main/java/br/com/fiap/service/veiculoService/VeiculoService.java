package br.com.fiap.service.veiculoService;

import br.com.fiap.DAO.veiculoDAO.VeiculoDao;
import br.com.fiap.exceptions.veiculoException.VeiculoNotFoundException;
import br.com.fiap.exceptions.veiculoException.VeiculoNotSavedException;
import br.com.fiap.exceptions.veiculoException.VeiculoUnsupportedServiceOperationException;
import br.com.fiap.model.Veiculo;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public interface VeiculoService {

    Veiculo create(Veiculo veiculo) throws VeiculoUnsupportedServiceOperationException, SQLException, VeiculoNotSavedException;

    List<Veiculo> findall();

    Veiculo update (Veiculo veiculo) throws VeiculoNotFoundException, SQLException;

    void deleteById(Long id) throws VeiculoNotFoundException, SQLException;


}
