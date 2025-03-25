package br.com.fiap.service.veiculoService;


import br.com.fiap.DAO.veiculoDAO.VeiculoDao;
import br.com.fiap.DAO.veiculoDAO.VeiculoDaoFactory;
import br.com.fiap.config.DatabaseConnectionFactory;
import br.com.fiap.exceptions.veiculoException.VeiculoNotFoundException;

import br.com.fiap.exceptions.veiculoException.VeiculoNotSavedException;
import br.com.fiap.exceptions.veiculoException.VeiculoUnsupportedServiceOperationException;
import br.com.fiap.model.Veiculo;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.logging.Logger;

public class VeiculoServiceImpl implements VeiculoService{

    private final VeiculoDao dao = VeiculoDaoFactory.create();
    private static final Logger logger = Logger.getLogger(VeiculoServiceImpl.class.getName());


    @Override
    public Veiculo create(Veiculo veiculo) throws VeiculoUnsupportedServiceOperationException, SQLException, VeiculoNotSavedException {
        if (veiculo.getCodigo() == null) {
            try (Connection connection = DatabaseConnectionFactory.create().get()) {
                try {
                    connection.setAutoCommit(false);
                    logger.info("Iniciando criação do veículo...");
                    veiculo = this.dao.save(veiculo, connection);
                    connection.commit();
                    logger.info("Veículo criado com sucesso: ID " + veiculo.getCodigo());
                    return veiculo;
                } catch (VeiculoNotSavedException e) {
                    connection.rollback();
                    logger.severe("Erro ao salvar o veículo: " + e.getMessage());
                    throw e;
                } catch (SQLException e) {
                    connection.rollback();
                    logger.severe("Erro de SQL ao salvar o veículo: " + e.getMessage());
                    throw new VeiculoNotSavedException("Erro ao salvar o veículo: " + e.getMessage(), e);
                }
            } catch (SQLException | VeiculoNotSavedException e) {
                logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
                throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
            }
        } else {
            throw new VeiculoUnsupportedServiceOperationException("Veículo já possui código (ID).");
        }
    }

    @Override
    public List<Veiculo> findall() {
        logger.info("Buscando todos os veículos...");
        List<Veiculo> veiculos = this.dao.findAll();
        logger.info("Total de veículos encontrados: " + veiculos.size());
        return veiculos;
    }

    @Override
    public Veiculo update(Veiculo veiculo) throws VeiculoNotFoundException, SQLException {
        try (Connection connection = DatabaseConnectionFactory.create().get()) {
            try {
                connection.setAutoCommit(false);
                logger.info("Iniciando atualização do veículo ID: " + veiculo.getCodigo());
                veiculo = this.dao.update(veiculo, connection);
                connection.commit();
                logger.info("Veículo atualizado com sucesso: ID " + veiculo.getCodigo());
                return veiculo;
            } catch (VeiculoNotFoundException e) {
                connection.rollback();
                logger.severe("Veículo não encontrado para atualização: ID " + veiculo.getCodigo());
                throw e;
            } catch (SQLException e) {
                connection.rollback();
                logger.severe("Erro de SQL ao atualizar o veículo: " + e.getMessage());
                throw new SQLException("Erro ao atualizar o veículo: " + e.getMessage(), e);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
            throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteById(Long id) throws VeiculoNotFoundException, SQLException {

        try (Connection connection = DatabaseConnectionFactory.create().get()) {
            try {
                connection.setAutoCommit(false);
                logger.info("Iniciando exclusão do veículo ID: " + id);
                this.dao.deleteById(id, connection);
                connection.commit();
                logger.info("Veículo excluído com sucesso: ID " + id);
            } catch (VeiculoNotFoundException e) {
                connection.rollback();
                logger.severe("Veículo não encontrado para exclusão: ID " + id);
                throw e;
            } catch (SQLException e) {
                connection.rollback();
                logger.severe("Erro de SQL ao deletar o veículo: " + e.getMessage());
                throw new SQLException("Erro ao deletar o veículo: " + e.getMessage(), e);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
            throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
        }

    }
}
