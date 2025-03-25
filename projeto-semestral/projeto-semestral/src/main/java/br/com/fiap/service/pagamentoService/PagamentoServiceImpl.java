package br.com.fiap.service.pagamentoService;

import br.com.fiap.DAO.pagamentoDAO.PagamentoDao;
import br.com.fiap.DAO.pagamentoDAO.PagamentoDaoFactory;
import br.com.fiap.config.DatabaseConnectionFactory;
import br.com.fiap.exceptions.pagamentoException.PagamentoNotFoundException;
import br.com.fiap.exceptions.pagamentoException.PagamentoNotSavedException;
import br.com.fiap.exceptions.pagamentoException.PagamentoUnsupportedServiceOperationException;
import br.com.fiap.model.Pagamento;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.logging.Logger;

public class PagamentoServiceImpl implements PagamentoService {

    private final PagamentoDao dao = PagamentoDaoFactory.create();
    private static final Logger logger = Logger.getLogger(PagamentoServiceImpl.class.getName());

    @Override
    public Pagamento create(Pagamento pagamento) throws PagamentoUnsupportedServiceOperationException, SQLException {
        if (pagamento.getCodigo() == null) {
            try (Connection connection = DatabaseConnectionFactory.create().get()) {
                try {
                    connection.setAutoCommit(false);
                    logger.info("Iniciando criação do pagamento...");
                    pagamento = this.dao.save(pagamento, connection);
                    connection.commit();
                    logger.info("Pagamento criado com sucesso: ID " + pagamento.getCodigo());
                    return pagamento;
                } catch (PagamentoNotSavedException e) {
                    connection.rollback();
                    logger.severe("Erro ao salvar o pagamento: " + e.getMessage());
                    throw e;
                } catch (SQLException e) {
                    connection.rollback();
                    logger.severe("Erro de SQL ao salvar o pagamento: " + e.getMessage());
                    throw new PagamentoNotSavedException("Erro ao salvar o pagamento: " + e.getMessage(), e);
                }
            } catch (SQLException | PagamentoNotSavedException e) {
                logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
                throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
            }
        } else {
            throw new PagamentoUnsupportedServiceOperationException("Pagamento já possui código (ID).");
        }
    }

    @Override
    public List<Pagamento> findall() {
        logger.info("Buscando todos os pagamentos...");
        List<Pagamento> pagamentos = this.dao.findAll();
        logger.info("Total de pagamentos encontrados: " + pagamentos.size());
        return pagamentos;
    }

    @Override
    public Pagamento update(Pagamento pagamento) throws PagamentoNotFoundException, SQLException {
        try (Connection connection = DatabaseConnectionFactory.create().get()) {
            try {
                connection.setAutoCommit(false);
                logger.info("Iniciando atualização do pagamento ID: " + pagamento.getCodigo());
                pagamento = this.dao.update(pagamento, connection);
                connection.commit();
                logger.info("Pagamento atualizado com sucesso: ID " + pagamento.getCodigo());
                return pagamento;
            } catch (PagamentoNotFoundException e) {
                connection.rollback();
                logger.severe("Pagamento não encontrado para atualização: ID " + pagamento.getCodigo());
                throw e;
            } catch (SQLException e) {
                connection.rollback();
                logger.severe("Erro de SQL ao atualizar o pagamento: " + e.getMessage());
                throw new SQLException("Erro ao atualizar o pagamento: " + e.getMessage(), e);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
            throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteById(Long id) throws PagamentoNotFoundException, SQLException {
        try (Connection connection = DatabaseConnectionFactory.create().get()) {
            try {
                connection.setAutoCommit(false);
                logger.info("Iniciando exclusão do pagamento ID: " + id);
                this.dao.deleteById(id, connection);
                connection.commit();
                logger.info("Pagamento excluído com sucesso: ID " + id);
            } catch (PagamentoNotFoundException e) {
                connection.rollback();
                logger.severe("Pagamento não encontrado para exclusão: ID " + id);
                throw e;
            } catch (SQLException e) {
                connection.rollback();
                logger.severe("Erro de SQL ao deletar o pagamento: " + e.getMessage());
                throw new SQLException("Erro ao deletar o pagamento: " + e.getMessage(), e);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
            throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
        }
    }
}
