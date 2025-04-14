package br.com.fiap.DAO.pecasDAO;

import br.com.fiap.config.DatabaseConnectionFactory;
import br.com.fiap.exceptions.pecasException.PecasNotFoundException;
import br.com.fiap.exceptions.pecasException.PecasNotSavedException;
import br.com.fiap.model.Pecas;

import java.sql.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

public class PecasDAOImpl implements PecasDao {

    private final Logger logger = Logger.getLogger(this.getClass().getName());

    @Override
    public List<Pecas> findAll() {

        final List<Pecas> all = new ArrayList<>();
        final String sql = "SELECT * FROM PECAS";
        try (Connection conn = DatabaseConnectionFactory.create().get();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet resultSet = stmt.executeQuery()) {

            while (resultSet.next()) {
                String dataCompraStr = null;
                Date dataCompra = resultSet.getDate("DATA_COMPRA");
                if (dataCompra != null) {
                    dataCompraStr = new SimpleDateFormat("yyyy-MM-dd").format(dataCompra);
                }

                Pecas peca = new Pecas(
                        resultSet.getLong("ID_PEC"),
                        resultSet.getString("TIPO_VEICULO"),
                        resultSet.getString("FABRICANTE"),
                        resultSet.getString("DESCRICA_PECA"),
                        dataCompraStr,
                        resultSet.getDouble("PRECO"),
                        resultSet.getDouble("DESCONTO"),
                        resultSet.getDouble("TOTAL_DESCONTO"));
                all.add(peca);
            }
        } catch (SQLException e) {
            logger.warning("Não foi possível localizar nenhum registro de peças: " + e.getMessage());
        }
        return all;
    }

    @Override
    public void deleteById(Long id, Connection connection) throws PecasNotFoundException, SQLException {

        final String sql = "DELETE FROM PECAS WHERE ID_PEC = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, id);
            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new PecasNotFoundException("Peça com ID " + id + " não encontrada para exclusão.");
            }
        }

    }

    @Override
    public Pecas save(Pecas pecas, Connection connection) throws SQLException, PecasNotSavedException {
        final String sql = "INSERT INTO PECAS (TIPO_VEICULO, FABRICANTE, DESCRICA_PECA, DATA_COMPRA, PRECO, DESCONTO, TOTAL_DESCONTO) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, pecas.getTipoVeiculo());
            stmt.setString(2, pecas.getFabricante());
            stmt.setString(3, pecas.getDescricao());

            // Converter dataCompra de String para java.sql.Date
            if (pecas.getDataCompra() != null && !pecas.getDataCompra().isEmpty()) {
                try {
                    Date dataCompra = new Date(new SimpleDateFormat("yyyy-MM-dd").parse(pecas.getDataCompra()).getTime());
                    stmt.setDate(4, dataCompra);
                } catch (ParseException e) {
                    throw new PecasNotSavedException("Formato de data de compra inválido. Use 'yyyy-MM-dd'.", e);
                }
            } else {
                stmt.setNull(4, Types.DATE);
            }

            stmt.setDouble(5, pecas.getPreco());
            stmt.setDouble(6, pecas.getDesconto());
            stmt.setDouble(7, pecas.getTotalDesconto());

            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new PecasNotSavedException("Não foi possível salvar a peça.");
            }

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    long id = rs.getLong(1);
                    pecas.setCodigo(id);
                } else {
                    throw new PecasNotSavedException("Falha ao obter o ID da peça gerada.");
                }
            }
            return pecas;
        }
    }

    @Override
    public Pecas update(Pecas pecas, Connection connection) throws PecasNotFoundException, SQLException {
        final String sql = "UPDATE PECAS SET TIPO_VEICULO = ?, FABRICANTE = ?, DESCRICA_PECA = ?, DATA_COMPRA = ?, PRECO = ?, DESCONTO = ?, TOTAL_DESCONTO = ? WHERE ID_PEC = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, pecas.getTipoVeiculo());
            stmt.setString(2, pecas.getFabricante());
            stmt.setString(3, pecas.getDescricao());

            // Converter dataCompra de String para java.sql.Date
            if (pecas.getDataCompra() != null && !pecas.getDataCompra().isEmpty()) {
                try {
                    Date dataCompra = new Date(new SimpleDateFormat("yyyy-MM-dd").parse(pecas.getDataCompra()).getTime());
                    stmt.setDate(4, dataCompra);
                } catch (ParseException e) {
                    throw new PecasNotFoundException("Formato de data de compra inválido. Use 'yyyy-MM-dd'.", e);
                }
            } else {
                stmt.setNull(4, Types.DATE);
            }

            stmt.setDouble(5, pecas.getPreco());
            stmt.setDouble(6, pecas.getDesconto());
            stmt.setDouble(7, pecas.getTotalDesconto());
            stmt.setLong(8, pecas.getCodigo());

            int linhasAlteradas = stmt.executeUpdate();
            if (linhasAlteradas == 0) {
                throw new PecasNotFoundException("Peça com ID " + pecas.getCodigo() + " não encontrada para atualização.");
            }
            return pecas;
        }
    }
}
