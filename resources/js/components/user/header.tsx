import { Search, ShoppingBag, User } from "lucide-react"
import { usePage } from "@inertiajs/react"

export default function Header() {
    const { url } = usePage()



    type Link = {
        name: string;
        link: string;
        active: boolean;
    }

    const navLink: Link[] = [
        { name: 'Home', link: "/", active: url === "/" },
        { name: "Collections", link: "/collections", active: url === "/collections" },
        { name: "Craftsmanship", link: "/craftsmanship", active: url === "/craftsmanship" },
        { name: "Heritage", link: "/heritage", active: url === "/heritage" },
        { name: "Journal", link: "/journal", active: url === "/journal" },
    ]

    return (
        <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-6 w-full max-w-none backdrop-blur-sm">
            <div className="flex items-center gap-12">
                <span className="text-2xl font-bold tracking-tighter text-primary font-headline">Varnell</span>
                <div className="hidden md:flex gap-8 items-center">
                    {navLink.map((value, index) => (
                        <a key={index} className={value.active ? "border-secondary text-primary font-semibold border-b-2  font-headline tracking-wide py-1" : "text-primary/70 hover:text-primary transition-opacity duration-300 font-headline tracking-wide"}
                            href={value.link}>

                            {value.name}
                        </a>
                    ))}



                </div>
            </div>
            <div className="flex items-center gap-6">
                <button className="hover:opacity-80 transition-opacity duration-300 active:scale-95 text-primary">
                    <span className="material-symbols-outlined"><Search /></span>
                </button>
                <button className="hover:opacity-80 transition-opacity duration-300 active:scale-95 text-primary">
                    <span className="material-symbols-outlined"><ShoppingBag /></span>
                </button>
                <button className="hover:opacity-80 transition-opacity duration-300 active:scale-95 text-primary">
                    <span className="material-symbols-outlined"><User /></span>
                </button>
            </div>
        </nav >
    )
}