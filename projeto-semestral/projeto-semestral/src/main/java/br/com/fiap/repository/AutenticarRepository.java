package br.com.fiap.repository;

import br.com.fiap.model.Autenticar;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AutenticarRepository extends JpaRepository<Autenticar, Long> {
}