interface NabvBarProps{
    active: "dashboard" | "movimentações" | "categorias"
}

export default function NabBar(props: NabvBarProps){

    const {active} = props
    const classActive = "border-b-4 border-pink-700"

    return(
        <nav className="flex justify-between items-center p-6 bg-slate-900">
            <h1 className="text-2x1 font-bold">Money Flow</h1>
            <ul className="flex gap-4">
                <li className={ active == "dashboard" ? classActive : ""}>
                    <a href="/dashboard">dashboard</a>
                </li>
                <li className={ active == "movimentações" ? classActive : ""}>
                    <a href="/transaction">movimentações</a>
                </li>
                <li className={ active == "categorias" ? classActive : ""}>
                    <a href="/categories">categorias</a>
                </li>
            </ul>
            <img className="size-12 rounded-full" src="https://avatars.githubusercontent.com/u/4350623?v=4"/>
        </nav>

    )
}