package br.com.fiap.repository;

import br.com.fiap.model.Oficina;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OficinaRepository extends JpaRepository<Oficina, Long> {
}