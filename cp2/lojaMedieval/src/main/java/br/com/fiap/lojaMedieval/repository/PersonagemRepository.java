// === Arquivo: src/main/java/br/com/fiap/lojaMedieval/repository/PersonagemRepository.java ===
package br.com.fiap.lojaMedieval.repository;

import br.com.fiap.lojaMedieval.model.Personagem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PersonagemRepository extends JpaRepository<Personagem, Long> {

    List<Personagem> findByNomeContainingIgnoreCase(String nome);

    List<Personagem> findByClasseIgnoreCase(String classe);
}