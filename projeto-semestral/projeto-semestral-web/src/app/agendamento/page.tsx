import NavBar from "@/components/nav-bar";

export default function AgendamentoPage(){
    return(
        <>
            <NavBar active="agendamento"/>

            <main className="Flex justify-center">
                <div className="bg-slate-900 p-6 m-6 rounded min-w-1/3">
                    <h2>Agendamento</h2>
                </div>
            </main>
        </>

    )
}