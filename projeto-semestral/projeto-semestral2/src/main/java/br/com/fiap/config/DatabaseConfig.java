package br.com.fiap.config;

public class DatabaseConfig {

    private DatabaseConfig() {
        throw new UnsupportedOperationException();
    }

    static String getUrl(){
        return "jdbc:oracle:thin:@oracle.fiap.com.br:1521:ORCL";
    }

    static String getUser(){
        return "rm557881";
    }

    static String getPassword(){
        return "Fiap#2025";
    }

}
