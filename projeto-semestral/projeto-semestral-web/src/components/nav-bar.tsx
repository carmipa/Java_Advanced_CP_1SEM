interface NabvBarProps{
    active: "inicio" | "cadastrar" | "oficinaOnline" | "agendamento" | "relatorio" | "pagamento"
}

export default function NabBar(props: NabvBarProps){

    const {active} = props
    const classActive = "border-b-4 border-white"

    return(
        <nav className="flex justify-between items-center p-6 bg-[#075985]">
            <h1 className="text-2x1 font-bold">Oficina On-line</h1>
            <ul className="flex gap-4">
                <li className={ active == "inicio" ? classActive : ""}>
                    <a href="/inicio">inicio</a>
                </li>
                <li className={ active == "cadastrar" ? classActive : ""}>
                    <a href="/cadastrar">cadastrar</a>
                </li>
                <li className={ active == "oficinaOnline" ? classActive : ""}>
                    <a href="/oficinaOnline">oficina on-line</a>
                </li>
                <li className={ active == "agendamento" ? classActive : ""}>
                    <a href="/agendamento">agendamento</a>
                </li>
                <li className={ active == "relatorio" ? classActive : ""}>
                    <a href="/relatorio">relatório</a>
                </li>
                <li className={ active == "pagamento" ? classActive : ""}>
                    <a href="/pagamento">pagamento</a>
                </li>
            </ul>
            <img className="size-12 rounded-full" src="https://avatars.githubusercontent.com/u/4350623?v=4"/>
        </nav>

    )
}