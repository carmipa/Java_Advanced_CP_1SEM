package br.com.fiap.DTO;

public class OficinaDto {

    private Long codigo;
    private String DataOficina;
    private String descricaoProblema;
    private String diagnostico;
    private String partesAfetadas;
    private int horasTrabalhadas;

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
}
