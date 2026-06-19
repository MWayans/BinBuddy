import { Section } from "@/components/Section";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold mb-4 text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                BinBuddy helps you sort waste from photos. This policy explains what we collect,
                how we use it, and the limits of our advice. We keep data collection narrow and
                focused on running the sorting service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Images you upload or capture for disposal checks</li>
                <li>Optional text notes you add with a photo</li>
                <li>Basic technical logs (browser type, errors, timestamps)</li>
                <li>Contact details if you email us through the contact form</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Personalize your experience and provide recommendations</li>
                <li>Process your requests and respond to your inquiries</li>
                <li>Send you technical notices and support messages</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Service Disclaimer and Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-foreground">Important:</strong> BinBuddy offers educational sorting suggestions, not legal or professional waste-handling services.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-foreground">We are not responsible for:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
                <li>How you handle, transport, or dispose of items after reading our advice</li>
                <li>Injury from sharp, toxic, or heavy waste you choose to move</li>
                <li>Fines or penalties if local rules differ from our generic guidance</li>
                <li>Facility hours, acceptance policies, or fees at third-party drop-off points</li>
                <li>Misclassification when photos are unclear or items are unusual</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Always follow county regulations, signage at collection sites, and common sense for hazardous
                materials. When in doubt, contact your local waste authority or a licensed handler.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information.
                However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to access, update, or delete your personal information at any time. You can also opt out
                of certain data collection practices. To exercise these rights, please contact us using the information
                provided in the Contact section.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <Link href="/contact" className="text-primary hover:underline">our contact page</Link>.
              </p>
            </section>
          </div>
        </div>
      </Section>
    </main>
  );
}

