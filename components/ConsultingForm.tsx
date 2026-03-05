"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function ConsultingForm() {
  const [loading, setLoading] = useState(false);
  const [projectType, setProjectType] = useState("");
  const [budget, setBudget] = useState("");
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      projectType,
      budget,
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({ title: "Inquiry Sent", description: "Check your email for confirmation." });
        (e.target as HTMLFormElement).reset();
        setProjectType("");
        setBudget("");
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.error || "Something went wrong.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit inquiry.", variant: "destructive" });
    }

    setLoading(false);
  }

  return (
    <section className="py-24 bg-white border-t border-neutral-100">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light tracking-tight mb-4 uppercase">Bespoke Consulting</h2>
          <p className="text-neutral-500 font-light">Tell us about your vision. We help build editorial-grade digital products.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-400 font-light">Full Name</label>
              <Input name="name" placeholder="Jane Doe" required className="border-0 border-b rounded-none px-0 font-light focus-visible:ring-0 focus-visible:border-black transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-400 font-light">Email Address</label>
              <Input name="email" type="email" placeholder="jane@example.com" required className="border-0 border-b rounded-none px-0 font-light focus-visible:ring-0 focus-visible:border-black transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-400 font-light">Project Type</label>
              <Select name="projectType" required value={projectType} onValueChange={setProjectType}>
                <SelectTrigger className="border-0 border-b rounded-none px-0 font-light shadow-none focus:ring-0">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SaaS Design">SaaS Design</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="Brand Identity">Brand Identity</SelectItem>
                  <SelectItem value="Custom Development">Custom Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-400 font-light">Budget Range</label>
              <Select name="budget" required value={budget} onValueChange={setBudget}>
                <SelectTrigger className="border-0 border-b rounded-none px-0 font-light shadow-none focus:ring-0">
                  <SelectValue placeholder="Select a range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5k-10k">$5,000 — $10,000</SelectItem>
                  <SelectItem value="10k-25k">$10,000 — $25,000</SelectItem>
                  <SelectItem value="25k-50k">$25,000 — $50,000</SelectItem>
                  <SelectItem value="50k+">$50,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-400 font-light">Project Brief</label>
            <Textarea name="message" placeholder="Describe your product vision..." required className="min-h-[150px] border-0 border-b rounded-none px-0 font-light focus-visible:ring-0 focus-visible:border-black transition-colors resize-none" />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-neutral-800 py-8 text-lg font-light uppercase tracking-widest">
            {loading ? "Sending..." : "Submit Inquiry"}
          </Button>
        </form>
      </div>
    </section>
  );
}
