import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Dashboard - Inpilot',
    description: 'Your AI-powered interview practice dashboard',
    robots: {
        index: false, // Don't index user dashboard (requires auth)
        follow: false,
    },
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
