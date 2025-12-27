"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button" // Changed from outline variant
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Save, Loader2, Globe, Layout, Image as ImageIcon } from "lucide-react"

export default function LandingPageManagement() {
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState<any>({
        hero: { title: "", subtitle: "", button_text: "" },
        features_highlight: { title: "", description: "", feature_1: "", feature_2: "", feature_3: "" },
        institutions_section: {
            title: "", subtitle: "", cta_text: "",
            inst1_tag: "", inst1_name: "", inst1_desc: "", inst1_loc: "",
            inst2_tag: "", inst2_name: "", inst2_desc: "", inst2_loc: "",
            inst3_tag: "", inst3_name: "", inst3_desc: "", inst3_loc: ""
        },
        chairman_message: { title: "", name: "", message: "" },
        footer_contact: { email: "", phone: "" }
    })
    const { toast } = useToast()
    const supabase = createClient()

    useEffect(() => {
        fetchContent()
    }, [])

    const fetchContent = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase.from('landing_page_content').select('*')

            if (error) throw error

            const newContent = { ...content }
            data?.forEach((item: any) => {
                if (newContent[item.section_key]) {
                    newContent[item.section_key] = item.content
                }
            })
            setContent(newContent)
        } catch (error) {
            console.error("Error fetching landing page content:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (section: string) => {
        try {
            setLoading(true)
            const sectionContent = content[section]

            const { error } = await supabase
                .from('landing_page_content')
                .upsert(
                    { section_key: section, content: sectionContent },
                    { onConflict: 'section_key' }
                )

            if (error) throw error

            toast({
                title: "Success",
                description: "Section updated successfully!",
            })
        } catch (error) {
            console.error("Error saving content:", error)
            toast({
                title: "Error",
                description: "Failed to save content",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const update = (section: string, field: string, value: string) => {
        setContent((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }))
    }

    if (loading && !content.hero.title) {
        return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
    }

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Globe className="w-8 h-8 text-primary" />
                        Website Content Manager
                    </h1>
                    <p className="text-muted-foreground mt-1">Updates reflect instantly on zubieducation.in</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => window.open('https://zubieducation.in', '_blank')}>
                    <Layout className="w-4 h-4" /> Open Website
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* HERO SECTION */}
                <Card className="p-6 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Hero Banner (Top Section)</h2>
                        <Button size="sm" onClick={() => handleSave('hero')} disabled={loading}><Save className="w-4 h-4 mr-2" /> Save</Button>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Main Headline</Label>
                            <Input value={content.hero.title} onChange={(e) => update('hero', 'title', e.target.value)} placeholder="Unlock Learning with Expert-Led Education" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description Text</Label>
                            <Textarea value={content.hero.subtitle} onChange={(e) => update('hero', 'subtitle', e.target.value)} rows={2} />
                        </div>
                        <div className="space-y-2">
                            <Label>Button Label</Label>
                            <Input value={content.hero.button_text} onChange={(e) => update('hero', 'button_text', e.target.value)} placeholder="Start Learning" className="max-w-[200px]" />
                        </div>
                    </div>
                </Card>

                {/* FEATURES HIGHLIGHT */}
                <Card className="p-6 border-l-4 border-l-purple-500">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">"Better Education" Section</h2>
                        <Button size="sm" onClick={() => handleSave('features_highlight')} disabled={loading}><Save className="w-4 h-4 mr-2" /> Save</Button>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Section Heading</Label>
                            <Input value={content.features_highlight.title} onChange={(e) => update('features_highlight', 'title', e.target.value)} placeholder="Better Education, Better Future" />
                        </div>
                        <div className="space-y-2">
                            <Label>Sub-text</Label>
                            <Input value={content.features_highlight.description} onChange={(e) => update('features_highlight', 'description', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 gap-3 pt-2">
                            <Input value={content.features_highlight.feature_1} onChange={(e) => update('features_highlight', 'feature_1', e.target.value)} placeholder="Feature 1 (e.g. Skill-Driven Learning)" />
                            <Input value={content.features_highlight.feature_2} onChange={(e) => update('features_highlight', 'feature_2', e.target.value)} placeholder="Feature 2" />
                            <Input value={content.features_highlight.feature_3} onChange={(e) => update('features_highlight', 'feature_3', e.target.value)} placeholder="Feature 3" />
                        </div>
                    </div>
                </Card>

                {/* CHAIRMAN MESSAGE */}
                <Card className="p-6 border-l-4 border-l-orange-500 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Chairman's Message</h2>
                        <Button size="sm" onClick={() => handleSave('chairman_message')} disabled={loading}><Save className="w-4 h-4 mr-2" /> Save</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Section Title</Label>
                                <Input value={content.chairman_message.title} onChange={(e) => update('chairman_message', 'title', e.target.value)} placeholder="Message from Our Chairman" />
                            </div>
                            <div className="space-y-2">
                                <Label>Chairman Name</Label>
                                <Input value={content.chairman_message.name} onChange={(e) => update('chairman_message', 'name', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Full Message Body</Label>
                            <Textarea value={content.chairman_message.message} onChange={(e) => update('chairman_message', 'message', e.target.value)} rows={6} placeholder="Write the full message here..." />
                        </div>
                    </div>
                </Card>

                {/* OUR INSTITUTIONS SECTION */}
                <Card className="p-6 border-l-4 border-l-green-600 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">"Our Institutions" Section</h2>
                        <Button size="sm" onClick={() => handleSave('institutions_section')} disabled={loading}><Save className="w-4 h-4 mr-2" /> Save</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Section Title</Label>
                                <Input value={content.institutions_section?.title} onChange={(e) => update('institutions_section', 'title', e.target.value)} placeholder="Our Institutions" />
                            </div>
                            <div className="space-y-2">
                                <Label>View All Link Text</Label>
                                <Input value={content.institutions_section?.cta_text} onChange={(e) => update('institutions_section', 'cta_text', e.target.value)} placeholder="View All Institutions" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Subtitle / Description</Label>
                            <Textarea value={content.institutions_section?.subtitle} onChange={(e) => update('institutions_section', 'subtitle', e.target.value)} rows={3} placeholder="Brief text below the title..." />
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Card 1 */}
                        <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                            <div className="font-bold text-sm text-blue-600">Card 1: Health Care</div>
                            <Input placeholder="Tag (e.g. INSTITUTE)" value={content.institutions_section?.inst1_tag} onChange={(e) => update('institutions_section', 'inst1_tag', e.target.value)} />
                            <Input placeholder="Name" value={content.institutions_section?.inst1_name} onChange={(e) => update('institutions_section', 'inst1_name', e.target.value)} />
                            <Input placeholder="Description" value={content.institutions_section?.inst1_desc} onChange={(e) => update('institutions_section', 'inst1_desc', e.target.value)} />
                            <Input placeholder="Location" value={content.institutions_section?.inst1_loc} onChange={(e) => update('institutions_section', 'inst1_loc', e.target.value)} />
                        </div>

                        {/* Card 2 */}
                        <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                            <div className="font-bold text-sm text-purple-600">Card 2: Skill Dev</div>
                            <Input placeholder="Tag (e.g. TRAINING CENTRE)" value={content.institutions_section?.inst2_tag} onChange={(e) => update('institutions_section', 'inst2_tag', e.target.value)} />
                            <Input placeholder="Name" value={content.institutions_section?.inst2_name} onChange={(e) => update('institutions_section', 'inst2_name', e.target.value)} />
                            <Input placeholder="Description" value={content.institutions_section?.inst2_desc} onChange={(e) => update('institutions_section', 'inst2_desc', e.target.value)} />
                            <Input placeholder="Location" value={content.institutions_section?.inst2_loc} onChange={(e) => update('institutions_section', 'inst2_loc', e.target.value)} />
                        </div>

                        {/* Card 3 */}
                        <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                            <div className="font-bold text-sm text-orange-600">Card 3: College</div>
                            <Input placeholder="Tag (e.g. COLLEGE)" value={content.institutions_section?.inst3_tag} onChange={(e) => update('institutions_section', 'inst3_tag', e.target.value)} />
                            <Input placeholder="Name" value={content.institutions_section?.inst3_name} onChange={(e) => update('institutions_section', 'inst3_name', e.target.value)} />
                            <Input placeholder="Description" value={content.institutions_section?.inst3_desc} onChange={(e) => update('institutions_section', 'inst3_desc', e.target.value)} />
                            <Input placeholder="Location" value={content.institutions_section?.inst3_loc} onChange={(e) => update('institutions_section', 'inst3_loc', e.target.value)} />
                        </div>
                    </div>
                </Card>

                {/* FOOTER CONTACT */}
                <Card className="p-6 border-l-4 border-l-gray-500 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Footer Contact Info</h2>
                        <Button size="sm" onClick={() => handleSave('footer_contact')} disabled={loading}><Save className="w-4 h-4 mr-2" /> Save</Button>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Contact Email</Label>
                            <Input value={content.footer_contact.email} onChange={(e) => update('footer_contact', 'email', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input value={content.footer_contact.phone} onChange={(e) => update('footer_contact', 'phone', e.target.value)} />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
