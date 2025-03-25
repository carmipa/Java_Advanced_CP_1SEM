package br.com.fiap.service.pecasService;

import br.com.fiap.DAO.pecasDAO.PecasDao;
import br.com.fiap.DAO.pecasDAO.PecasDaoFactory;
import br.com.fiap.config.DatabaseConnectionFactory;
import br.com.fiap.exceptions.pagamentoException.PagamentoNotFoundException;
import br.com.fiap.exceptions.pecasException.PecasNotFoundException;
import br.com.fiap.exceptions.pecasException.PecasNotSavedException;
import br.com.fiap.exceptions.pecasException.PecasUnsupportedServiceOperationException;
import br.com.fiap.model.Pecas;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.logging.Logger;


public class PecasServiceImpl implements PecasService{

    private final PecasDao dao = PecasDaoFactory.create();
    private static final Logger logger = Logger.getLogger(PecasServiceImpl.class.getName());

    @Override
    public Pecas create(Pecas pecas) throws PecasUnsupportedServiceOperationException, SQLException, PecasNotSavedException {
        if (pecas.getCodigo() == null) {
            try (Connection connection = DatabaseConnectionFactory.create().get()) {
                try {
                    connection.setAutoCommit(false);
                    logger.info("Iniciando criação da peça...");
                    pecas = this.dao.save(pecas, connection);
                    connection.commit();
                    logger.info("Peça criada com sucesso: ID " + pecas.getCodigo());
                    return pecas;
                } catch (PecasNotSavedException e) {
                    connection.rollback();
                    logger.severe("Erro ao salvar a peça: " + e.getMessage());
                    throw e;
                } catch (SQLException e) {
                    connection.rollback();
                    logger.severe("Erro de SQL ao salvar a peça: " + e.getMessage());
                    throw new PecasNotSavedException("Erro ao salvar a peça: " + e.getMessage(), e);
                }
            } catch (SQLException | PecasNotSavedException e) {
                logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
                throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
            }
        } else {
            throw new PecasUnsupportedServiceOperationException("Peça já possui código (ID).");
        }
    }

    @Override
    public List<Pecas> findaall() {
        logger.info("Buscando todas as peças...");
        List<Pecas> pecas = this.dao.findAll();
        logger.info("Total de peças encontradas: " + pecas.size());
        return pecas;
    }

    @Override
    public Pecas update(Pecas pecas) throws PecasNotFoundException, SQLException {
        // Implementação...
        try (Connection connection = DatabaseConnectionFactory.create().get()) {
            try {
                connection.setAutoCommit(false);
                logger.info("Iniciando atualização da peça ID: " + pecas.getCodigo());
                pecas = this.dao.update(pecas, connection);
                connection.commit();
                logger.info("Peça atualizada com sucesso: ID " + pecas.getCodigo());
                return pecas;
            } catch (PecasNotFoundException e) {
                connection.rollback();
                logger.severe("Peça não encontrada para atualização: ID " + pecas.getCodigo());
                throw e;
            } catch (SQLException e) {
                connection.rollback();
                logger.severe("Erro de SQL ao atualizar a peça: " + e.getMessage());
                throw new SQLException("Erro ao atualizar a peça: " + e.getMessage(), e);
            }
        } catch (SQLException | PecasNotFoundException e) {
            logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
            throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteById(Long id) throws PecasNotFoundException, SQLException {

        try (Connection connection = DatabaseConnectionFactory.create().get()) {
            try {
                connection.setAutoCommit(false);
                logger.info("Iniciando exclusão da peça ID: " + id);
                this.dao.deleteById(id, connection);
                connection.commit();
                logger.info("Peça excluída com sucesso: ID " + id);
            } catch (PecasNotFoundException e) {
                connection.rollback();
                logger.severe("Peça não encontrada para exclusão: ID " + id);
                throw e;
            } catch (SQLException e) {
                connection.rollback();
                logger.severe("Erro de SQL ao deletar a peça: " + e.getMessage());
                throw new SQLException("Erro ao deletar a peça: " + e.getMessage(), e);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
            throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
        }

    }
}
