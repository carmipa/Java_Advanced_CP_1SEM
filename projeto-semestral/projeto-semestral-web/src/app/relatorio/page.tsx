import NavBar from "@/components/nav-bar";

export default function RelatorioPage(){
    return(
        <>
            <NavBar active="relatorio"/>

            <main className="Flex justify-center">
                <div className="bg-slate-900 p-6 m-6 rounded min-w-1/3">
                    <h2>Relatório</h2>
                </div>
            </main>
        </>

    )
}