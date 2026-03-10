"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { TargetAndTransition } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const floatingCard = (delay: number): { animate: TargetAndTransition } => ({
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 5,
      ease: "easeInOut",
      repeat: Number.POSITIVE_INFINITY,
      delay,
    },
  },
});

const howItWorks = [
  {
    icon: "01",
    title: "Partagez votre lien de réservation",
    description:
      "Ajoutez votre lien ZenGrow sur votre site web, votre Instagram, votre profil Google ou votre page Facebook.",
  },
  {
    icon: "02",
    title: "Les clients réservent leur table en ligne",
    description:
      "Ils choisissent simplement la date, l'heure et le nombre de personnes. La réservation apparaît immédiatement dans votre tableau de bord.",
  },
  {
    icon: "03",
    title: "Recevez les réservations automatiquement",
    description:
      "Toutes vos réservations sont centralisées dans un tableau de bord simple et clair.",
  },
];

const productFeatures = [
  "Réservations en ligne",
  "Lien de réservation unique",
  "Gestion simple des disponibilités",
  "Confirmation automatique",
  "Demandes d'avis Google automatisées",
  "Base de données clients",
  "Tableau de bord clair",
];

const featureGrid = [
  "Saint-Valentin",
  "Menus de Noël",
  "Soirées spéciales",
  "Événements du restaurant",
];

