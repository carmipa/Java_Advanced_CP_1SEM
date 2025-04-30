package br.com.fiap.repository;

import br.com.fiap.model.Pecas;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PecasRepository extends JpaRepository<Pecas, Long> {
}