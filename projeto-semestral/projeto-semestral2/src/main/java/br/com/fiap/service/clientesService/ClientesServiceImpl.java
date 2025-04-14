package br.com.fiap.service.clientesService;

import br.com.fiap.DAO.clientesDAO.ClientesDao;
import br.com.fiap.DAO.clientesDAO.ClientesDaoFactory;
import br.com.fiap.config.DatabaseConnectionFactory;
import br.com.fiap.exceptions.clientesException.ClientesNotFoundException;
import br.com.fiap.exceptions.clientesException.ClientesNotSavedException;
import br.com.fiap.exceptions.clientesException.ClientesUnsupportedServiceOperationExcept;
import br.com.fiap.model.Clientes;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.logging.Logger;

public final class ClientesServiceImpl implements ClientesService{

    private final ClientesDao dao = ClientesDaoFactory.create();
    private static final Logger logger = Logger.getLogger(ClientesServiceImpl.class.getName());


    @Override
    public Clientes create(Clientes clientes) throws ClientesUnsupportedServiceOperationExcept, SQLException, ClientesNotSavedException {
        if (clientes.getCodigo() == null) {
            try (Connection connection = DatabaseConnectionFactory.create().get()) {
                try {
                    connection.setAutoCommit(false);
                    logger.info("Iniciando criação do cliente...");
                    clientes = this.dao.save(clientes, connection);
                    connection.commit();
                    logger.info("Cliente criado com sucesso: ID " + clientes.getCodigo());
                    return clientes;
                } catch (SQLException e) {
                    connection.rollback();
                    logger.severe("Erro ao salvar o cliente (SQLException): " + e.getMessage());
                    throw new ClientesNotSavedException("Erro ao salvar o cliente: " + e.getMessage(), e);
                } catch (ClientesNotSavedException e) {
                    connection.rollback();
                    logger.severe("Erro ao salvar o cliente (ClientesNotSavedException): " + e.getMessage());
                    throw e;  // Re-lança a exceção para ser tratada em nível superior
                }
            } catch (SQLException e) {
                logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
                throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
            }
        } else {
            throw new ClientesUnsupportedServiceOperationExcept("Cliente já possui código (ID).");
        }
    }

    @Override
    public List<Clientes> findAll() {
        logger.info("Buscando todos os clientes...");
        List<Clientes> clientes = this.dao.findAll();
        logger.info("Total de clientes encontrados: " + clientes.size());
        return clientes;
    }

    @Override
    public Clientes update(Clientes clientes) throws ClientesNotFoundException, SQLException {
        try (Connection connection = DatabaseConnectionFactory.create().get()) {
            try {
                connection.setAutoCommit(false);
                logger.info("Iniciando atualização do cliente ID: " + clientes.getCodigo());
                clientes = this.dao.update(clientes, connection);
                connection.commit();
                logger.info("Cliente atualizado com sucesso: ID " + clientes.getCodigo());
                return clientes;
            } catch (SQLException e) {
                connection.rollback();
                logger.severe("Erro ao atualizar o cliente: " + e.getMessage());
                throw new SQLException("Erro ao atualizar o cliente: " + e.getMessage(), e);
            } catch (ClientesNotFoundException e) {
                connection.rollback();
                logger.severe("Cliente não encontrado para atualização: ID " + clientes.getCodigo());
                throw e;
            }
        } catch (SQLException e) {
            logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
            throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteById(Long id) throws ClientesNotFoundException, SQLException {
        try (Connection connection = DatabaseConnectionFactory.create().get()) {
            try {
                connection.setAutoCommit(false);
                logger.info("Iniciando exclusão do cliente ID: " + id);
                this.dao.deleteById(id, connection);
                connection.commit();
                logger.info("Cliente excluído com sucesso: ID " + id);
            } catch (SQLException e) {
                connection.rollback();
                logger.severe("Erro ao deletar o cliente: " + e.getMessage());
                throw new SQLException("Erro ao deletar o cliente: " + e.getMessage(), e);
            } catch (ClientesNotFoundException e) {
                connection.rollback();
                logger.severe("Cliente não encontrado para exclusão: ID " + id);
                throw e;
            }
        } catch (SQLException e) {
            logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
            throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
        }
    }

}




