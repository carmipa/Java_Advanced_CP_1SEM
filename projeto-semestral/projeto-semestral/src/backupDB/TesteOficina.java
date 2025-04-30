

import java.util.ArrayList;
import java.util.InputMismatchException;
import java.util.List;
import java.util.Scanner;


public class TesteOficina {

    // Códigos de cor ANSI
    private static final String RESET = "\033[0m";
    private static final String BOLD = "\033[1m";
    private static final String UNDERLINE = "\033[4m";
    private static final String GREEN = "\033[32m";
    private static final String RED = "\033[31m";
    private static final String BLUE = "\033[34m";
    private static final String CYAN = "\033[36m";

    public static void main(String[] args) {

        Scanner scanner = new Scanner(System.in);
        List<Clientes> listaClientes = new ArrayList<>();
        ServicoCliente servicoCliente = new ServicoCliente();

        List<Carro> listaCarro = new ArrayList<>();
        ServicoCarro servicoCarro = new ServicoCarro();

        List<Moto> listaMoto = new ArrayList<>();
        ServicoMoto servicoMoto = new ServicoMoto();

        List<Oficina> listaOficina = new ArrayList<>();
        ServicoOficina servicoOficina = new ServicoOficina();

        List<Agenda> listaAgenda = new ArrayList<>();
        ServicoAgendamento servicoAgenda = new ServicoAgendamento();

        ServicoOrcamentoPagamento servicoOrcamento = new ServicoOrcamentoPagamento();
        List<Orcamento> listaOrcamento = new ArrayList<>();

        // Loop principal do menu
        while (true) {
            System.out.println(BOLD + GREEN + "****************************************************************************************" +
                   "\nPORTO SEGUROS - OFICINA MECÂNICA" + RESET);
            System.out.println(
                   "\n" + BOLD + CYAN +
                   "1 - CLIENTES" + "\n" +
                   "2 - VEÍCULOS" + "\n" +
                   "3 - OFICINA VIRTUAL E AGENDAMENTO" + "\n" +
                   "4 - ORÇAMENTO E PAGAMENTO" + "\n" +
                   "0 - SAIR" + RESET + 
                   "\n" + BOLD + GREEN + "****************************************************************************************" + RESET);

            System.out.println("\n" + BOLD + BLUE + "DIGITE UMA DAS OPÇÕES ACIMA: " + RESET);

            int opcao;
            try {
                opcao = scanner.nextInt();
                scanner.nextLine(); // Limpar buffer
            } catch (InputMismatchException e) {
                System.err.println(RED + "Erro: Por favor, digite um número válido para a opção do menu." + RESET);
                scanner.nextLine(); // Limpar o buffer
                continue; // Volta para o início do loop
            }

            switch (opcao) {
                case 1:
                    while (true) {
                        System.out.println(BOLD + CYAN + "========== 1 - CLIENTES ==========" + RESET + "\n" +
                                "\n" + BOLD + "1 - CADASTRAR DADOS DO CLIENTE" + "\n" +
                                "2 - LISTAR DADOS DO CLIENTES" + "\n" +
                                "0 - SAIR" + RESET + "\n");

                        System.out.println(BOLD + BLUE + "Escolha uma das opções: " + RESET);

                        int tipo = 0;
                        try {
                            tipo = scanner.nextInt();
                            scanner.nextLine(); 

                            switch (tipo) {
                                case 1:
                                    Clientes novoCliente = servicoCliente.cadastrarCliente(scanner);
                                    if (novoCliente != null) {
                                        listaClientes.add(novoCliente);
                                    }
                                    break;

                                case 2:
                                    String lista = servicoCliente.listarClientes(listaClientes);
                                    System.out.println(lista);
                                    break;

                                case 0:
                                    System.out.println(GREEN + "Saindo do cadastro de clientes..." + RESET);
                                    break;

                                default:
                                    System.err.println(RED + "Opção inválida!" + RESET);
                            }
                        } catch (InputMismatchException e) {
                            System.err.println(RED + "Erro: Por favor, digite um número válido." + RESET);
                            scanner.nextLine(); // Limpar o buffer
                        }

                        if (tipo == 0) break; // Sai do loop de cadastro de clientes
                    }
                    break;

                case 2:
                    while (true) {
                        System.out.println(BOLD + CYAN + "========== 2 - VEÍCULOS ==========" + RESET + "\n" +
                                "\n" + BOLD + "1 - CADASTRAR CARRO" + "\n" +
                                "2 - CADASTRAR MOTO" + "\n" +
                                "3 - LISTAR DADOS DOS CARROS" + "\n" +
                                "4 - LISTAR DADOS DAS MOTOS" + "\n" +
                                "0 - SAIR" + RESET + "\n");

                        System.out.println(BOLD + BLUE + "Escolha uma das opções: " + RESET);

                        int tipo = 0;
                        try {
                            tipo = scanner.nextInt();
                            scanner.nextLine(); 

                            switch (tipo) {
                                case 1:
                                    Carro novoCarro = servicoCarro.cadastrarCarro(scanner);
                                    if (novoCarro != null) {
                                        listaCarro.add(novoCarro);
                                    }
                                    break;

                                case 2:
                                    Moto novaMoto = servicoMoto.cadastraMoto(scanner);
                                    if (novaMoto != null) {
                                        listaMoto.add(novaMoto);
                                    }
                                    break;

                                case 3:
                                    String listaCarros = servicoCarro.listarCarro(listaCarro);
                                    System.out.println(listaCarros);
                                    break;

                                case 4:
                                    String listaMotos = servicoMoto.listarMoto(listaMoto);
                                    System.out.println(listaMotos);
                                    break;

                                case 0:
                                    System.out.println(GREEN + "Saindo do cadastro de veículos..." + RESET);
                                    break;

                                default:
                                    System.err.println(RED + "Opção inválida!" + RESET);
                            }
                        } catch (InputMismatchException e) {
                            System.err.println(RED + "Erro: Por favor, digite um número válido." + RESET);
                            scanner.nextLine(); // Limpar o buffer
                        }

                        if (tipo == 0) break; // Sai do loop de cadastro de veículos
                    }
                    break;

                case 3:
                    while (true) {
                        System.out.println(BOLD + CYAN + "========== 3 - OFICINA VIRTUAL E AGENDAMENTO ==========" + RESET + "\n" +
                                "\n" + BOLD + "1 - OFICINA VIRTUAL DE DIAGNÓSTICO" + "\n" +
                                "2 - AGENDAR ATENDIMENTO" + "\n" +
                                "3 - LISTAR DIAGNÓSTICOS DA OFICINA" + "\n" +
                                "4 - LISTAR AGENDAMENTOS" + "\n" +
                                "0 - SAIR" + RESET + "\n");

                        System.out.println(BOLD + BLUE + "Escolha uma das opções: " + RESET);

                        int tipo = 0;
                        try {
                            tipo = scanner.nextInt();
                            scanner.nextLine(); 

                            switch (tipo) {
                                case 1:
                                    Oficina novaOficina = servicoOficina.cadastraOficina(scanner);
                                    if (novaOficina != null) {
                                        listaOficina.add(novaOficina);
                                    }
                                    break;

                                case 2:
                                    Agenda novaAgenda = servicoAgenda.cadastraAgenda(scanner);
                                    if (novaAgenda != null) {
                                        listaAgenda.add(novaAgenda);
                                    }
                                    break;

                                case 3:
                                    String listarOficina = servicoOficina.listarOficina(listaOficina);
                                    System.out.println(listarOficina);
                                    break;

                                case 4:
                                    String listarAgenda = servicoAgenda.listarAgenda(listaAgenda);
                                    System.out.println(listarAgenda);
                                    break;

                                case 0:
                                    System.out.println(GREEN + "Saindo da oficina..." + RESET);
                                    break;

                                default:
                                    System.err.println(RED + "Opção inválida!" + RESET);
                            }
                        } catch (InputMismatchException e) {
                            System.err.println(RED + "Erro: Por favor, digite um número válido." + RESET);
                            scanner.nextLine(); // Limpar o buffer
                        }

                        if (tipo == 0) break; // Sai do loop de oficina virtual
                    }
                    break;

                case 4:
                    while (true) {
                        System.out.println(BOLD + CYAN + "========== 4 - ORÇAMENTO E PAGAMENTO ==========" + RESET + "\n" +
                                "\n" + BOLD + "1 - GERAR ORÇAMENTO E FAZER PAGAMENTO" + "\n" +
                                "2 - LISTAR ORÇAMENTOS/PAGAMENTOS" + "\n" +
                                "0 - SAIR" + RESET + "\n");

                        System.out.print(BOLD + BLUE + "Escolha uma das opções: " + RESET);

                        int tipo = 0;
                        try {
                            tipo = scanner.nextInt();
                            scanner.nextLine(); // Limpar o buffer do scanner

                            switch (tipo) {
                                case 1:
                                    Orcamento novoOrcamento = servicoOrcamento.cadastraOrcamentoPagamentos(scanner);
                                    if (novoOrcamento != null) {
                                        listaOrcamento.add(novoOrcamento);
                                    }
                                    break;

                                case 2:
                                    String listarOrcamentos = servicoOrcamento.listarOrcamentoPagamento(listaOrcamento);
                                    System.out.println(listarOrcamentos);
                                    break;

                                case 0:
                                    System.out.println(GREEN + "Saindo do programa..." + RESET);
                                    scanner.close();
                                    return;

                                default:
                                    System.err.println(RED + "Opção inválida!" + RESET);
                            }
                        } catch (InputMismatchException e) {
                            System.err.println(RED + "Erro: Por favor, digite um número válido." + RESET);
                            scanner.nextLine(); // Limpar o buffer do scanner
                        }

                        if (tipo == 0) break; // Sai do loop de orçamento e pagamento
                    }
                    break;

                case 0:
                    System.out.println(GREEN + "Saindo do programa..." + RESET);
                    scanner.close();
                    return;

                default:
                    System.err.println(RED + "Opção inválida!" + RESET);
            }
        }
    }
}
