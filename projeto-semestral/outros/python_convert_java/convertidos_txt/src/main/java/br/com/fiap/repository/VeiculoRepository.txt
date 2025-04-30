package br.com.fiap.repository;

import br.com.fiap.model.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {
}