import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Globe,
  Lightbulb,
  GraduationCap,
  ArrowRight,
  Star,
  Target,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";

const SDG4_GOALS = [
  {
    number: "4.1",
    title: "Free Primary & Secondary Education",
    description:
      "Ensure all girls and boys complete free, equitable, and quality primary and secondary education.",
    icon: BookOpen,
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800/40",
  },
  {
    number: "4.2",
    title: "Early Childhood Development",
    description:
      "Ensure all children have access to quality early childhood development and pre-primary education.",
    icon: Star,
    color: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800/40",
  },
  {
    number: "4.3",
    title: "Equal Access to Higher Education",
    description:
      "Equal access for all women and men to affordable vocational, technical and higher education.",
    icon: GraduationCap,
    color: "from-blue-400 to-indigo-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800/40",
  },
  {
    number: "4.4",
    title: "Relevant Skills for Employment",
    description:
      "Increase the number of youth with relevant technical and vocational skills for decent work.",
    icon: Target,
    color: "from-violet-400 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800/40",
  },
  {
    number: "4.5",
    title: "Gender Equality in Education",
    description:
      "Eliminate gender disparities in education and ensure equal access for the vulnerable.",
    icon: Users,
    color: "from-pink-400 to-rose-500",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    border: "border-pink-200 dark:border-pink-800/40",
  },
  {
    number: "4.7",
    title: "Education for Sustainable Development",
    description:
      "Ensure all learners acquire knowledge needed to promote sustainable development.",
    icon: Globe,
    color: "from-cyan-400 to-sky-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    border: "border-cyan-200 dark:border-cyan-800/40",
  },
];

const STATS = [
  { value: "300M+", label: "Students Impacted" },
  { value: "195", label: "Countries Aligned" },
  { value: "2030", label: "Global Deadline" },
  { value: "SDG 4", label: "Our North Star" },
];

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Class<span className="text-blue-500">Mate</span>
            </span>
          </div>


          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-5">
                Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="rounded-full px-5">
                Log in
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-500/10 to-transparent rounded-full blur-3xl opacity-60" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <Badge
            variant="outline"
            className="mb-6 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-blue-500 border-blue-500/30 bg-blue-500/10 rounded-full"
          >
            <Sparkles className="w-3 h-3 mr-1.5" /> SDG 4 · Quality Education
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
            Education is a{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent">
                human right.
              </span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-blue-500/10 -z-0 rounded" />
            </span>
            <br /> ClassMate makes it real.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A platform built around the UN{"'"}s Sustainable Development Goal 4 — delivering inclusive,
            equitable, quality education and lifelong learning opportunities for all.
          </p>

          {/* Hero CTAs */}
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-blue-500/20"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-blue-500/20"
              >
                Log in to your account <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>

        {/* Stats strip */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-5 rounded-2xl bg-card border border-border shadow-sm"
              >
                <div className="text-3xl font-extrabold">{stat.value}</div>
                <div className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDG 4 Goals */}
      <section id="goals" className="py-24 px-6 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Badge
              variant="outline"
              className="mb-4 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full"
            >
              Our Framework
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              SDG 4 Goals We Champion
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Every feature on ClassMate maps back to a specific UN SDG 4 target. Here{"'"}s what we{"'"}re working toward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SDG4_GOALS.map((goal) => {
              const Icon = goal.icon;
              return (
                <Card
                  key={goal.number}
                  className={`border ${goal.border} ${goal.bg} shadow-none hover:shadow-md transition-shadow duration-200 rounded-2xl overflow-hidden`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center shrink-0 shadow-sm`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-1">
                          Target {goal.number}
                        </div>
                        <h3 className="text-base font-bold mb-2 leading-snug">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{goal.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-8 shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
            Ready to learn with purpose?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join thousands of students and educators using ClassMate to advance quality education worldwide.
          </p>

          {/* CTA buttons */}
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-blue-500/20"
              >
                Open Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-blue-500/20"
              >
                Log in <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Lightbulb className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-foreground">ClassMate</span>
          </div>
          <p>Advancing UN Sustainable Development Goal 4 · Quality Education for All</p>
          <p>© 2026 ClassMate</p>
        </div>
      </footer>

    </div>
  );
}