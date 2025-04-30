// --- src/main/java/br/com/fiap/repository/specification/AgendaSpecification.java ---
package br.com.fiap.repository.specification;

import br.com.fiap.model.Agenda;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;

public class AgendaSpecification {

    // Evita instanciação
    private AgendaSpecification() {}

    /**
     * Cria uma Specification para filtrar por data de agendamento >= dataInicio.
     */
    public static Specification<Agenda> dataAgendamentoMaiorOuIgualA(LocalDate dataInicio) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(root.get("dataAgendamento"), dataInicio);
        // "dataAgendamento" é o nome do campo na entidade Agenda
    }

    /**
     * Cria uma Specification para filtrar por data de agendamento <= dataFim.
     */
    public static Specification<Agenda> dataAgendamentoMenorOuIgualA(LocalDate dataFim) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(root.get("dataAgendamento"), dataFim);
    }

    /**
     * Cria uma Specification para filtrar por observacao contendo (ignorando case).
     */
    public static Specification<Agenda> observacaoContem(String observacao) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(criteriaBuilder.lower(root.get("observacao")), "%" + observacao.toLowerCase() + "%");
        // "observacao" é o nome do campo na entidade Agenda
    }
}