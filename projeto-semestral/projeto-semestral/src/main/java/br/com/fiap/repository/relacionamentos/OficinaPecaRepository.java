package br.com.fiap.repository.relacionamentos;

import br.com.fiap.model.relacionamentos.OficinaPeca;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OficinaPecaRepository extends JpaRepository<OficinaPeca, Long> {

    List<OficinaPeca> findByOficinaId(Long oficinaId);
}