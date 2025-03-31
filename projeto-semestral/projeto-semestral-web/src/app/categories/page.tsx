import NavBar from "@/compenents/nav-bar";

export default function CategoriesPage(){
    return(
        <>
            <NavBar active="categorias"/>

            <main className="Flex justify-center">
                <div className="bg-slate-900 p-6 m-6 rounded min-w-1/3">
                    <h2>Categorias</h2>
                </div>
            </main>
        </>

    )
}