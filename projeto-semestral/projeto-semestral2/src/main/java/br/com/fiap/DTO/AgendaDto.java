package br.com.fiap.DTO;

public class AgendaDto {

    private Long codigo;
    private String dataAgendamento;
    private String obsAgenda;

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

    public Long getCodigo() {
        return codigo;
    }

    public void setCodigo(Long codigo) {
        this.codigo = codigo;
    }
}
