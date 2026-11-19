import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, DollarSign, Users, MapPin, ArrowRight, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import JobApplicationForm from '@/components/careers/JobApplicationForm';
import { usePageSEO } from '@/hooks/usePageSEO';
import { trackPhoneCallClick } from '@/utils/conversionTracking';
import { HIRING_STEPS, JOB_OPENINGS } from '@/data/careers';

const benefits = [
  {
    icon: Trophy,
    title: 'Industry Leadership',
    description: 'Work with a Mitsubishi Diamond Contractor and HERS certified company at the forefront of energy-efficient HVAC solutions.',
  },
  {
    icon: TrendingUp,
    title: 'Career Growth',
    description: 'Continuous training opportunities and clear advancement paths to help you reach your professional goals.',
  },
  {
    icon: DollarSign,
    title: 'Competitive Pay',
    description: 'We offer competitive compensation packages that recognize your skills and experience in the industry.',
  },
  {
    icon: Users,
    title: 'Great Team Culture',
    description: 'Join a supportive team environment where your contributions are valued and recognized.',
  },
];

const Careers = () => {
  usePageSEO();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Join Our Team
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Build Your Career with Dallas-Fort Worth's Premier Energy-Efficient HVAC Company
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Work at Truficient */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground"
          >
            Why Work at Truficient?
          </motion.h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover-lift bg-card">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-7 h-7 text-secondary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-card-foreground">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section className="py-16 lg:py-24 bg-primary">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary-foreground"
          >
            Current Openings
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {JOB_OPENINGS.map((job, index) => (
              <motion.div
                key={job.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card">
                  <CardContent className="p-8 flex flex-col h-full">
                    <span className="self-start inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-sm mb-4">
                      {job.badge}
                    </span>
                    <h3 className="text-2xl font-bold text-card-foreground">{job.title}</h3>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1 mb-4">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </p>
                    <p className="text-muted-foreground flex-1">{job.summary}</p>
                    <Button asChild className="mt-6 self-start bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold">
                      <Link to={job.path}>
                        See the job <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How hiring works */}
      <section className="py-16 lg:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">How Hiring Works</h2>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {HIRING_STEPS.map((step, i) => (
              <li key={step.title} className="text-center">
                <span className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {i + 1}
                </span>
                <p className="font-bold text-foreground mb-1">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-16 lg:py-24 bg-background scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Apply Now</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One short application for every opening. It takes about five minutes, and a resume is optional.
            </p>
          </div>
          <JobApplicationForm />
        </div>
      </section>

      {/* Questions CTA */}
      <section 
        className="py-20 lg:py-28 relative bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=500&fit=crop')"
        }}
      >
        <div className="absolute inset-0 bg-primary/85" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-primary-foreground"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Questions?
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Have questions about career opportunities at Truficient? We'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg" 
                className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold"
              >
                <a 
                  href="tel:214-238-4349"
                  onClick={() => trackPhoneCallClick('Careers Page')}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  214-238-4349
                </a>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold"
              >
                <a href="mailto:info@truficient.com">
                  <Mail className="w-5 h-5 mr-2" />
                  info@truficient.com
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
