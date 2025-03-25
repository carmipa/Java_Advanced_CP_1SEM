package br.com.fiap.service.oficinaService;

import br.com.fiap.DAO.oficinaDAO.OficinaDaoFactory;
import br.com.fiap.DAO.oficinaDAO.OficinaDao;
import br.com.fiap.config.DatabaseConnectionFactory;
import br.com.fiap.exceptions.oficinaException.OficinaNotFoundException;
import br.com.fiap.exceptions.oficinaException.OficinaNotSavedException;
import br.com.fiap.exceptions.oficinaException.OficinaUnsupportedServiceOperationExcept;
import br.com.fiap.model.Oficina;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.logging.Logger;

public class OficinaServiceImpl implements OficinaService {

    private final OficinaDao dao = OficinaDaoFactory.create();
    private static final Logger logger = Logger.getLogger(OficinaServiceImpl.class.getName());

    @Override
    public Oficina create(Oficina oficina) throws OficinaUnsupportedServiceOperationExcept, SQLException, OficinaNotSavedException {
        if (oficina.getCodigo() == null) {
            try (Connection connection = DatabaseConnectionFactory.create().get()) {
                try {
                    connection.setAutoCommit(false);
                    logger.info("Iniciando criação da oficina...");
                    oficina = this.dao.save(oficina, connection);
                    connection.commit();
                    logger.info("Oficina criada com sucesso: ID " + oficina.getCodigo());
                    return oficina;
                } catch (OficinaNotSavedException e) {
                    connection.rollback();
                    logger.severe("Erro ao salvar a oficina: " + e.getMessage());
                    throw e;
                } catch (SQLException e) {
                    connection.rollback();
                    logger.severe("Erro de SQL ao salvar a oficina: " + e.getMessage());
                    throw new OficinaNotSavedException("Erro ao salvar a oficina: " + e.getMessage(), e);
                }
            } catch (SQLException e) {
                logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
                throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
            }
        } else {
            throw new OficinaUnsupportedServiceOperationExcept("Oficina já possui código (ID).");
        }
    }

    @Override
    public List<Oficina> findall() {
        logger.info("Buscando todas as oficinas...");
        List<Oficina> oficinas = this.dao.findAll();
        logger.info("Total de oficinas encontradas: " + oficinas.size());
        return oficinas;
    }

    @Override
    public Oficina update(Oficina oficina) throws OficinaNotFoundException, SQLException {
        try (Connection connection = DatabaseConnectionFactory.create().get()) {
            try {
                connection.setAutoCommit(false);
                logger.info("Iniciando atualização da oficina ID: " + oficina.getCodigo());
                oficina = this.dao.update(oficina, connection);
                connection.commit();
                logger.info("Oficina atualizada com sucesso: ID " + oficina.getCodigo());
                return oficina;
            } catch (OficinaNotFoundException e) {
                connection.rollback();
                logger.severe("Oficina não encontrada para atualização: ID " + oficina.getCodigo());
                throw e;
            } catch (SQLException e) {
                connection.rollback();
                logger.severe("Erro de SQL ao atualizar a oficina: " + e.getMessage());
                throw new SQLException("Erro ao atualizar a oficina: " + e.getMessage(), e);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
            throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteById(Long id) throws OficinaNotFoundException, SQLException {
        try (Connection connection = DatabaseConnectionFactory.create().get()) {
            try {
                connection.setAutoCommit(false);
                logger.info("Iniciando exclusão da oficina ID: " + id);
                this.dao.deleteById(id, connection);
                connection.commit();
                logger.info("Oficina excluída com sucesso: ID " + id);
            } catch (OficinaNotFoundException e) {
                connection.rollback();
                logger.severe("Oficina não encontrada para exclusão: ID " + id);
                throw e;
            } catch (SQLException e) {
                connection.rollback();
                logger.severe("Erro de SQL ao deletar a oficina: " + e.getMessage());
                throw new SQLException("Erro ao deletar a oficina: " + e.getMessage(), e);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
            throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
        }
    }
}
