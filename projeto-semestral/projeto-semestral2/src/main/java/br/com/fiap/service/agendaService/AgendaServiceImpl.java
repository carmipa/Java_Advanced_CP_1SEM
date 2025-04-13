package br.com.fiap.service.agendaService;

import br.com.fiap.DAO.agendaDAO.AgendaDaoFactory;
import br.com.fiap.DAO.agendaDAO.AgendaDao;
import br.com.fiap.config.DatabaseConnectionFactory;
import br.com.fiap.exceptions.agendaException.AgendaNotFoundException;
import br.com.fiap.exceptions.agendaException.AgendaNotSavedException;
import br.com.fiap.exceptions.agendaException.AgendaUnsupportedServiceOperationExcept;
import br.com.fiap.model.Agenda;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.logging.Logger;

public class AgendaServiceImpl implements AgendaService {

    private final AgendaDao dao = AgendaDaoFactory.create();
    private static final Logger logger = Logger.getLogger(AgendaServiceImpl.class.getName());

    @Override
    public Agenda create(Agenda agenda) throws AgendaUnsupportedServiceOperationExcept, SQLException, AgendaNotSavedException {
        if (agenda.getCodigo() == null) {
            try (Connection connection = DatabaseConnectionFactory.create().get()) {
                try {
                    connection.setAutoCommit(false);
                    logger.info("Iniciando criação da agenda...");
                    agenda = this.dao.save(agenda, connection);
                    connection.commit();
                    logger.info("Agenda criada com sucesso: ID " + agenda.getCodigo());
                    return agenda;
                } catch (AgendaNotSavedException e) {
                    connection.rollback();
                    logger.severe("Erro ao salvar a agenda: " + e.getMessage());
                    throw e;
                } catch (SQLException e) {
                    connection.rollback();
                    logger.severe("Erro de SQL ao salvar a agenda: " + e.getMessage());
                    throw new AgendaNotSavedException("Erro ao salvar a agenda: " + e.getMessage(), e);
                }
            } catch (SQLException e) {
                logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
                throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
            }
        } else {
            throw new AgendaUnsupportedServiceOperationExcept("Agenda já possui código (ID).");
        }
    }

    @Override
    public List<Agenda> findAll() {
        logger.info("Buscando todas as agendas...");
        List<Agenda> agendas = this.dao.findAll();
        logger.info("Total de agendas encontradas: " + agendas.size());
        return agendas;
    }

    @Override
    public Agenda update(Agenda agenda) throws AgendaNotFoundException, SQLException {
        try (Connection connection = DatabaseConnectionFactory.create().get()) {
            try {
                connection.setAutoCommit(false);
                logger.info("Iniciando atualização da agenda ID: " + agenda.getCodigo());
                agenda = this.dao.update(agenda, connection);
                connection.commit();
                logger.info("Agenda atualizada com sucesso: ID " + agenda.getCodigo());
                return agenda;
            } catch (AgendaNotFoundException e) {
                connection.rollback();
                logger.severe("Agenda não encontrada para atualização: ID " + agenda.getCodigo());
                throw e;
            } catch (SQLException e) {
                connection.rollback();
                logger.severe("Erro de SQL ao atualizar a agenda: " + e.getMessage());
                throw new SQLException("Erro ao atualizar a agenda: " + e.getMessage(), e);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
            throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteById(Long id) throws AgendaNotFoundException, SQLException {
        try (Connection connection = DatabaseConnectionFactory.create().get()) {
            try {
                connection.setAutoCommit(false);
                logger.info("Iniciando exclusão da agenda ID: " + id);
                this.dao.deleteById(id, connection);
                connection.commit();
                logger.info("Agenda excluída com sucesso: ID " + id);
            } catch (AgendaNotFoundException e) {
                connection.rollback();
                logger.severe("Agenda não encontrada para exclusão: ID " + id);
                throw e;
            } catch (SQLException e) {
                connection.rollback();
                logger.severe("Erro de SQL ao deletar a agenda: " + e.getMessage());
                throw new SQLException("Erro ao deletar a agenda: " + e.getMessage(), e);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao conectar ao banco de dados: " + e.getMessage());
            throw new SQLException("Erro ao conectar ao banco de dados: " + e.getMessage(), e);
        }
    }
}
