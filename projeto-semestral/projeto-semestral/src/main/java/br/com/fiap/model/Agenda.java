package br.com.fiap.model;

import java.util.Objects;

public class Agenda {

	private Long codigo;
	private String dataAgendamento;
	private String obsAgenda;

	public Agenda() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Agenda(Long codigo, String dataAgendamento, String obsAgenda) {
		this.codigo = codigo;
		this.dataAgendamento = dataAgendamento;
		this.obsAgenda = obsAgenda;
	}

	public Long getCodigo() {
		return codigo;
	}

	public void setCodigo(Long codigo) {
		this.codigo = codigo;
	}

	public String getDataAgendamento() {
		return dataAgendamento;
	}

	public void setDataAgendamento(String dataAgendamento) {
		this.dataAgendamento = dataAgendamento;
	}

	public String getObsAgenda() {
		return obsAgenda;
	}

	public void setObsAgenda(String obsAgenda) {
		this.obsAgenda = obsAgenda;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (!(o instanceof Agenda agenda)) return false;
        return Objects.equals(codigo, agenda.codigo) && Objects.equals(dataAgendamento, agenda.dataAgendamento) && Objects.equals(obsAgenda, agenda.obsAgenda);
	}

	@Override
	public int hashCode() {
		return Objects.hash(codigo, dataAgendamento, obsAgenda);
	}

	@Override
	public String toString() {
		return "Agenda{" +
				"codigo=" + codigo +
				", dataAgendamento='" + dataAgendamento + '\'' +
				", obsAgenda='" + obsAgenda + '\'' +
				'}';
	}
}
