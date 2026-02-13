export default function LandingFooter() {
    return (
        <footer className="bg-background-dark border-t border-white/5 pt-20 pb-10">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter text-white mb-6 md:mb-0 font-display">
                        ARENA<span className="text-primary">.</span>
                    </h2>
                    <div className="flex gap-8">
                        {["IG", "TW", "YT"].map((social) => (
                            <a
                                key={social}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-gray-400"
                                href="#"
                            >
                                <span className="font-bold text-xs">{social}</span>
                            </a>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-8 text-sm text-gray-500">
                    <p>© 2026 Arena Sports. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0 font-display uppercase tracking-wider text-xs">
                        <a className="hover:text-white transition-colors" href="#">
                            Privacy
                        </a>
                        <a className="hover:text-white transition-colors" href="#">
                            Terms
                        </a>
                        <a className="hover:text-white transition-colors" href="#">
                            Support
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
