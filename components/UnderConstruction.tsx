'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Construction, Mail, Send, Github, Linkedin, Globe, Clock, Wrench, Sparkles, LogOut, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useClerk, SignedIn, SignedOut } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function UnderConstruction() {
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
    const { toast } = useToast()
    const { signOut } = useClerk()
    const router = useRouter()

    // Monitor maintenance mode - redirect to dashboard when it's turned off
    useEffect(() => {
        // Initial check
        checkMaintenanceMode()

        // Subscribe to real-time changes
        const channel = supabase
            .channel('maintenance-recovery-checker')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'maintenance_settings',
                    filter: 'key=eq.maintenance_mode'
                },
                (payload) => {
                    console.log('[MaintenanceRecovery] Maintenance mode changed:', payload)
                    if (payload.new && 'value' in payload.new) {
                        const isEnabled = payload.new.value as boolean
                        if (!isEnabled) {
                            // Maintenance mode turned OFF - redirect to dashboard
                            console.log('[MaintenanceRecovery] Redirecting to dashboard')
                            toast({
                                title: "We're back!",
                                description: "Maintenance is complete. Redirecting...",
                            })
                            setTimeout(() => {
                                window.location.href = '/dashboard'
                            }, 1000)
                        }
                    }
                }
            )
            .subscribe((status) => {
                console.log('[MaintenanceRecovery] Subscription status:', status)
            })

        // Fallback polling every 5 seconds
        const pollInterval = setInterval(checkMaintenanceMode, 5000)

        return () => {
            supabase.removeChannel(channel)
            clearInterval(pollInterval)
        }
    }, [router, toast])

    async function checkMaintenanceMode() {
        try {
            const response = await fetch(`/api/maintenance/status?t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                }
            })
            const data = await response.json()
            
            if (!data.enabled) {
                console.log('[MaintenanceRecovery] Maintenance mode ended via polling')
                window.location.href = '/dashboard'
            }
        } catch (error) {
            console.error('[MaintenanceRecovery] Error checking maintenance mode:', error)
        }
    }

    const handleSubmit = async () => {
        if (contactForm.name && contactForm.email && contactForm.message) {
            try {
                const formData = new FormData()
                formData.append('name', contactForm.name)
                formData.append('email', contactForm.email)
                formData.append('message', contactForm.message)

                const response = await fetch('/api/contact', {
                    method: 'POST',
                    body: formData
                })

                if (response.ok) {
                    toast({
                        title: "Message Sent!",
                        description: "Thank you for reaching out. I'll get back to you soon!",
                    })
                    setContactForm({ name: '', email: '', message: '' })
                } else {
                    throw new Error('Failed to send message')
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to send message. Please try again later.",
                    variant: "destructive"
                })
            }
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20">
            {/* Animated background gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 dark:bg-yellow-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    {/* Animated Icon */}
                    <motion.div
                        className="inline-block mb-8"
                        animate={{
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                            <div className="relative p-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl">
                                <Construction className="w-20 h-20 text-white" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
                    >
                        Under Construction
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-4 max-w-2xl mx-auto"
                    >
                        We're working hard to bring you something amazing!
                    </motion.p>

                    {/* Status Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-full shadow-lg border border-white/30 dark:border-white/20"
                    >
                        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Scheduled maintenance in progress
                        </span>
                    </motion.div>
                </motion.div>

                {/* Logout Option for Admins/Users stuck in session */}
                <SignedIn>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="mb-8"
                    >
                        <Button
                            onClick={() => signOut(() => router.push('/'))}
                            variant="outline"
                            size="sm"
                            className="gap-2 border-red-200 hover:bg-red-50 text-red-600 dark:border-red-900 dark:hover:bg-red-950/30 dark:text-red-400"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </Button>
                    </motion.div>
                </SignedIn>

                {/* Debug Info for troubleshooting */}

            {/* Login Option for Admins who are logged out */}
            <SignedOut>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="mb-8"
                >
                    <Link href="/sign-in">
                        <Button variant="outline" size="sm" className="gap-2 border-blue-200 hover:bg-blue-50 text-blue-600 dark:border-blue-900 dark:hover:bg-blue-950/30 dark:text-blue-400">
                            <UserCog className="w-4 h-4" />
                            Admin Login
                        </Button>
                    </Link>
                </motion.div>
            </SignedOut>

            {/* Contact Card */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="w-full max-w-2xl"
            >
                <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-2xl">
                    <CardContent className="p-8">
                        {/* Contact Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
                                <Mail className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Get in Touch
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Have questions or feedback? Feel free to reach out!
                            </p>
                        </div>

                        {/* Contact Form */}
                        <div className="space-y-4 mb-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter your name"
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="your@email.com"
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                                    placeholder="What would you like to know?"
                                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    rows={4}
                                />
                            </div>

                            <Button
                                onClick={handleSubmit}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                disabled={!contactForm.name || !contactForm.email || !contactForm.message}
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Send Message
                            </Button>
                        </div>

                        {/* Developer Info */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Connect with the Developer
                            </p>
                            <div className="flex justify-center space-x-4">
                                {/* GitHub */}
                                <motion.a
                                    href="https://github.com/vigneshlagishetti"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-black dark:hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    whileHover={{ scale: 1.1, y: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="GitHub Profile"
                                >
                                    <Github className="w-6 h-6" />
                                </motion.a>

                                {/* LinkedIn */}
                                <motion.a
                                    href="https://www.linkedin.com/in/vignesh-lagishetti-69a102219/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-12 h-12 bg-[#0077B5] text-white rounded-xl hover:bg-[#005885] transition-all duration-300 shadow-lg hover:shadow-xl"
                                    whileHover={{ scale: 1.1, y: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="LinkedIn Profile"
                                >
                                    <Linkedin className="w-6 h-6" />
                                </motion.a>

                                {/* Portfolio */}
                                <motion.a
                                    href="https://www.vigneshlagishetti.me/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 text-white rounded-xl hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    whileHover={{ scale: 1.1, y: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="Portfolio Website"
                                >
                                    <Globe className="w-6 h-6" />
                                </motion.a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="text-center mt-12"
            >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Developed by <span className="font-semibold text-blue-600 dark:text-blue-400">Lagishetti Vignesh</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                    © 2026 Lagishetti Vignesh. All rights reserved.
                </p>
            </motion.footer>
            </div>
        </div>
    )
}
