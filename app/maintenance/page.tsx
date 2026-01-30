import UnderConstruction from '@/components/UnderConstruction'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Maintenance - Inpilot',
    description: 'Inpilot is currently under maintenance. We\'ll be back soon!',
    robots: {
        index: false, // Don't index maintenance page
        follow: false,
    },
}

export default function MaintenancePage() {
    return <UnderConstruction />
}
