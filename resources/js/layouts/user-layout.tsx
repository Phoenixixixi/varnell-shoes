import Header from "@/components/user/header"
import { Head, usePage } from "@inertiajs/react"
import Footer from "@/components/user/footer"
import "@/pages/user/user.css"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { useEffect } from "react"

export default function UserLayoutApp({ children }: { children: React.ReactNode }) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string } | undefined;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

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
            <Toaster position="bottom-right" />
        </>
    )
}