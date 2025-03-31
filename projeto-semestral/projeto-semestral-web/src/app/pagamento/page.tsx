import NavBar from "@/components/nav-bar";

export default function PagamentoPage(){
    return(
        <>
            <NavBar active="pagamento"/>

            <main className="Flex justify-center">
                <div className="bg-slate-900 p-6 m-6 rounded min-w-1/3">
                    <h2>Pagamento</h2>
                </div>
            </main>
        </>

    )
}