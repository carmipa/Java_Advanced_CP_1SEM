package br.com.fiap.interfacesModel;

import br.com.fiap.model.Orcamento;
import br.com.fiap.model.Pecas;

public interface IPagamento {
	

	double calculaDesconto(double valorTotal, double percentualDesconto);

	double calculaValorTotalPeca(Pecas peca);

	double calculaDesconto(Orcamento orcamento);

	double valorParcela(double valorParcela, int parcelamento);
	

		

}
