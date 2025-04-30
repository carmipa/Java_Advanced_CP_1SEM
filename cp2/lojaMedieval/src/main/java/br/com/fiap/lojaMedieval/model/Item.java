
package br.com.fiap.lojaMedieval.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false)
    private String raridade;

    @Column(nullable = false)
    private double preco;

    @ManyToOne
    @JoinColumn(name = "personagem_id")
    private Personagem dono;
}