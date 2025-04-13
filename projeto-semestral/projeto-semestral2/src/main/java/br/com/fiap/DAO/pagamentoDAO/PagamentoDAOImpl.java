package br.com.fiap.DAO.pagamentoDAO;

import br.com.fiap.config.DatabaseConnectionFactory;
import br.com.fiap.exceptions.pagamentoException.PagamentoNotFoundException;
import br.com.fiap.exceptions.pagamentoException.PagamentoNotSavedException;
import br.com.fiap.model.Pagamento;

import java.sql.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

public class PagamentoDAOImpl implements PagamentoDao {

    private final Logger logger = Logger.getLogger(this.getClass().getName());

    @Override
    public List<Pagamento> findAll() {
        final List<Pagamento> all = new ArrayList<>();
        final String sql = "SELECT * FROM PAGAMENTOS";
        try (Connection conn = DatabaseConnectionFactory.create().get();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet resultSet = stmt.executeQuery()) {

            while (resultSet.next()) {
                String dataPagamentoStr = null;
                Date dataPagamento = resultSet.getDate("DATA_PAGAMENTO");
                if (dataPagamento != null) {
                    dataPagamentoStr = new SimpleDateFormat("yyyy-MM-dd").format(dataPagamento);
                }

                Pagamento pagamento = new Pagamento(
                        resultSet.getLong("ID_PAG"),
                        dataPagamentoStr,
                        resultSet.getString("TIPO_PAGAMENTO"),
                        resultSet.getDouble("DESCONTO"),
                        resultSet.getInt("TOTAL_PARCELAS"),
                        resultSet.getDouble("VALOR_PARCELAS"),
                        resultSet.getDouble("TOTAL_PAGAMENTO_DESCONTO"));
                all.add(pagamento);
            }
        } catch (SQLException e) {
            logger.warning("Não foi possível localizar nenhum registro de pagamentos: " + e.getMessage());
        }
        return all;
    }

    @Override
    public void deleteById(Long id, Connection connection) throws PagamentoNotFoundException, SQLException {

        final String sql = "DELETE FROM PAGAMENTOS WHERE ID_PAG = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, id);
            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new PagamentoNotFoundException("Pagamento com ID " + id + " não encontrado para exclusão.");
            }
        }

    }

    @Override
    public Pagamento save(Pagamento pagamento, Connection connection) throws SQLException, PagamentoNotSavedException {
        final String sql = "INSERT INTO PAGAMENTOS (DATA_PAGAMENTO, TIPO_PAGAMENTO, DESCONTO, TOTAL_PARCELAS, VALOR_PARCELAS, TOTAL_PAGAMENTO_DESCONTO) VALUES (?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            // Converter dataPagamento de String para java.sql.Date
            if (pagamento.getDataPagamento() != null && !pagamento.getDataPagamento().isEmpty()) {
                try {
                    Date dataPagamento = new Date(new SimpleDateFormat("yyyy-MM-dd").parse(pagamento.getDataPagamento()).getTime());
                    stmt.setDate(1, dataPagamento);
                } catch (ParseException e) {
                    throw new PagamentoNotSavedException("Formato de data de pagamento inválido. Use 'yyyy-MM-dd'.", e);
                }
            } else {
                stmt.setNull(1, Types.DATE);
            }

            stmt.setString(2, pagamento.getTipoPagamento());
            stmt.setDouble(3, pagamento.getDesconto());
            stmt.setInt(4, pagamento.getParcelamento());
            stmt.setDouble(5, pagamento.getValorParcelas());
            stmt.setDouble(6, pagamento.getTotalComDesconto());

            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new PagamentoNotSavedException("Não foi possível salvar o pagamento.");
            }

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    long id = rs.getLong(1);
                    pagamento.setCodigo(id);
                } else {
                    throw new PagamentoNotSavedException("Falha ao obter o ID do pagamento gerado.");
                }
            }
            return pagamento;
        }
    }

    @Override
    public Pagamento update(Pagamento pagamento, Connection connection) throws PagamentoNotFoundException, SQLException {
        final String sql = "UPDATE PAGAMENTOS SET DATA_PAGAMENTO = ?, TIPO_PAGAMENTO = ?, DESCONTO = ?, TOTAL_PARCELAS = ?, VALOR_PARCELAS = ?, TOTAL_PAGAMENTO_DESCONTO = ? WHERE ID_PAG = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {

            // Converter dataPagamento de String para java.sql.Date
            if (pagamento.getDataPagamento() != null && !pagamento.getDataPagamento().isEmpty()) {
                try {
                    Date dataPagamento = new Date(new SimpleDateFormat("yyyy-MM-dd").parse(pagamento.getDataPagamento()).getTime());
                    stmt.setDate(1, dataPagamento);
                } catch (ParseException e) {
                    throw new PagamentoNotFoundException("Formato de data de pagamento inválido. Use 'yyyy-MM-dd'.", e);
                }
            } else {
                stmt.setNull(1, Types.DATE);
            }

            stmt.setString(2, pagamento.getTipoPagamento());
            stmt.setDouble(3, pagamento.getDesconto());
            stmt.setInt(4, pagamento.getParcelamento());
            stmt.setDouble(5, pagamento.getValorParcelas());
            stmt.setDouble(6, pagamento.getTotalComDesconto());
            stmt.setLong(7, pagamento.getCodigo());

            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new PagamentoNotFoundException("Pagamento com ID " + pagamento.getCodigo() + " não encontrado para atualização.");
            }
            return pagamento;
        }
    }
}
