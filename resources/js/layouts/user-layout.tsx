import Header from "@/components/user/header"
import { Head } from "@inertiajs/react"
import Footer from "@/components/user/footer"
import "@/pages/user/user.css"

export default function UserLayoutApp({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <Header />

            <div className="bg-surface selection:bg-secondary-container selection:text-on-secondary-container">
                {children}
            </div>
            <Footer />

        </>
    )
}