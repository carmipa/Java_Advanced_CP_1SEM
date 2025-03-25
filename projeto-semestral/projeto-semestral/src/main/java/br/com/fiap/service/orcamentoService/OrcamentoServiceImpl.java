package br.com.fiap.service.orcamentoService;

import br.com.fiap.DAO.orcarmentoDAO.OrcamentoDao;
import br.com.fiap.DAO.orcarmentoDAO.OrcamentoDaoFactory;
import br.com.fiap.config.DatabaseConnectionFactory;
import br.com.fiap.exceptions.orcamentoException.OrcamentoNotFoundException;
import br.com.fiap.exceptions.orcamentoException.OrcamentoNotSavedException;
import br.com.fiap.exceptions.orcamentoException.OrcamentoUnsupportedServiceOperationException;
import br.com.fiap.model.Orcamento;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.logging.Logger;

public class OrcamentoServiceImpl implements OrcamentoService {

    private final OrcamentoDao dao = OrcamentoDaoFactory.create();
    private static final Logger logger = Logger.getLogger(OrcamentoServiceImpl.class.getName());

    @Override
    public Orcamento create(Orcamento orcamento) throws OrcamentoUnsupportedServiceOperationException, SQLException, OrcamentoNotSavedException {
        if (orcamento.getCodigo() == null) {
            try (Connection connection = DatabaseConnectionFactory.create().get()) {
                try {
                    connection.setAutoCommit(false);
                    logger.info("Iniciando criação do orçamento...");
                    orcamento = this.dao.save(orcamento, connection);
                    connection.commit();
                    logger.info("Orçamento criado com sucesso: ID " + orcamento.getCodigo());
                    return orcamento;
                } catch (OrcamentoNotSavedException e) {
                    connection.rollback();
                    logger.severe("Erro ao salvar o orçamento: " + e.getMessage());
                    throw e;
                } catch (SQLException e) {
                    connection.rollback();
                    logger.severe("Erro de SQL ao salvar o orçamento: " + e.getMessage());
                    throw new OrcamentoNotSavedException("Erro ao salvar o orçamento: " + e.getMessage(), e);
                }
            } catch (SQLException e) {
                logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
                throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
            }
        } else {
            throw new OrcamentoUnsupportedServiceOperationException("Orçamento já possui código (ID).");
        }
    }

    @Override
    public List<Orcamento> findAll() {
        logger.info("Buscando todos os orçamentos...");
        List<Orcamento> orcamentos = this.dao.findAll();
        logger.info("Total de orçamentos encontrados: " + orcamentos.size());
        return orcamentos;
    }

    @Override
    public Orcamento update(Orcamento orcamento) throws OrcamentoNotFoundException, SQLException {
        try (Connection connection = DatabaseConnectionFactory.create().get()) {
            try {
                connection.setAutoCommit(false);
                logger.info("Iniciando atualização do orçamento ID: " + orcamento.getCodigo());
                orcamento = this.dao.update(orcamento, connection);
                connection.commit();
                logger.info("Orçamento atualizado com sucesso: ID " + orcamento.getCodigo());
                return orcamento;
            } catch (OrcamentoNotFoundException e) {
                connection.rollback();
                logger.severe("Orçamento não encontrado para atualização: ID " + orcamento.getCodigo());
                throw e;
            } catch (SQLException e) {
                connection.rollback();
                logger.severe("Erro de SQL ao atualizar o orçamento: " + e.getMessage());
                throw new SQLException("Erro ao atualizar o orçamento: " + e.getMessage(), e);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
            throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteById(Long id) throws OrcamentoNotFoundException, SQLException {
        try (Connection connection = DatabaseConnectionFactory.create().get()) {
            try {
                connection.setAutoCommit(false);
                logger.info("Iniciando exclusão do orçamento ID: " + id);
                this.dao.deleteById(id, connection);
                connection.commit();
                logger.info("Orçamento excluído com sucesso: ID " + id);
            } catch (OrcamentoNotFoundException e) {
                connection.rollback();
                logger.severe("Orçamento não encontrado para exclusão: ID " + id);
                throw e;
            } catch (SQLException e) {
                connection.rollback();
                logger.severe("Erro de SQL ao deletar o orçamento: " + e.getMessage());
                throw new SQLException("Erro ao deletar o orçamento: " + e.getMessage(), e);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
            throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
        }
    }
}
