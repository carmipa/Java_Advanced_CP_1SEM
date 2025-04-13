package br.com.fiap.DAO.agendaDAO;

import br.com.fiap.config.DatabaseConnectionFactory;
import br.com.fiap.exceptions.agendaException.AgendaNotFoundException;
import br.com.fiap.exceptions.agendaException.AgendaNotSavedException;
import br.com.fiap.model.Agenda;


import java.sql.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

public class AgendaDAOImpl implements AgendaDao {

    private final Logger logger = Logger.getLogger(this.getClass().getName());

    @Override
    public List<Agenda> findAll() {
        final List<Agenda> all = new ArrayList<>();
        final String sql = "SELECT * FROM AGENDAR";
        try (Connection conn = DatabaseConnectionFactory.create().get();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet resultSet = stmt.executeQuery()) {

            while (resultSet.next()) {
                String dataAgendamentoStr = null;
                Date dataAgendamento = resultSet.getDate("DATA_AGENDAMENTO");
                if (dataAgendamento != null) {
                    dataAgendamentoStr = new SimpleDateFormat("yyyy-MM-dd").format(dataAgendamento);
                }

                Agenda agenda = new Agenda(
                        resultSet.getLong("ID_AGE"),
                        dataAgendamentoStr,
                        resultSet.getString("OBS_AGENDAMENTO"));
                all.add(agenda);
            }
        } catch (SQLException e) {
            logger.severe("Erro ao buscar agendas: " + e.getMessage());
            throw new RuntimeException("Erro ao buscar agendas", e);
        }
        return all;

    }

    @Override
    public void deleteById(Long id, Connection connection) throws AgendaNotFoundException, SQLException {

        final String sql = "DELETE FROM AGENDAR WHERE ID_AGE = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, id);
            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new AgendaNotFoundException("Agenda com ID " + id + " não encontrada para exclusão.");
            }
        } catch (SQLException e) {
            logger.severe("Erro ao deletar a agenda: " + e.getMessage());
            throw new AgendaNotFoundException("Erro ao deletar a agenda: " + e.getMessage(), e);
        }

    }

    @Override
    public Agenda save(Agenda agenda, Connection connection) throws SQLException, AgendaNotSavedException {
        final String sql = "INSERT INTO AGENDAR (DATA_AGENDAMENTO, OBS_AGENDAMENTO) VALUES (?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            // Converter dataAgendamento de String para java.sql.Date
            if (agenda.getDataAgendamento() != null && !agenda.getDataAgendamento().isEmpty()) {
                try {
                    Date dataAgendamento = new Date(new SimpleDateFormat("yyyy-MM-dd").parse(agenda.getDataAgendamento()).getTime());
                    stmt.setDate(1, dataAgendamento);
                } catch (ParseException e) {
                    throw new AgendaNotSavedException("Formato de data de agendamento inválido. Use 'yyyy-MM-dd'.");
                }
            } else {
                stmt.setNull(1, Types.DATE);
            }

            stmt.setString(2, agenda.getObsAgenda());
            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new AgendaNotSavedException("Não foi possível salvar a agenda.");
            }

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    long id = rs.getLong(1);
                    agenda.setCodigo(id);
                } else {
                    throw new AgendaNotSavedException("Falha ao obter o ID da agenda gerado.");
                }
            }

            return agenda;
        } catch (SQLException e) {
            throw new AgendaNotSavedException("Erro ao salvar a agenda: " + e.getMessage(), e);
        }
    }

    @Override
    public Agenda update(Agenda agenda, Connection connection) throws AgendaNotFoundException, SQLException {

        final String sql = "UPDATE AGENDAR SET DATA_AGENDAMENTO = ?, OBS_AGENDAMENTO = ? WHERE ID_AGE = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {

            // Converter dataAgendamento de String para java.sql.Date
            if (agenda.getDataAgendamento() != null && !agenda.getDataAgendamento().isEmpty()) {
                try {
                    Date dataAgendamento = new Date(new SimpleDateFormat("yyyy-MM-dd").parse(agenda.getDataAgendamento()).getTime());
                    stmt.setDate(1, dataAgendamento);
                } catch (ParseException e) {
                    throw new AgendaNotFoundException("Formato de data de agendamento inválido. Use 'yyyy-MM-dd'.");
                }
            } else {
                stmt.setNull(1, Types.DATE);
            }

            stmt.setString(2, agenda.getObsAgenda());
            stmt.setLong(3, agenda.getCodigo());

            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new AgendaNotFoundException("Agenda com ID " + agenda.getCodigo() + " não encontrada para atualização.");
            }
            return agenda;
        } catch (SQLException e) {
            throw new AgendaNotFoundException("Erro ao atualizar a agenda: " + e.getMessage(), e);
        }
    }

}
