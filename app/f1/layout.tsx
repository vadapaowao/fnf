import F1Navigation from "@/components/f1/F1Navigation";

export default function F1Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background-dark">
            <F1Navigation season="2026" />
            {children}
        </div>
    );
}
