package br.com.fiap.model;

import java.util.Objects;

public class Oficina {

	private Long codigo;
	private String DataOficina;
	private String descricaoProblema;
	private String diagnostico;
	private String partesAfetadas;
	private int horasTrabalhadas;
	private Agenda agenda;
	private Veiculo veiculo;
	private Pecas peca;

	public Oficina() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Oficina(String dataOficina, String descricaoProblema, Long codigo, String diagnostico, String partesAfetadas, int horasTrabalhadas) {
		DataOficina = dataOficina;
		this.descricaoProblema = descricaoProblema;
		this.codigo = codigo;
		this.diagnostico = diagnostico;
		this.partesAfetadas = partesAfetadas;
		this.horasTrabalhadas = horasTrabalhadas;
	}

	public Long getCodigo() {
		return codigo;
	}

	public void setCodigo(Long codigo) {
		this.codigo = codigo;
	}

	public String getDataOficina() {
		return DataOficina;
	}

	public void setDataOficina(String dataOficina) {
		DataOficina = dataOficina;
	}

	public String getDescricaoProblema() {
		return descricaoProblema;
	}

	public void setDescricaoProblema(String descricaoProblema) {
		this.descricaoProblema = descricaoProblema;
	}

	public String getDiagnostico() {
		return diagnostico;
	}

	public void setDiagnostico(String diagnostico) {
		this.diagnostico = diagnostico;
	}

	public String getPartesAfetadas() {
		return partesAfetadas;
	}

	public void setPartesAfetadas(String partesAfetadas) {
		this.partesAfetadas = partesAfetadas;
	}

	public int getHorasTrabalhadas() {
		return horasTrabalhadas;
	}

	public void setHorasTrabalhadas(int horasTrabalhadas) {
		this.horasTrabalhadas = horasTrabalhadas;
	}

	public Agenda getAgenda() {
		return agenda;
	}

	public void setAgenda(Agenda agenda) {
		this.agenda = agenda;
	}

	public Veiculo getVeiculo() {
		return veiculo;
	}

	public void setVeiculo(Veiculo veiculo) {
		this.veiculo = veiculo;
	}

	public Pecas getPeca() {
		return peca;
	}

	public void setPeca(Pecas peca) {
		this.peca = peca;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (!(o instanceof Oficina oficina)) return false;
        return horasTrabalhadas == oficina.horasTrabalhadas && Objects.equals(codigo, oficina.codigo) && Objects.equals(DataOficina, oficina.DataOficina) && Objects.equals(descricaoProblema, oficina.descricaoProblema) && Objects.equals(diagnostico, oficina.diagnostico) && Objects.equals(partesAfetadas, oficina.partesAfetadas) && Objects.equals(agenda, oficina.agenda) && Objects.equals(veiculo, oficina.veiculo) && Objects.equals(peca, oficina.peca);
	}

	@Override
	public int hashCode() {
		return Objects.hash(codigo, DataOficina, descricaoProblema, diagnostico, partesAfetadas, horasTrabalhadas, agenda, veiculo, peca);
	}

	@Override
	public String toString() {
		return "Oficina{" +
				"codigo=" + codigo +
				", DataOficina='" + DataOficina + '\'' +
				", descricaoProblema='" + descricaoProblema + '\'' +
				", diagnostico='" + diagnostico + '\'' +
				", partesAfetadas='" + partesAfetadas + '\'' +
				", horasTrabalhadas=" + horasTrabalhadas +
				'}';
	}
}