const reservationPainPoints = [
  {
    title: "Appels pendant le service",
    description: "Vous perdez du temps en plein coup de feu pour répondre au téléphone.",
  },
  {
    title: "Réservations perdues",
    description: "Les notes papier et messages dispersés créent des oublis et des erreurs.",
  },
  {
    title: "Clients qui abandonnent",
    description: "Sans réservation en ligne simple, certains clients ne finalisent pas.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "35 CHF",
    popular: false,
    cta: "Commencer avec Starter",
    tagline: "Idéal pour démarrer la réservation en ligne",
    features: [
      "Réservations en ligne illimitées",
      "Page de réservation personnalisée",
      "Gestion des disponibilités",
      "Demandes d'avis Google automatiques",
      "Retours privés des clients",
      "Base clients",
    ],
  },
  {
    name: "Pro",
    price: "49 CHF",
    popular: true,
    cta: "Commencer avec Pro",
    tagline: "Pour accélérer la croissance de votre restaurant",
    features: [
      "Tout le plan Starter",
      "Campagnes e-mail marketing",
      "Segmentation clients",
      "Statistiques clients",
      "Export base clients",
      "Automatisations marketing",
    ],
  },
];

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-[#F6FBFA] text-[#0F3F3A]">
      <header className="sticky top-0 z-40 border-b border-[#DDEFEA]/70 bg-[#F6FBFA]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
          <Image
            src="/Zengrow-logo.png"
            alt="Logo ZenGrow"
            width={165}
            height={46}
            className="h-10 w-auto object-contain"
            priority
          />
          <nav className="hidden items-center gap-8 text-sm text-[#0F3F3A]/70 md:flex">
            <a href="#how-it-works" className="transition hover:text-[#0F3F3A]">
              Comment ça marche
            </a>
            <a href="#product" className="transition hover:text-[#0F3F3A]">
              Fonctionnalités
            </a>
            <a href="#pricing" className="transition hover:text-[#0F3F3A]">
              Tarifs
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-[#0F3F3A]/80 transition hover:text-[#0F3F3A] sm:inline-flex"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="inline-flex rounded-full bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(31,122,108,0.8)] transition hover:scale-[1.02]"
            >
              Créer mon restaurant
            </Link>
          </div>
        </div>
        <div className="border-t border-[#DDEFEA]/70 px-6 py-3 md:hidden">
          <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 text-sm font-medium text-[#0F3F3A]/80">
            <a href="#how-it-works" className="transition hover:text-[#0F3F3A]">
              Comment ça marche
            </a>
            <a href="#pricing" className="transition hover:text-[#0F3F3A]">
              Tarifs
            </a>
            <Link href="/login" className="transition hover:text-[#0F3F3A]">
              Connexion
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-14 md:pb-28 md:pt-20 lg:px-8">
          <div className="absolute left-1/2 top-20 -z-10 h-[450px] w-[min(90vw,700px)] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#1F7A6C]/25 via-[#3DBE9F]/20 to-transparent blur-3xl" />

          <div className="grid items-center gap-14 lg:grid-cols-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="space-y-7"
            >
              <span className="inline-flex rounded-full border border-[#CBE6DF] bg-white/70 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#1F7A6C]">
                Optimisez les réservations de votre restaurant
              </span>
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-[3.4rem]">
                La façon la plus simple de gérer les réservations de votre
                restaurant.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[#0F3F3A]/70">
                Vos clients réservent leur table en ligne en quelques secondes.
                Vous recevez toutes les réservations dans un tableau de bord
                clair, et ZenGrow automatise les demandes d&apos;avis Google après
                chaque visite.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_-18px_rgba(31,122,108,0.9)] transition hover:scale-[1.01]"
                >
                  Créer mon restaurant
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-full border border-[#CBE6DF] bg-white px-6 py-3 text-sm font-semibold text-[#0F3F3A] transition hover:border-[#A3D8CC] hover:bg-[#F0F9F7]"
                >
                  Voir comment ça fonctionne
                </a>
              </div>
              <p className="text-sm text-[#0F3F3A]/60">
                Installation en 5 minutes • Sans commission • Résiliation à tout
                moment
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
              className="relative lg:pl-6"
            >
              <motion.div
                initial={{ rotate: -1.5 }}
                animate={{ rotate: 1.5 }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
                className="rounded-[30px] border border-[#D1EAE4] bg-white p-5 shadow-[0_35px_70px_-45px_rgba(15,63,58,0.7)]"
              >
                <div className="rounded-3xl border border-[#E1F0EC] bg-[#F9FDFC] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-[#0F3F3A]/45">
                        Tableau de bord ZenGrow
                      </p>
                      <p className="text-sm font-medium text-[#0F3F3A]/75">
                        Vue d&apos;ensemble du jour
                      </p>
                    </div>
                    <span className="rounded-full bg-[#EAF8F4] px-3 py-1 text-xs font-semibold text-[#1F7A6C]">
                      En direct
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                      <p className="text-xs text-[#0F3F3A]/55">
                        Réservations du jour
                      </p>
                      <p className="mt-1 text-2xl font-semibold">37</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                      <p className="text-xs text-[#0F3F3A]/55">Taux de no-show</p>
                      <p className="mt-1 text-2xl font-semibold">3.8%</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                      <p className="text-xs text-[#0F3F3A]/55">Avis Google</p>
                      <p className="mt-1 text-2xl font-semibold">+14</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-[#0F3F3A]/55">
                      Prochaines réservations
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between rounded-xl bg-[#F3FBF8] px-3 py-2">
                        <span>Table de 2 - Emma R.</span>
                        <span className="font-semibold text-[#1F7A6C]">19:30</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-[#F3FBF8] px-3 py-2">
                        <span>Table de 4 - Noah M.</span>
                        <span className="font-semibold text-[#1F7A6C]">20:15</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                {...floatingCard(0)}
                className="absolute -left-10 -top-7 w-44 rounded-2xl border border-[#D9EEE8] bg-white p-3 shadow-[0_25px_50px_-35px_rgba(15,63,58,0.9)]"
              >
                <p className="text-xs text-[#0F3F3A]/55">Carte réservation</p>
                <p className="mt-1 text-sm font-semibold">Nouvelle réservation</p>
              </motion.div>
              <motion.div
                {...floatingCard(0.6)}
                className="absolute -right-10 top-6 w-48 rounded-2xl border border-[#D9EEE8] bg-white p-3 shadow-[0_25px_50px_-35px_rgba(15,63,58,0.9)]"
              >
                <p className="text-xs text-[#0F3F3A]/55">Carte avis Google</p>
                <p className="mt-1 text-sm font-semibold">
                  Demande d&apos;avis envoyée
                </p>
              </motion.div>
              <motion.div
                {...floatingCard(1.1)}
                className="absolute -bottom-9 right-8 w-44 rounded-2xl border border-[#D9EEE8] bg-white p-3 shadow-[0_25px_50px_-35px_rgba(15,63,58,0.9)]"
              >
                <p className="text-xs text-[#0F3F3A]/55">Carte statistiques</p>
                <p className="mt-1 text-sm font-semibold">Réservations du jour</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-[#DDEFEA] bg-white/70">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-4xl text-center"
            >
              <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Les réservations ne devraient pas être compliquées.
              </h2>
              <p className="mt-4 text-base leading-8 text-[#0F3F3A]/70">
                ZenGrow remplace les frictions du quotidien par une expérience fluide pour votre équipe et vos clients.
              </p>
            </motion.div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {reservationPainPoints.map((item, index) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="rounded-3xl border border-[#E0EEEA] bg-white p-6 shadow-[0_20px_45px_-35px_rgba(15,63,58,1)]"
                >
                  <span className="inline-flex rounded-full bg-[#EAF8F4] px-3 py-1 text-xs font-semibold text-[#1F7A6C]">
                    Problème fréquent
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-[#0F3F3A]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#0F3F3A]/70">{item.description}</p>
                </motion.article>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
              className="mt-10 rounded-[30px] border border-[#CFE9E2] bg-gradient-to-r from-[#F5FCFA] to-white p-7 md:flex md:items-center md:justify-between md:gap-8"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1F7A6C]">La solution ZenGrow</p>
                <p className="mt-2 text-lg font-semibold text-[#0F3F3A]">
                  Réservations en ligne, disponibilité en temps réel et suivi client au même endroit.
                </p>
              </div>
              <Link
                href="/signup"
                className="mt-5 inline-flex rounded-full bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95 md:mt-0"
              >
                Créer mon restaurant
              </Link>
            </motion.div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
            transition={{ duration: 0.55 }}
          >
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Comment fonctionne ZenGrow
            </h2>
          </motion.div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {howItWorks.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className="rounded-3xl border border-[#DDEFEA] bg-white p-7 shadow-[0_18px_45px_-35px_rgba(15,63,58,1)]"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] text-xs font-semibold text-white">
                  {item.icon}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-[#0F3F3A]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#0F3F3A]/70">
                  {item.description}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="product" className="bg-white/70">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55 }}
              className="rounded-[30px] border border-[#DDEFEA] bg-white p-6 shadow-[0_30px_65px_-45px_rgba(15,63,58,0.9)]"
            >
              <div className="rounded-3xl bg-gradient-to-br from-[#F6FBFA] to-[#ECF8F5] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold">Tableau de bord ZenGrow</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs text-[#1F7A6C]">
                    Réservations
                  </span>
                </div>
                <div className="space-y-2">
                  {[["12:00", "2 personnes"], ["12:30", "4 personnes"], ["13:15", "3 personnes"]].map(
                    (reservation) => (
                      <div
                        key={reservation[0]}
                        className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm"
                      >
                        <span>{reservation[0]}</span>
                        <span className="text-[#0F3F3A]/65">{reservation[1]}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55 }}
              className="self-center"
            >
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Tout ce dont vous avez besoin pour gérer vos réservations
              </h2>
              <ul className="mt-7 space-y-3">
                {productFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 rounded-2xl border border-[#DDEFEA] bg-white px-4 py-3 text-sm font-medium text-[#0F3F3A]/80"
                  >
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
            transition={{ duration: 0.55 }}
            className="relative overflow-hidden rounded-[36px] border border-[#CFE9E2] bg-gradient-to-br from-white to-[#ECF8F5] p-8 md:p-12"
          >
            <div className="absolute -left-24 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-[#1F7A6C]/12 blur-3xl" />
            <div className="absolute -right-12 top-10 h-44 w-44 rounded-full bg-[#3DBE9F]/20 blur-3xl" />
            <h2 className="relative max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Transformez chaque visite en avis Google.
            </h2>
            <p className="relative mt-4 max-w-2xl text-[#0F3F3A]/70">
              La plupart des clients satisfaits ne pensent pas à laisser un avis.
              ZenGrow envoie automatiquement un message après la visite pour
              inviter vos clients à partager leur expérience.
            </p>
            <p className="relative mt-4 max-w-2xl font-medium text-[#0F3F3A]/80">
              Résultat : plus d&apos;avis, une meilleure note moyenne et plus de
              visibilité sur Google.
            </p>

            <div className="relative mt-9 grid gap-4 md:grid-cols-3">
              {["SMS envoyé", "Message WhatsApp", "Avis reçu"].map(
                (card, index) => (
                  <motion.div
                    key={card}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    whileHover={{ y: -5 }}
                    className="rounded-2xl border border-[#DDEFEA] bg-white/95 p-5 shadow-[0_20px_45px_-35px_rgba(15,63,58,1)]"
                  >
                    <p className="text-sm font-semibold">{card}</p>
                    <p className="mt-2 text-sm text-[#0F3F3A]/65">
                      Automatique, envoyé au bon moment, sans relance manuelle.
                    </p>
                  </motion.div>
                ),
              )}
            </div>
          </motion.div>
        </section>

        <section className="bg-white/70">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Construisez votre base de clients.
            </motion.h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#0F3F3A]/70">
              Chaque réservation vous permet de récupérer des informations
              précieuses : nom, e-mail, téléphone.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#0F3F3A]/70">
              Vous pouvez ensuite recontacter facilement vos clients pour :
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {featureGrid.map((feature, index) => (
                <motion.article
                  key={feature}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.07 }}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-[#DDEFEA] bg-white p-7 shadow-[0_18px_45px_-35px_rgba(15,63,58,1)]"
                >
                  <p className="text-lg font-semibold">{feature}</p>
                </motion.article>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#0F3F3A]/75">
              Au lieu d&apos;attendre les clients, vous pouvez les faire revenir.
            </p>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Simple et transparent
          </motion.h2>
          <p className="mt-4 max-w-2xl text-[#0F3F3A]/70">
            Comparez les plans et choisissez l'offre adaptée à votre restaurant.
            Le plan Pro est idéal pour accélérer votre croissance.
          </p>
          <p className="mt-2 text-sm font-medium text-[#1F7A6C]">
            Plus de réservations récurrentes, moins d'actions manuelles.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {plans.map((plan, index) => (
              <motion.article
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -5 }}
                className={`relative overflow-hidden rounded-3xl border p-7 ${
                  plan.popular
                    ? "scale-[1.02] border-[#1F7A6C] bg-gradient-to-b from-[#F7FFFC] to-white shadow-[0_28px_65px_-30px_rgba(31,122,108,0.95)]"
                    : "border-[#DDEFEA] bg-white"
                }`}
              >
                {plan.popular ? (
                  <div className="pointer-events-none absolute -top-8 right-[-58px] rotate-45 bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] px-16 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-md">
                    Le plus populaire
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  {plan.popular ? (
                    <span className="rounded-full bg-[#EAF8F4] px-3 py-1 text-xs font-semibold text-[#1F7A6C]">
                      Le plus populaire
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-[#0F3F3A]/65">{plan.tagline}</p>
                <p className="mt-6 text-5xl font-semibold tracking-tight">
                  {plan.price}
                </p>
                <p className="mt-1 text-sm text-[#0F3F3A]/65">/ mois</p>
                <p className="mt-3 text-sm text-[#0F3F3A]/65">
                  Résiliable à tout moment. Aucun frais d&apos;installation.
                </p>
                <ul className="mt-7 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-[#0F3F3A]/80"
                    >
                      <span className="mt-[7px] inline-block h-2 w-2 rounded-full bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    plan.popular
                      ? "bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] text-white hover:opacity-95"
                      : "border border-[#C9E6DF] text-[#0F3F3A] hover:bg-[#F1FAF8]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mx-auto mb-20 max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55 }}
            className="rounded-[36px] bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] px-8 py-12 text-center text-white md:px-12 md:py-16"
          >
            <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Prêt à simplifier les réservations de votre restaurant ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/90">
              Créez votre compte ZenGrow en quelques minutes et commencez à
              recevoir des réservations en ligne.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#0F3F3A] transition hover:scale-[1.02]"
            >
              Créer mon restaurant
            </Link>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
