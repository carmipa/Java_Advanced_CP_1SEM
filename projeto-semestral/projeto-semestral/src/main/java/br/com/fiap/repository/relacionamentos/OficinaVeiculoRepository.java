package br.com.fiap.repository.relacionamentos;

import br.com.fiap.model.relacionamentos.OficinaVeiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; // Certifique-se que List está importado


public interface OficinaVeiculoRepository extends JpaRepository<OficinaVeiculo, Long> {

    List<OficinaVeiculo> findByVeiculoIdIn(List<Long> veiculoIds);
}