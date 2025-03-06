import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-[#0D7A3B] text-white overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="container relative py-20 md:py-28 flex flex-col items-center text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl max-w-4xl mb-6">
            About Masjid AnNoor
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Our journey, mission, and commitment to the community
          </p>
        </div>
      </section>

      <section className="container px-4 md:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4 lg:col-span-5">
            <div className="sticky top-24">
              <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-elegant mb-6">
                <Image src="/placeholder.svg?height=800&width=600" alt="Masjid AnNoor" fill className="object-cover" />
              </div>
              <div className="bg-secondary rounded-xl p-6">
                <h3 className="text-xl font-heading font-bold mb-4">Visit Us</h3>
                <p className="text-muted-foreground mb-2">
                  We welcome you to visit Masjid AnNoor and be part of our growing community.
                </p>
                <p className="font-medium">
                  1800 S. Albert Pike Ave
                  <br />
                  Fort Smith, AR 72903
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-7">
            <Card className="border-0 shadow-elegant overflow-hidden">
              <CardContent className="p-8 md:p-10">
                <div className="space-y-10">
                  <section>
                    <h2 className="text-3xl font-heading font-bold gradient-heading mb-6">Our Journey</h2>
                    <p className="text-lg leading-relaxed mb-4">
                      Sunnie Islamic Center was founded in 1993 with a vision to serve the spiritual, educational, and
                      social needs of the Muslim community. What began in a small commercial unit has grown into a
                      thriving center of worship and community support.
                    </p>
                    <p className="text-lg leading-relaxed">
                      In 2005, the founders acquired 1800 S Albert Pike Ave, which is now known as Masjid Annoor, a
                      beacon of faith and service in our community.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-3xl font-heading font-bold gradient-heading mb-6">Our Mission</h2>
                    <p className="text-lg leading-relaxed">
                      At Sunnie Islamic Center, we are dedicated to fostering a welcoming and inclusive environment for
                      all. Our mission is to provide a space for prayer, learning, and community engagement, rooted in
                      the teachings of Islam. Through educational programs, humanitarian initiatives, and outreach
                      efforts, we strive to strengthen our community and contribute positively to society.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-3xl font-heading font-bold gradient-heading mb-6">Our Services</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="bg-secondary p-6 rounded-xl">
                        <h3 className="text-xl font-medium mb-3">Daily & Jumu'ah Prayers</h3>
                        <p className="text-muted-foreground">A place for spiritual growth and connection.</p>
                      </div>
                      <div className="bg-secondary p-6 rounded-xl">
                        <h3 className="text-xl font-medium mb-3">Islamic Education</h3>
                        <p className="text-muted-foreground">Classes and programs for children and adults.</p>
                      </div>
                      <div className="bg-secondary p-6 rounded-xl">
                        <h3 className="text-xl font-medium mb-3">Community Outreach</h3>
                        <p className="text-muted-foreground">Humanitarian efforts, including aid for those in need.</p>
                      </div>
                      <div className="bg-secondary p-6 rounded-xl">
                        <h3 className="text-xl font-medium mb-3">Youth & Family Programs</h3>
                        <p className="text-muted-foreground">Strengthening faith and values across generations.</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-3xl font-heading font-bold gradient-heading mb-6">Join Us</h2>
                    <p className="text-lg leading-relaxed">
                      We welcome you to visit Masjid Annoor and be part of our growing community. Whether you seek a
                      place of worship, learning, or support, Sunnie Islamic Center is here for you.
                    </p>
                  </section>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

