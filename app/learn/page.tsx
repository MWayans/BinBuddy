import Link from 'next/link'
import { Section } from '@/components/Section'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GradientBackground } from '@/components/GradientBackground'
import {
  Camera,
  Recycle,
  Shield,
  MapPin,
  Leaf,
  Globe,
  AlertTriangle
} from 'lucide-react'

type DisposalCategory = {
  title: string
  items: string[]
  note: string
}

type ClimateImpactArea = {
  title: string
  detail: string
}

const disposalCategories: DisposalCategory[] = [
  {
    title: 'Recyclables',
    items: [
      'Give bottles and cans a quick rinse; keep paper dry.',
      'Sort plastic, glass, and metal instead of mixing streams.',
      'Flatten boxes and cartons so collection bags go further.'
    ],
    note: 'Check for neighbourhood buy-back centres or county recycling points.'
  },
  {
    title: 'Organic Waste',
    items: [
      'Keep peels and garden trimmings away from plastic packaging.',
      'Home or community composting keeps methane out of dumpsites.',
      'Bag greasy food scraps so they do not spoil other recyclables.'
    ],
    note: 'Works well at home, in schools, and on small plots.'
  },
  {
    title: 'Hazardous & Medical',
    items: [
      'Never toss batteries, paint, or solvents into ordinary rubbish.',
      'Store in original labels or sealed containers until drop-off.',
      'Use pharmacies, clinics, or licensed handlers where offered.'
    ],
    note: 'Poor handling can poison soil, water, or start fires.'
  },
  {
    title: 'E-Waste',
    items: [
      'Back up data and factory-reset phones and laptops first.',
      'Bundle chargers and cables with the device they belong to.',
      'Prefer retailer take-back or registered e-waste collectors.'
    ],
    note: 'Boards and batteries hold valuable metals and toxic components.'
  }
]

const climateImpactAreas: ClimateImpactArea[] = [
  {
    title: 'Coastal Areas',
    detail: 'Plastic and runoff worsen flooding, marine litter, and saltwater damage.'
  },
  {
    title: 'Arid & Semi-Arid Regions',
    detail: 'Illegal dumping dries up grazing land and pollutes scarce water sources.'
  },
  {
    title: 'Urban Centers',
    detail: 'Blocked drains, dump fires, and heat islands hit dense neighbourhoods hardest.'
  },
  {
    title: 'Lake & River Basins',
    detail: 'Waste along waterways harms drinking water, fish stocks, and farm irrigation.'
  }
]

function renderDisposalCard (category: DisposalCategory) {
  return (
    <Card key={category.title} className="border-0 shadow-lg bg-card">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          {category.title}
        </h3>
        <ul className="space-y-2 text-muted-foreground">
          {category.items.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2 h-2 w-2 rounded-full bg-primary/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">{category.note}</p>
      </CardContent>
    </Card>
  )
}

function renderClimateCard (area: ClimateImpactArea) {
  return (
    <Card key={area.title} className="border-0 shadow-lg bg-card">
      <CardContent className="p-6 space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          {area.title}
        </h3>
        <p className="text-muted-foreground">{area.detail}</p>
      </CardContent>
    </Card>
  )
}

export default function LearnPage () {
  return (
    <main className="min-h-screen">
      <Section className="bg-background">
        <div className="container mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Leaf className="w-4 h-4" />
            <span className="text-sm font-medium">Know Before You Throw</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
            A Short Guide to Sorting with BinBuddy
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            BinBuddy turns a quick photo into plain-language disposal steps for Kenya.
            Use it to cut contamination in recycling, avoid risky items in general waste,
            and see how daily sorting ties into wider environmental pressure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="shadow-lg hover:shadow-xl transition-all" asChild>
              <Link href="/chat">
                <Camera className="mr-2 w-5 h-5" />
                Try a Photo Check
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2" asChild>
              <Link href="/#features">Back to Home</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section className="bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">How It Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Picture → Answer → Action
            </h2>
            <p className="text-lg text-muted-foreground">
              Vision AI spots the material; the assistant explains what to do next,
              with Kenyan facilities and habits in mind.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-card">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Snap</h3>
                <p className="text-muted-foreground">
                  Photograph the item on a plain background or upload one from
                  your gallery.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-card">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Recycle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Classify</h3>
                <p className="text-muted-foreground">
                  The app labels the material — plastic, metal, organic, and so on —
                  so you know which stream it belongs in.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-card">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Sort</h3>
                <p className="text-muted-foreground">
                  Read the suggested steps and drop-off hints, then place the item
                  in the right bag, bin, or collection point.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      <Section className="bg-background">
        <div className="container mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Disposal Basics</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              General Rules While You Wait for AI Advice
            </h2>
            <p className="text-lg text-muted-foreground">
              These habits pair well with BinBuddy&apos;s item-specific tips when you
              are sorting at home or work.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {disposalCategories.map(renderDisposalCard)}
          </div>
        </div>
      </Section>

      <Section className="bg-muted/30">
        <GradientBackground variant="accent" className="rounded-3xl p-10 md:p-14">
          <div className="container mx-auto max-w-4xl text-center text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Climate Impact</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Why Sorting Matters Beyond Your Bin
            </h2>
            <p className="text-lg text-white/90">
              Mixed and dumped waste releases methane and toxins. Cleaner streams
              mean fewer dump fires, healthier water, and less pressure on
              communities already facing a changing climate.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {climateImpactAreas.map(renderClimateCard)}
          </div>
        </GradientBackground>
      </Section>

      <Section className="bg-background">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Try It Now</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Put the Next Item in the Right Place
          </h2>
          <p className="text-lg text-muted-foreground">
            One photo is enough to see material type, disposal method, and local
            notes — start with whatever is on your counter today.
          </p>
          <Button size="lg" className="shadow-lg hover:shadow-xl transition-all" asChild>
            <Link href="/chat">Check an Item</Link>
          </Button>
        </div>
      </Section>
    </main>
  )
}

