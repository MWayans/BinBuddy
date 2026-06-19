import { Section } from "@/components/Section";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Section className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-3">Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using BinBuddy, you agree to be bound by these Terms of Service and all applicable laws and
                regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Use License</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Permission is granted to temporarily use BinBuddy for personal, non-commercial use. This is the grant of a license,
                not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to reverse engineer any software contained in BinBuddy</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                The materials on BinBuddy are provided on an &apos;as is&apos; basis. BinBuddy makes no warranties, expressed or implied,
                and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions
                of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation
                of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Service Nature and Limitations</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-foreground">BinBuddy is an informational tool.</strong> It suggests how household
                and similar waste might be sorted in Kenya. It does not replace municipal rules, licensed haulers, or
                on-site instructions at recycling centres.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-foreground">BinBuddy is not liable for:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
                <li>Incorrect labels when images are blurry, mixed, or non-standard</li>
                <li>Harm from handling batteries, chemicals, medical, or e-waste</li>
                <li>Refusal of items at a drop-off point you choose to visit</li>
                <li>Environmental or legal consequences of how you dispose of waste</li>
                <li>Service outages, AI errors, or third-party API failures</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You remain responsible for verifying advice against current local law and facility policies.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                To the fullest extent permitted by law, BinBuddy and its contributors are not liable for indirect,
                incidental, or consequential damages arising from use of the app or reliance on its suggestions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Accuracy of Materials</h2>
              <p className="text-muted-foreground leading-relaxed">
                The materials appearing on BinBuddy could include technical, typographical, or photographic errors. BinBuddy does not
                warrant that any of the materials on its website are accurate, complete, or current. BinBuddy may make changes to the
                materials contained on its website at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                BinBuddy may revise these terms of service for its website at any time without notice. By using this website you
                are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at{" "}
                <Link href="/contact" className="text-primary hover:underline">our contact page</Link>.
              </p>
            </section>
          </div>
        </div>
      </Section>
    </main>
  );
}

